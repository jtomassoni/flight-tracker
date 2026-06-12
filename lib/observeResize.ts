/** ResizeObserver with window/orientation polling fallback for iOS 10–12 Safari. */
export function observeResize(
  targets: Element | Element[],
  callback: () => void
): () => void {
  const list = (Array.isArray(targets) ? targets : [targets]).filter(Boolean);
  if (list.length === 0) return () => undefined;

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(callback);
  };

  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(schedule);
    list.forEach((el) => observer.observe(el));
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }

  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  schedule();
  const interval = window.setInterval(schedule, 2000);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
    window.clearInterval(interval);
  };
}
