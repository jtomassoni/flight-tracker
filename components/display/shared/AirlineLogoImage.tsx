'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { airlineLogoUrl, type AirlineBrand } from '@/lib/airlines';
import { drawLedAirlineMark, hasLedAirlineMark } from '@/lib/ledAirlineMarks';

type AirlineLogoImageProps = {
  brand: AirlineBrand;
  /** Render resolution for native marks. */
  size?: 64 | 128;
  background?: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  /** Upscale native marks to fill the canvas (source-asset previews). LED wall keeps 1×. */
  fillMark?: boolean;
};

export default function AirlineLogoImage({
  brand,
  size = 128,
  background = '#ffffff',
  alt,
  className,
  fill,
  width,
  height,
  fillMark = false,
}: AirlineLogoImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const useNative = hasLedAirlineMark(brand.icao);
  const approvedUrl = useNative ? undefined : airlineLogoUrl(brand);

  useEffect(() => {
    if (!useNative) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);

    const pad = Math.max(2, Math.floor(size * 0.06));
    drawLedAirlineMark(ctx, brand.icao, pad, pad, size - pad * 2, size - pad * 2, {
      maxScale: fillMark ? 16 : 1,
    });

    return undefined;
  }, [background, brand.icao, fillMark, size, useNative]);

  if (useNative) {
    return (
      <canvas
        ref={canvasRef}
        aria-label={alt ?? `${brand.name} logo`}
        className={className}
        style={
          fill
            ? { width: '100%', height: '100%', objectFit: 'contain', padding: '6%' }
            : {
                width: width ?? size,
                height: height ?? size,
                imageRendering: 'pixelated',
              }
        }
      />
    );
  }

  if (approvedUrl) {
    if (fill) {
      return (
        <Image
          src={approvedUrl}
          alt={alt ?? brand.name}
          fill
          className={className ?? 'object-contain p-2'}
          unoptimized
        />
      );
    }

    return (
      <Image
        src={approvedUrl}
        alt={alt ?? brand.name}
        width={width ?? size / 2}
        height={height ?? size / 2}
        className={className}
        unoptimized
      />
    );
  }

  const boxStyle = fill
    ? { width: '100%', height: '100%' }
    : { width: width ?? size / 2, height: height ?? size / 2 };

  return (
    <span
      role="img"
      aria-label={alt ?? `${brand.name} (${brand.iata})`}
      className={className}
      style={{
        ...boxStyle,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: brand.primaryColor,
        fontWeight: 700,
        fontSize: '0.7em',
        letterSpacing: '0.04em',
      }}
    >
      {brand.iata}
    </span>
  );
}
