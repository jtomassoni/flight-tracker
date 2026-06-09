import type { ReactNode } from 'react';
import type { AirlineBrand } from '@/lib/airlines';

type PixelAirlineLogoProps = {
  brand: AirlineBrand;
  size?: number;
};

const PIXEL = 4;

function Pixel({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <rect
      x={x * PIXEL}
      y={y * PIXEL}
      width={PIXEL}
      height={PIXEL}
      fill={color}
      className="pixel-airline-logo__dot"
    />
  );
}

/** Pixel-art tail logos for the Flight Wall Mini LED theme */
function AmericanTail() {
  const stripes: Array<{ y: number; color: string }> = [
    { y: 0, color: '#6ec8f0' },
    { y: 1, color: '#6ec8f0' },
    { y: 2, color: '#ffffff' },
    { y: 3, color: '#003087' },
    { y: 4, color: '#003087' },
    { y: 5, color: '#c8102e' },
    { y: 6, color: '#c8102e' },
  ];

  const pixels: ReactNode[] = [];
  for (let row = 0; row < 16; row += 1) {
    for (let col = 0; col < 16; col += 1) {
      const diag = Math.floor((col + row) / 2);
      const stripe = stripes[Math.min(diag, stripes.length - 1)];
      pixels.push(<Pixel key={`${col}-${row}`} x={col} y={row} color={stripe.color} />);
    }
  }
  return <>{pixels}</>;
}

function UnitedTail() {
  const pixels: ReactNode[] = [];
  for (let row = 0; row < 16; row += 1) {
    for (let col = 0; col < 16; col += 1) {
      const inGlobe =
        (col - 8) ** 2 + (row - 8) ** 2 < 36 && (col - 8) ** 2 + (row - 8) ** 2 > 9;
      const color = inGlobe ? '#ffffff' : '#0033a0';
      pixels.push(<Pixel key={`${col}-${row}`} x={col} y={row} color={color} />);
    }
  }
  return <>{pixels}</>;
}

function DeltaTail() {
  const pixels: ReactNode[] = [];
  for (let row = 0; row < 16; row += 1) {
    for (let col = 0; col < 16; col += 1) {
      const inWidget = row >= 4 && col >= 4 && col <= 11 && row <= 11 && col - row < 4 && row - col < 4;
      const color = inWidget ? '#c8102e' : '#003366';
      pixels.push(<Pixel key={`${col}-${row}`} x={col} y={row} color={color} />);
    }
  }
  return <>{pixels}</>;
}

function SouthwestTail() {
  const pixels: ReactNode[] = [];
  for (let row = 0; row < 16; row += 1) {
    for (let col = 0; col < 16; col += 1) {
      let color = '#304cb2';
      if (row < 5) color = '#6ec8f0';
      else if (row > 10) color = '#c8102e';
      else if (col > 10) color = '#ffb612';
      pixels.push(<Pixel key={`${col}-${row}`} x={col} y={row} color={color} />);
    }
  }
  return <>{pixels}</>;
}

function GenericTail({ brand }: { brand: AirlineBrand }) {
  const pixels: ReactNode[] = [];
  for (let row = 0; row < 16; row += 1) {
    for (let col = 0; col < 16; col += 1) {
      const border = row === 0 || row === 15 || col === 0 || col === 15;
      const fill =
        (row >= 4 && row <= 11 && col >= 4 && col <= 11) ||
        (row >= 6 && row <= 9 && col >= 2 && col <= 13);
      const color = border ? brand.accentColor : fill ? brand.primaryColor : '#0a0a0a';
      pixels.push(<Pixel key={`${col}-${row}`} x={col} y={row} color={color} />);
    }
  }
  return <>{pixels}</>;
}

const TAIL_RENDERERS: Record<string, () => ReactNode> = {
  AAL: AmericanTail,
  UAL: UnitedTail,
  DAL: DeltaTail,
  SWA: SouthwestTail,
};

export default function PixelAirlineLogo({ brand, size = 96 }: PixelAirlineLogoProps) {
  const Tail = TAIL_RENDERERS[brand.icao] ?? (() => <GenericTail brand={brand} />);

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className="pixel-airline-logo shrink-0"
      aria-hidden
    >
      <Tail />
    </svg>
  );
}
