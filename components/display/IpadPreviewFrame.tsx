'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IPAD_BEZEL_PX, IPAD_CHIN_PX, IPAD_SCREEN, type IpadOrientation } from '@/lib/kiosk';

type IpadPreviewFrameProps = {
  orientation: IpadOrientation;
  children: ReactNode;
};

export default function IpadPreviewFrame({ orientation, children }: IpadPreviewFrameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.85);
  const screen = IPAD_SCREEN[orientation];
  const deviceW = screen.width + IPAD_BEZEL_PX * 2;
  const deviceH = screen.height + IPAD_BEZEL_PX * 2 + IPAD_CHIN_PX;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const fit = () => {
      const pad = 56;
      const sx = (stage.clientWidth - pad) / deviceW;
      const sy = (stage.clientHeight - pad) / deviceH;
      setScale(Math.min(1, sx, sy));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [deviceW, deviceH]);

  return (
    <div
      ref={stageRef}
      className="ipad-preview-stage fixed inset-0 z-[50] flex items-center justify-center overflow-hidden bg-[#0c0c0e]"
    >
      <div
        className="ipad-preview-device"
        style={{
          width: deviceW,
          height: deviceH,
          transform: `scale(${scale})`,
        }}
      >
        <div className="ipad-preview-device__shell">
          <div className="ipad-preview-device__camera" aria-hidden />
          <div
            className="ipad-preview-device__screen"
            style={{ width: screen.width, height: screen.height }}
          >
            {children}
          </div>
          <div className="ipad-preview-device__home" aria-hidden />
        </div>
        <p className="ipad-preview-device__label">
          iPad preview · {orientation} · {screen.width}×{screen.height}
        </p>
      </div>
    </div>
  );
}
