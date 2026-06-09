'use client';

import { useEffect, useState } from 'react';

type SplitFlapTextProps = {
  value: string;
  className?: string;
  minChars?: number;
  size?: 'md' | 'lg';
};

function SplitFlapChar({ char, prevChar }: { char: string; prevChar: string }) {
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (char !== prevChar) {
      setFlipping(true);
      const t = setTimeout(() => setFlipping(false), 320);
      return () => clearTimeout(t);
    }
  }, [char, prevChar]);

  const display = char === ' ' ? '\u00A0' : char;

  return (
    <span className={`solari-flap ${flipping ? 'solari-flap--flip' : ''}`}>{display}</span>
  );
}

export default function SplitFlapText({
  value,
  className = '',
  minChars = 0,
  size = 'lg',
}: SplitFlapTextProps) {
  const [prev, setPrev] = useState(value);
  const normalized = value.toUpperCase();
  const padded = normalized.padEnd(minChars, ' ').slice(0, Math.max(minChars, normalized.length));

  useEffect(() => {
    const t = setTimeout(() => setPrev(normalized), 400);
    return () => clearTimeout(t);
  }, [normalized]);

  return (
    <span
      className={`solari-flaps ${size === 'md' ? 'solari-flaps--sm' : ''} ${className}`}
      aria-label={normalized}
    >
      {padded.split('').map((char, i) => (
        <SplitFlapChar key={`${i}-${padded.length}`} char={char} prevChar={(prev[i] ?? ' ').toUpperCase()} />
      ))}
    </span>
  );
}
