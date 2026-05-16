import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getIngestionHistory, IngestionSession } from '../api/ingestion.service';

export interface UseIngestionHistoryResult {
  sessions: IngestionSession[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useIngestionHistory(): UseIngestionHistoryResult {
  const [sessions, setSessions] = useState<IngestionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const { i18n } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getIngestionHistory()
      .then((data) => { if (!cancelled) setSessions(data); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick, i18n.language]);

  return {
    sessions,
    loading,
    error,
    refetch: () => setTick((n) => n + 1),
  };
}
