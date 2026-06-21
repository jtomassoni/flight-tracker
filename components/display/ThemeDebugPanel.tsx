'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useIsTouchDevice } from '@/hooks/useMediaQuery';
import type { ThemeId } from '@/lib/settings';
import { getTheme, THEME_IDS } from '@/lib/themes';
import './theme-debug-bar.css';

type MenuId = 'theme' | 'error';

type ThemeDebugPanelProps = {
  activeThemeId: ThemeId;
  isManual: boolean;
  previewError: boolean;
  onTogglePreviewError: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function IconPalette() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c-4.97 0-9 3.58-9 8 0 2.76 2.24 5 5 5h1.5a1.5 1.5 0 0 0 0-3H8c-1.1 0-2-.9-2-2 0-3.31 3.13-6 6-6s6 2.69 6 6c0 1.1-.9 2-2 2h-.5a1.5 1.5 0 0 0 0 3H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8.5" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
      <circle cx="15.5" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4 2.5 20h19L12 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </svg>
  );
}

function IconAirline() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 18h16M7 14l3-8 4 5 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarButton({
  label,
  active,
  open,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="theme-debug-bar__btn"
      data-active={active ? 'true' : 'false'}
      data-open={open ? 'true' : 'false'}
      aria-label={label}
      aria-expanded={open}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Flyout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="theme-debug-bar__flyout" role="menu">
      <p className="theme-debug-bar__title">{title}</p>
      {children}
    </div>
  );
}

export default function ThemeDebugPanel({
  activeThemeId,
  isManual,
  previewError,
  onTogglePreviewError,
  onPrev,
  onNext,
}: ThemeDebugPanelProps) {
  const isTouchKiosk = useIsTouchDevice();
  const theme = getTheme(activeThemeId);
  const index = THEME_IDS.indexOf(activeThemeId);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [openMenu]);

  if (isTouchKiosk) return null;

  const toggleMenu = (menu: MenuId) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const modeLabel = isManual ? 'Manual' : 'Fixed';

  return (
    <div ref={barRef} className="theme-debug-bar">
      <div className="theme-debug-bar__track">
        <div className="relative">
          <BarButton
            label="Theme navigation"
            active={isManual}
            open={openMenu === 'theme'}
            onClick={() => toggleMenu('theme')}
          >
            <IconPalette />
          </BarButton>
          {openMenu === 'theme' && (
            <Flyout title="Theme">
              <div className="theme-debug-bar__stack">
                <div>
                  <p className="theme-debug-bar__name">{theme.name}</p>
                  <p className="theme-debug-bar__meta">
                    {index + 1} / {THEME_IDS.length} · {theme.layout} · {modeLabel}
                  </p>
                </div>
                <div className="theme-debug-bar__row">
                  <button type="button" className="theme-debug-bar__action" onClick={onPrev}>
                    ← Prev
                  </button>
                  <button type="button" className="theme-debug-bar__action" onClick={onNext}>
                    Next →
                  </button>
                </div>
              </div>
            </Flyout>
          )}
        </div>

        <Link
          href="/admin/theme-tester"
          className="theme-debug-bar__btn"
          aria-label="Airline logo tester"
          title="Airline logo tester"
        >
          <IconAirline />
        </Link>

        <div className="relative">
          <BarButton
            label="Error screen preview"
            active={previewError}
            open={openMenu === 'error'}
            onClick={() => toggleMenu('error')}
          >
            <IconWarning />
          </BarButton>
          {openMenu === 'error' && (
            <Flyout title="Error Screen">
              <div className="theme-debug-bar__stack">
                <button
                  type="button"
                  className={`theme-debug-bar__action ${
                    previewError ? 'theme-debug-bar__action--primary' : ''
                  }`}
                  onClick={onTogglePreviewError}
                >
                  {previewError ? 'Preview ON' : 'Preview OFF'}
                </button>
                <p className="theme-debug-bar__hint">
                  {previewError
                    ? 'Showing the live-feed error screen. Use Prev/Next to see it in each theme.'
                    : 'Preview the “feed unavailable” screen against the current theme.'}
                </p>
              </div>
            </Flyout>
          )}
        </div>
      </div>
    </div>
  );
}
