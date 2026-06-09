import Image from 'next/image';
import type { AirlineBrand } from '@/lib/airlines';
import { airlineLogoUrl, getAirlineLedWallStyle } from '@/lib/airlines';

type LedAirlineLogoProps = {
  brand: AirlineBrand;
  size?: number;
};

export default function LedAirlineLogo({ brand, size = 88 }: LedAirlineLogoProps) {
  const style = getAirlineLedWallStyle(brand);

  return (
    <div
      className="flight-wall-mini__logo-tile relative shrink-0 overflow-hidden rounded-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: style.logoBackground,
        borderColor: style.logoBorder,
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: style.accentStripe }}
        aria-hidden
      />
      <div className="relative h-full w-full p-2.5">
        <Image
          src={airlineLogoUrl(brand, 128)}
          alt=""
          fill
          className="object-contain object-center"
          unoptimized
        />
      </div>
    </div>
  );
}
