'use client';

import { useRef, useState } from 'react';
import { useIsTouchDevice } from '@/hooks/useMediaQuery';
import type { ThemeId } from '@/lib/settings';
import { getTheme, THEME_IDS } from '@/lib/themes';

type ThemeDebugPanelProps = {
  activeThemeId: ThemeId;
  isManual: boolean;
  autoRotateEnabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  onResumeAuto: () => void;
};

export default function ThemeDebugPanel({
  activeThemeId,
  isManual,
  autoRotateEnabled,
  onPrev,
  onNext,
  onResumeAuto,
}: ThemeDebugPanelProps) {
  const isTouchKiosk = useIsTouchDevice();
  const theme = getTheme(activeThemeId);
  const index = THEME_IDS.indexOf(activeThemeId);
  const [pos, setPos] = useState({ x: 16, y: 80 });
  const drag = useRef<{ pointerX: number; pointerY: number; posX: number; posY: number } | null>(
    null
  );

  const onDragStart = (e: React.PointerEvent) => {
    drag.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos({
      x: drag.current.posX + (e.clientX - drag.current.pointerX),
      y: drag.current.posY + (e.clientY - drag.current.pointerY),
    });
  };

  const onDragEnd = () => {
    drag.current = null;
  };

  if (isTouchKiosk) return null;

  return (
    <div
      className="fixed z-[200] w-56 select-none rounded-xl border border-white/20 bg-black/75 text-white shadow-2xl backdrop-blur-md"
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
    >
      <div
        className="flex cursor-grab items-center justify-between border-b border-white/10 px-3 py-2 active:cursor-grabbing"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
          Theme Tester
        </span>
        <span className="text-[10px] text-white/40">⠿ drag</span>
      </div>

      <div className="px-3 py-2">
        <p className="truncate text-sm font-semibold">{theme.name}</p>
        <p className="text-[10px] text-white/50">
          {index + 1} / {THEME_IDS.length} · {theme.layout}
        </p>
        <p className="mt-1 text-[10px] text-white/40">
          {isManual ? 'Manual' : autoRotateEnabled ? 'Auto-rotating' : 'Fixed'}
        </p>
      </div>

      <div className="flex gap-2 px-3 pb-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 rounded-lg border border-white/15 bg-white/10 py-2 text-sm font-medium hover:bg-white/20"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-lg border border-white/15 bg-white/10 py-2 text-sm font-medium hover:bg-white/20"
        >
          Next →
        </button>
      </div>

      {autoRotateEnabled && (
        <div className="border-t border-white/10 px-3 py-2">
          <button
            type="button"
            onClick={onResumeAuto}
            disabled={!isManual}
            className="w-full rounded-lg py-1.5 text-xs text-sky-300 hover:bg-white/10 disabled:opacity-30"
          >
            Resume auto-rotate
          </button>
        </div>
      )}
    </div>
  );
}
