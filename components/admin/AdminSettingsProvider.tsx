'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type DisplaySettings,
} from '@/lib/settings';

type AdminSettingsContextValue = {
  settings: DisplaySettings;
  zipInput: string;
  setZipInput: (value: string) => void;
  saved: boolean;
  zipError: string | null;
  zipLoading: boolean;
  update: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void;
  updateAndSave: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void;
  handleZipLookup: () => Promise<void>;
  handleSave: () => Promise<void>;
  handleReset: () => void;
};

const AdminSettingsContext = createContext<AdminSettingsContextValue | null>(null);

export function AdminSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);
  const [zipInput, setZipInput] = useState(DEFAULT_SETTINGS.zipCode);
  const [saved, setSaved] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setZipInput(loaded.zipCode);
  }, []);

  const setZipInputValue = useCallback((value: string) => {
    setZipInput(value);
    setZipError(null);
    setSaved(false);
  }, []);

  const update = useCallback(<K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const updateAndSave = useCallback(<K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, []);

  const lookupZip = useCallback(async (zip: string) => {
    const normalized = zip.replace(/\D/g, '').slice(0, 5);
    if (normalized.length !== 5) {
      throw new Error('Enter a valid 5-digit US ZIP code');
    }

    const res = await fetch(`/api/geocode?zip=${normalized}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'ZIP lookup failed');
    return data as {
      zipCode: string;
      lat: number;
      lon: number;
      locationLabel: string;
    };
  }, []);

  const handleZipLookup = useCallback(async () => {
    setZipLoading(true);
    setZipError(null);
    try {
      const result = await lookupZip(zipInput);
      setSettings((prev) => ({
        ...prev,
        zipCode: result.zipCode,
        lat: result.lat,
        lon: result.lon,
        locationLabel: result.locationLabel,
      }));
      setZipInput(result.zipCode);
    } catch (err) {
      setZipError(err instanceof Error ? err.message : 'ZIP lookup failed');
    } finally {
      setZipLoading(false);
    }
  }, [lookupZip, zipInput]);

  const handleSave = useCallback(async () => {
    setZipError(null);
    try {
      let toSave = settings;

      const normalizedInput = zipInput.replace(/\D/g, '').slice(0, 5);
      if (normalizedInput !== settings.zipCode) {
        setZipLoading(true);
        const result = await lookupZip(normalizedInput);
        toSave = {
          ...settings,
          zipCode: result.zipCode,
          lat: result.lat,
          lon: result.lon,
          locationLabel: result.locationLabel,
        };
        setSettings(toSave);
        setZipInput(result.zipCode);
        setZipLoading(false);
      }

      saveSettings(toSave);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setZipError(err instanceof Error ? err.message : 'Save failed');
      setZipLoading(false);
    }
  }, [lookupZip, settings, zipInput]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setZipInput(DEFAULT_SETTINGS.zipCode);
    saveSettings(DEFAULT_SETTINGS);
    setSaved(true);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      zipInput,
      setZipInput: setZipInputValue,
      saved,
      zipError,
      zipLoading,
      update,
      updateAndSave,
      handleZipLookup,
      handleSave,
      handleReset,
    }),
    [
      settings,
      zipInput,
      setZipInputValue,
      saved,
      zipError,
      zipLoading,
      update,
      updateAndSave,
      handleZipLookup,
      handleSave,
      handleReset,
    ]
  );

  return (
    <AdminSettingsContext.Provider value={value}>{children}</AdminSettingsContext.Provider>
  );
}

export function useAdminSettings(): AdminSettingsContextValue {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) {
    throw new Error('useAdminSettings must be used within AdminSettingsProvider');
  }
  return ctx;
}
