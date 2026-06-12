'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useIsTouchDevice } from '@/hooks/useMediaQuery';
import { THEME_ROTATION_SEC } from '@/lib/constants';
import type { IpadOrientation } from '@/lib/kiosk';
import type { ThemeId } from '@/lib/settings';
import { getTheme, THEME_IDS } from '@/lib/themes';
import './theme-debug-bar.css';

type MenuId = 'theme' | 'rotate' | 'ipad';

type ThemeDebugPanelProps = {
  activeThemeId: ThemeId;
  isManual: boolean;
  autoRotateEnabled: boolean;
  ipadPreview: boolean;
  ipadOrientation: IpadOrientation;
  onToggleIpadPreview: () => void;
  onRotateIpad: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleAutoRotate: () => void;
  onResumeAuto: () => void;
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

function IconRotate() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTablet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="18" r="0.75" fill="currentColor" />
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
  autoRotateEnabled,
  ipadPreview,
  ipadOrientation,
  onToggleIpadPreview,
  onRotateIpad,
  onPrev,
  onNext,
  onToggleAutoRotate,
  onResumeAuto,
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

  const modeLabel = isManual ? 'Manual' : autoRotateEnabled ? 'Auto-rotating' : 'Fixed';

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
                {autoRotateEnabled && (
                  <button
                    type="button"
                    className="theme-debug-bar__action theme-debug-bar__action--primary"
                    onClick={onResumeAuto}
                    disabled={!isManual}
                  >
                    Resume auto-rotate
                  </button>
                )}
              </div>
            </Flyout>
          )}
        </div>

        <div className="relative">
          <BarButton
            label="Auto-rotate settings"
            active={autoRotateEnabled}
            open={openMenu === 'rotate'}
            onClick={() => toggleMenu('rotate')}
          >
            <IconRotate />
          </BarButton>
          {openMenu === 'rotate' && (
            <Flyout title="Rotation">
              <div className="theme-debug-bar__stack">
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoRotateEnabled}
                  className="theme-debug-bar__switch"
                  onClick={onToggleAutoRotate}
                >
                  <span className="theme-debug-bar__switch-label">
                    Auto-rotate ({THEME_ROTATION_SEC}s)
                  </span>
                  <span
                    data-checked={autoRotateEnabled ? 'true' : 'false'}
                    className="theme-debug-bar__toggle"
                    aria-hidden
                  />
                </button>
                <p className="theme-debug-bar__hint">
                  {autoRotateEnabled
                    ? 'Themes cycle automatically. Use Prev/Next to override temporarily.'
                    : 'Themes stay on the selected layout until you change it in admin.'}
                </p>
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
            label="iPad preview"
            active={ipadPreview}
            open={openMenu === 'ipad'}
            onClick={() => toggleMenu('ipad')}
          >
            <IconTablet />
          </BarButton>
          {openMenu === 'ipad' && (
            <Flyout title="iPad Preview">
              <div className="theme-debug-bar__stack">
                <button
                  type="button"
                  className={`theme-debug-bar__action ${
                    ipadPreview ? 'theme-debug-bar__action--primary' : ''
                  }`}
                  onClick={onToggleIpadPreview}
                >
                  {ipadPreview ? 'Preview ON' : 'Preview OFF'}
                </button>
                {ipadPreview && (
                  <button type="button" className="theme-debug-bar__action" onClick={onRotateIpad}>
                    Rotate ↻ {ipadOrientation === 'landscape' ? 'Landscape' : 'Portrait'}
                  </button>
                )}
                <p className="theme-debug-bar__hint">
                  {ipadPreview
                    ? 'Themes render at iPad size with reduced detail — same as a desk kiosk.'
                    : 'Simulate a 10.9″ iPad in a device frame.'}
                </p>
              </div>
            </Flyout>
          )}
        </div>
      </div>
    </div>
  );
}
