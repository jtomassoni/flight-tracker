'use client';

import { useEffect, useRef } from 'react';
import { useKioskPreview } from '@/contexts/KioskPreviewContext';
import type { LedFlightContent } from '@/lib/ledMatrix';
import {
  ledGridForOrientation,
  ledWallRowCount,
  loadLedLogo,
  paintLedDots,
  renderLedBuffer,
} from '@/lib/ledMatrix';
import type { IpadOrientation } from '@/lib/kiosk';

type LedMatrixCanvasProps = {
  orientation: IpadOrientation;
  content: LedFlightContent;
  className?: string;
};

export default function LedMatrixCanvas({
  orientation,
  content,
  className,
}: LedMatrixCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const { enabled: ipadPreview } = useKioskPreview();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const { cols, rows: baseRows } = ledGridForOrientation(orientation);
    const buffer = bufferRef.current ?? document.createElement('canvas');
    bufferRef.current = buffer;

    const bufferCtx = buffer.getContext('2d', { willReadFrequently: true });
    if (!bufferCtx) return undefined;

    let cancelled = false;
    let logo: HTMLImageElement | null = null;

    const draw = () => {
      if (cancelled || !canvasRef.current || !bufferCtx) return;

      const displayCtx = canvasRef.current.getContext('2d');
      if (!displayCtx) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));

      if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }

      const rows = ipadPreview
        ? baseRows
        : ledWallRowCount(cols, baseRows, width, height);
      if (buffer.width !== cols || buffer.height !== rows) {
        buffer.width = cols;
        buffer.height = rows;
      }

      const { logoRect } = renderLedBuffer(bufferCtx, cols, rows, content, logo);
      const imageData = bufferCtx.getImageData(0, 0, cols, rows);
      paintLedDots(displayCtx, imageData, width, height, logoRect, {
        fitFrame: ipadPreview,
        logoBackground: content.logoBackground,
      });
    };

    const loadAndDraw = async () => {
      logo = content.logoUrl ? await loadLedLogo(content.logoUrl) : null;
      if (cancelled) return;
      draw();
    };

    void loadAndDraw();

    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [orientation, content, ipadPreview]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label={`${content.airlineName} ${content.routeHero}`}
    />
  );
}
