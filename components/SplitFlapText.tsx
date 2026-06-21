'use client';

import { memo, useEffect, useRef, useState } from 'react';
import {
  normalizeSplitFlapChar,
  sleep,
  SPLIT_FLAP_DURATION_MS,
  SPLIT_FLAP_STAGGER_MS,
  SPLIT_FLAP_STEP_GAP_MS,
  splitFlapSteps,
} from '@/lib/splitFlapCharset';

type SplitFlapTextProps = {
  value: string;
  className?: string;
  minChars?: number;
  maxChars?: number;
  size?: 'md' | 'lg';
  staggerMs?: number;
};

function flapGlyph(char: string): string {
  return char === ' ' ? '\u00A0' : char;
}

function padFlapValue(value: string, minChars: number, maxChars?: number): string {
  const normalized = value.toUpperCase();
  const trimmed = maxChars ? normalized.slice(0, maxChars) : normalized;
  const targetLen = Math.max(minChars, trimmed.length);
  return targetLen > trimmed.length
    ? trimmed.padEnd(targetLen, ' ').slice(0, targetLen)
    : trimmed;
}

function paddedEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (normalizeSplitFlapChar(a[i] ?? ' ') !== normalizeSplitFlapChar(b[i] ?? ' ')) {
      return false;
    }
  }
  return true;
}

function FlapHalf({ char, half }: { char: string; half: 'top' | 'bottom' }) {
  return (
    <span className={`solari-flap__half-pane solari-flap__half-pane--${half}`}>
      <span className="solari-flap__glyph">{flapGlyph(char)}</span>
    </span>
  );
}

const SplitFlapChar = memo(function SplitFlapChar({
  char,
  animate,
  flipDelay,
}: {
  char: string;
  animate: boolean;
  flipDelay: number;
}) {
  const target = normalizeSplitFlapChar(char);
  const displayedRef = useRef(target);
  const runIdRef = useRef(0);
  const flipGenRef = useRef(0);
  const flipDelayRef = useRef(flipDelay);
  flipDelayRef.current = flipDelay;

  const [displayed, setDisplayed] = useState(target);
  const [flipping, setFlipping] = useState(false);
  const [fromChar, setFromChar] = useState(target);
  const [toChar, setToChar] = useState(target);
  const [flipGen, setFlipGen] = useState(0);
  const flipDoneRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (target === displayedRef.current) return undefined;

    if (!animate) {
      displayedRef.current = target;
      setDisplayed(target);
      setFromChar(target);
      setToChar(target);
      setFlipping(false);
      return undefined;
    }

    const runId = ++runIdRef.current;
    const steps = splitFlapSteps(displayedRef.current, target);
    const sequence = steps.length > 0 ? steps : [target];

    const run = async () => {
      await sleep(flipDelayRef.current);

      for (const step of sequence) {
        if (runId !== runIdRef.current) return;

        const from = displayedRef.current;
        setFromChar(from);
        setToChar(step);
        flipGenRef.current += 1;
        setFlipGen(flipGenRef.current);
        setFlipping(true);

        await new Promise<void>((resolve) => {
          const done = () => resolve();
          const timer = setTimeout(done, SPLIT_FLAP_DURATION_MS + 50);
          flipDoneRef.current = () => {
            clearTimeout(timer);
            done();
          };
        });

        if (runId !== runIdRef.current) return;

        displayedRef.current = step;
        setDisplayed(step);
        setFlipping(false);

        if (step !== sequence[sequence.length - 1]) {
          await sleep(SPLIT_FLAP_STEP_GAP_MS);
        }
      }
    };

    void run();
    return () => {
      runIdRef.current += 1;
      flipDoneRef.current = null;
      // Snap to target so tiles never stay blank if a re-render cancels mid-flip.
      displayedRef.current = target;
      setDisplayed(target);
      setFromChar(target);
      setToChar(target);
      setFlipping(false);
    };
  }, [target, animate]);

  const onFoldEnd = (event: React.AnimationEvent<HTMLSpanElement>) => {
    if (event.animationName !== 'solariFoldTop') return;
    flipDoneRef.current?.();
    flipDoneRef.current = null;
  };

  return (
    <span className="solari-flap" aria-hidden>
      <span className="solari-flap__well">
        <span className="solari-flap__viewport">
          <span className="solari-flap__static solari-flap__static--top">
            <FlapHalf char={displayed} half="top" />
          </span>
          <span className="solari-flap__static solari-flap__static--bottom">
            <FlapHalf char={flipping ? fromChar : displayed} half="bottom" />
          </span>

          {flipping && (
            <>
              <span
                key={`fold-${flipGen}`}
                className="solari-flap__motion solari-flap__motion--fold-top"
                onAnimationEnd={onFoldEnd}
              >
                <span className="solari-flap__face solari-flap__face--front">
                  <FlapHalf char={fromChar} half="top" />
                </span>
                <span className="solari-flap__face solari-flap__face--back">
                  <FlapHalf char={toChar} half="top" />
                </span>
              </span>
              <span key={`unfold-${flipGen}`} className="solari-flap__motion solari-flap__motion--unfold-bottom">
                <FlapHalf char={toChar} half="bottom" />
              </span>
            </>
          )}
        </span>

        <span className="solari-flap__hinge" aria-hidden />
      </span>
    </span>
  );
});

function SplitFlapText({
  value,
  className = '',
  minChars = 0,
  maxChars,
  size = 'lg',
  staggerMs = SPLIT_FLAP_STAGGER_MS,
}: SplitFlapTextProps) {
  const padded = padFlapValue(value, minChars, maxChars);
  const [prevPadded, setPrevPadded] = useState(padded);

  useEffect(() => {
    if (paddedEquals(padded, prevPadded)) return undefined;

    const maxSteps = padded.length;
    const maxDelay = maxSteps * staggerMs;
    const cascadeMs =
      maxSteps * (SPLIT_FLAP_DURATION_MS + SPLIT_FLAP_STEP_GAP_MS) * 3 + maxDelay;
    const t = setTimeout(() => setPrevPadded(padded), cascadeMs);
    return () => clearTimeout(t);
  }, [padded, prevPadded, staggerMs]);

  return (
    <span
      className={`solari-flaps ${size === 'md' ? 'solari-flaps--sm' : ''} ${className}`.trim()}
      aria-label={padded.trim()}
    >
      {padded.split('').map((char, i) => {
        const changed =
          normalizeSplitFlapChar(char) !== normalizeSplitFlapChar(prevPadded[i] ?? ' ');
        return (
          <SplitFlapChar
            key={i}
            char={char}
            animate={changed}
            flipDelay={changed ? i * staggerMs : 0}
          />
        );
      })}
    </span>
  );
}

export default memo(SplitFlapText);
