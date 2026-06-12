'use client';

import { useEffect, useRef } from 'react';
import type { LedLogoTileContent } from '@/lib/ledMatrix';
import { drawLedLogoTile, paintLedDots } from '@/lib/ledMatrix';

const TILE_SIZE = 48;
const DEFAULT_ZOOM = 8;

type AirlineLedLogoTileProps = {
  content: LedLogoTileContent;
  label?: string;
  zoom?: number;
  /** CSS display size — render resolution stays at `zoom`. */
  displaySize?: number;
  className?: string;
};

export default function AirlineLedLogoTile({
  content,
  label,
  zoom = DEFAULT_ZOOM,
  displaySize,
  className,
}: AirlineLedLogoTileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const size = displaySize ?? TILE_SIZE * zoom;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const buffer = bufferRef.current ?? document.createElement('canvas');
    bufferRef.current = buffer;
    buffer.width = TILE_SIZE;
    buffer.height = TILE_SIZE;

    const bufferCtx = buffer.getContext('2d', { willReadFrequently: true });
    if (!bufferCtx) return undefined;

    let cancelled = false;

    const draw = async () => {
      bufferCtx.fillStyle = '#000000';
      bufferCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

      const logoRect = await drawLedLogoTile(bufferCtx, TILE_SIZE, content);
      if (cancelled || !canvasRef.current || !bufferCtx) return;

      const displayCtx = canvasRef.current.getContext('2d');
      if (!displayCtx) return;

      const width = TILE_SIZE * zoom;
      const height = TILE_SIZE * zoom;
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      const imageData = bufferCtx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
      paintLedDots(displayCtx, imageData, width, height, logoRect, {
        fitFrame: true,
        logoBackground: content.logoBackground,
        logoPalette: content.logoPalette,
      });
    };

    void draw();

    return () => {
      cancelled = true;
    };
  }, [content, zoom]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? 'airline-led-tile'}
      style={{ width: size, height: size }}
      aria-label={label ?? `${content.logoIcao} LED logo tile`}
    />
  );
}
