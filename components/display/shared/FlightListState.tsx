type FlightListStateProps = {
  status: string;
  count: number;
  loadingMessage?: string;
  emptyMessage?: string;
};

export default function FlightListState({
  status,
  count,
  loadingMessage = 'Loading aircraft…',
  emptyMessage = 'No aircraft match current filters.',
}: FlightListStateProps) {
  if (status === 'loading' && count === 0) {
    return <p className="py-12 text-center font-mono text-muted">{loadingMessage}</p>;
  }
  if (count === 0 && status !== 'loading') {
    return <p className="py-12 text-center font-mono text-muted">{emptyMessage}</p>;
  }
  return null;
}
