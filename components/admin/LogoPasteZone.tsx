'use client';

import { useRef, useState } from 'react';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(blob);
  });
}

type LogoPasteZoneProps = {
  busy?: boolean;
  onImage: (dataUrl: string) => Promise<void> | void;
  title?: string;
  hint?: string;
  className?: string;
};

/** Use the first image on the clipboard — one paste, one upload. */
async function firstClipboardImage(
  clip: Clipboard & { read?: () => Promise<ClipboardItem[]> }
): Promise<Blob | null> {
  if (!clip.read) return null;

  const items = await clip.read();
  for (const item of items) {
    const type = item.types.find((t) => t === 'image/png' || t === 'image/jpeg' || t === 'image/webp')
      ?? item.types.find((t) => t.startsWith('image/'));
    if (type) return item.getType(type);
  }
  return null;
}

function firstPasteImage(items: DataTransferItemList): Blob | null {
  for (const item of items) {
    if (!item.type.startsWith('image/')) continue;
    const blob = item.getAsFile();
    if (blob) return blob;
  }
  return null;
}

/** Click to pull an image from the clipboard, or focus + ⌘V/Ctrl+V. */
export default function LogoPasteZone({
  busy = false,
  onImage,
  title,
  hint,
  className = 'logo-approve__paste',
}: LogoPasteZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [localHint, setLocalHint] = useState<string | null>(null);

  const uploadBlob = async (blob: Blob) => {
    if (!blob.type.startsWith('image/')) {
      setLocalHint('Clipboard item is not an image');
      return;
    }
    setLocalHint(null);
    const dataUrl = await blobToDataUrl(blob);
    await onImage(dataUrl);
  };

  const grabFromClipboard = async () => {
    const clip = navigator.clipboard as Clipboard & {
      read?: () => Promise<ClipboardItem[]>;
    };
    if (!clip?.read) {
      setLocalHint('Press ⌘V / Ctrl+V to paste');
      ref.current?.focus();
      return;
    }
    try {
      const blob = await firstClipboardImage(clip);
      if (!blob) {
        setLocalHint('No image on clipboard — copy a screenshot first');
        return;
      }
      await uploadBlob(blob);
    } catch {
      setLocalHint('Press ⌘V / Ctrl+V to paste');
      ref.current?.focus();
    }
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const blob = firstPasteImage(event.clipboardData?.items ?? []);
    if (!blob) {
      setLocalHint('No image in paste — copy a screenshot first');
      return;
    }
    event.preventDefault();
    await uploadBlob(blob);
  };

  const defaultHint = 'Click to grab from clipboard or press ⌘V — replaces the current logo';

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Paste logo from clipboard"
      className={className}
      data-busy={busy ? 'true' : 'false'}
      onClick={grabFromClipboard}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          grabFromClipboard();
        }
      }}
      onPaste={handlePaste}
    >
      <span className="logo-approve__paste-title">
        {busy ? 'Saving…' : (title ?? 'Paste logo screenshot')}
      </span>
      <span className="logo-approve__paste-hint">{localHint ?? hint ?? defaultHint}</span>
    </div>
  );
}
