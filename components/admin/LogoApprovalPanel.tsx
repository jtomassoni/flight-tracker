'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type CandidateAsset = { file: string; url: string };

type CatalogEntry = {
  icao: string;
  name: string;
  iata: string;
  candidates: CandidateAsset[];
  approved: (CandidateAsset & { source?: string; approvedAt?: string }) | null;
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(blob);
  });
}

/** Click to pull an image straight off the clipboard, or focus + ⌘V/Ctrl+V. */
function PasteZone({
  busy,
  onImage,
}: {
  busy: boolean;
  onImage: (dataUrl: string) => Promise<void> | void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState<string | null>(null);

  const handleBlob = async (blob: Blob) => {
    if (!blob.type.startsWith('image/')) {
      setHint('Clipboard item is not an image');
      return;
    }
    setHint(null);
    const dataUrl = await blobToDataUrl(blob);
    await onImage(dataUrl);
  };

  const grabFromClipboard = async () => {
    const clip = navigator.clipboard as Clipboard & {
      read?: () => Promise<ClipboardItem[]>;
    };
    if (!clip?.read) {
      setHint('Press ⌘V / Ctrl+V to paste');
      ref.current?.focus();
      return;
    }
    try {
      const items = await clip.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith('image/'));
        if (type) {
          await handleBlob(await item.getType(type));
          return;
        }
      }
      setHint('No image on clipboard — copy a screenshot first');
    } catch {
      // Permission denied / not supported — fall back to keyboard paste.
      setHint('Press ⌘V / Ctrl+V to paste');
      ref.current?.focus();
    }
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          event.preventDefault();
          await handleBlob(blob);
          return;
        }
      }
    }
    setHint('No image in paste — copy a screenshot first');
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Paste screenshot from clipboard"
      className="logo-approve__paste"
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
        {busy ? 'Saving…' : 'Paste screenshot'}
      </span>
      <span className="logo-approve__paste-hint">
        {hint ?? 'Click to grab from clipboard, or focus and press ⌘V'}
      </span>
    </div>
  );
}

function CarrierCard({
  entry,
  busy,
  onApprove,
  onUnapprove,
  onPasteImage,
  onDelete,
}: {
  entry: CatalogEntry;
  busy: boolean;
  onApprove: (file: string) => void;
  onUnapprove: () => void;
  onPasteImage: (dataUrl: string) => Promise<void> | void;
  onDelete: (file: string) => void;
}) {
  const approvedSource = entry.approved?.source;

  return (
    <article className="logo-approve__card" data-approved={entry.approved ? 'true' : 'false'}>
      <header className="logo-approve__card-head">
        <div>
          <p className="logo-approve__name">{entry.name}</p>
          <p className="logo-approve__codes admin-mono">
            {entry.icao} · {entry.iata}
          </p>
        </div>
        <span
          className={`logo-approve__status logo-approve__status--${entry.approved ? 'ok' : 'pending'}`}
        >
          {entry.approved ? 'Approved' : 'Needs logo'}
        </span>
      </header>

      <div className="logo-approve__card-body">
        <div className="logo-approve__approved">
          <p className="logo-approve__sublabel">Approved source of truth</p>
          <div className="logo-approve__approved-box">
            {entry.approved ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entry.approved.url} alt={`${entry.name} approved logo`} />
            ) : (
              <span className="logo-approve__placeholder">None yet</span>
            )}
          </div>
          {entry.approved && (
            <button
              type="button"
              className="admin-btn admin-btn--ghost logo-approve__btn-sm"
              onClick={onUnapprove}
              disabled={busy}
            >
              Clear approval
            </button>
          )}
        </div>

        <div className="logo-approve__candidates">
          <p className="logo-approve__sublabel">
            Candidates {entry.candidates.length > 0 ? `(${entry.candidates.length})` : ''}
          </p>
          {entry.candidates.length === 0 ? (
            <p className="logo-approve__hint">
              No candidates yet. Paste a screenshot below.
            </p>
          ) : (
            <ul className="logo-approve__thumbs">
              {entry.candidates.map((cand) => {
                const isApprovedSource = cand.file === approvedSource;
                return (
                  <li key={cand.file} className="logo-approve__thumb">
                    <div
                      className="logo-approve__thumb-box"
                      data-current={isApprovedSource ? 'true' : 'false'}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cand.url} alt={cand.file} />
                      <button
                        type="button"
                        className="logo-approve__thumb-del"
                        title="Delete candidate"
                        aria-label={`Delete ${cand.file}`}
                        onClick={() => onDelete(cand.file)}
                        disabled={busy}
                      >
                        ×
                      </button>
                    </div>
                    <button
                      type="button"
                      className="admin-btn logo-approve__btn-sm"
                      onClick={() => onApprove(cand.file)}
                      disabled={busy || isApprovedSource}
                    >
                      {isApprovedSource ? 'Current' : 'Approve'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <PasteZone busy={busy} onImage={onPasteImage} />
        </div>
      </div>
    </article>
  );
}

export default function LogoApprovalPanel() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIcao, setBusyIcao] = useState<string | null>(null);
  const [showApproved, setShowApproved] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/airline-logos', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Catalog request failed (${res.status})`);
    const data = await res.json();
    setCatalog(data.catalog ?? []);
  }, []);

  useEffect(() => {
    refresh()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [refresh]);

  const runAction = useCallback(
    async (icao: string, body: Record<string, unknown>) => {
      setBusyIcao(icao);
      setError(null);
      try {
        const res = await fetch('/api/airline-logos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icao, ...body }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Action failed');
      } finally {
        setBusyIcao(null);
      }
    },
    [refresh]
  );

  const handlePasteImage = useCallback(
    async (icao: string, dataUrl: string) => {
      setBusyIcao(icao);
      setError(null);
      try {
        const res = await fetch('/api/airline-logos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'upload', icao, dataUrl }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? `Paste failed (${res.status})`);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Paste failed');
      } finally {
        setBusyIcao(null);
      }
    },
    [refresh]
  );

  const approvedCount = catalog.filter((c) => c.approved).length;
  const pendingCount = catalog.length - approvedCount;
  const visible = showApproved ? catalog : catalog.filter((c) => !c.approved);

  return (
    <div className="logo-approve">
      <div className="logo-approve__toolbar">
        <p className="logo-approve__tip">
          Paste a logo screenshot onto a carrier, then approve one as its source of
          truth (saved to <code className="admin-mono">public/airline-logos/</code>).
        </p>
        <div className="logo-approve__toolbar-controls">
          <span className="logo-approve__progress admin-mono">
            {approvedCount}/{catalog.length || '—'} approved
          </span>
          <div className="logo-approve__filter" role="tablist" aria-label="Filter carriers">
            <button
              type="button"
              role="tab"
              aria-selected={!showApproved}
              data-active={!showApproved ? 'true' : 'false'}
              className="logo-approve__filter-btn"
              onClick={() => setShowApproved(false)}
            >
              Needs logo ({pendingCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showApproved}
              data-active={showApproved ? 'true' : 'false'}
              className="logo-approve__filter-btn"
              onClick={() => setShowApproved(true)}
            >
              All ({catalog.length})
            </button>
          </div>
        </div>
      </div>

      {error && <div className="logo-approve__error">{error}</div>}

      {loading ? (
        <p className="logo-approve__hint">Loading catalog…</p>
      ) : visible.length === 0 ? (
        <p className="logo-approve__hint">
          {showApproved
            ? 'No carriers in the catalog.'
            : 'All carriers have approved logos. Switch to “All” to review them.'}
        </p>
      ) : (
        <div className="logo-approve__grid">
          {visible.map((entry) => (
            <CarrierCard
              key={entry.icao}
              entry={entry}
              busy={busyIcao === entry.icao}
              onApprove={(file) => runAction(entry.icao, { action: 'approve', file })}
              onUnapprove={() => runAction(entry.icao, { action: 'unapprove' })}
              onDelete={(file) => runAction(entry.icao, { action: 'delete', file })}
              onPasteImage={(dataUrl) => handlePasteImage(entry.icao, dataUrl)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
