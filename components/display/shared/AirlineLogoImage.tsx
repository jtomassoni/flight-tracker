'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useLogoManifestRevision } from '@/components/LogoManifestProvider';
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
  /** Fresh URL from the logo catalog API (mtime cache-bust). */
  logoUrl?: string;
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
  logoUrl: logoUrlOverride,
}: AirlineLogoImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoManifestRevision = useLogoManifestRevision();
  const useNative = hasLedAirlineMark(brand.icao);
  const approvedUrl = useMemo(
    () => (useNative ? undefined : (logoUrlOverride ?? airlineLogoUrl(brand))),
    [brand, logoUrlOverride, logoManifestRevision, useNative]
  );

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
        <span className={`relative block ${className ?? ''}`} style={{ width: '100%', height: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={approvedUrl}
            src={approvedUrl}
            alt={alt ?? brand.name}
            className="h-full w-full object-contain p-2"
          />
        </span>
      );
    }

    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        key={approvedUrl}
        src={approvedUrl}
        alt={alt ?? brand.name}
        width={width ?? size / 2}
        height={height ?? size / 2}
        className={className}
      />
    );
  }

  const boxStyle = fill
    ? { width: '100%', height: '100%' }
    : { width: width ?? size / 2, height: height ?? size / 2 };

  return (
    <span
      role="img"
      aria-label={alt ?? brand.name}
      className={className}
      style={{
        ...boxStyle,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: brand.primaryColor,
        fontWeight: 700,
        fontSize: fill ? 'clamp(0.42em, 2.4vw, 0.62em)' : '0.55em',
        lineHeight: 1.1,
        letterSpacing: '0.02em',
        textAlign: 'center',
        padding: '0.12em',
        overflow: 'hidden',
        wordBreak: 'break-word',
      }}
    >
      {brand.name}
    </span>
  );
}
