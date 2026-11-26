'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { AirQualityResponse } from '@/types';

/** Live air-quality readings for the household's selected location. */
export function useLiveConditions() {
  const { currentLocation } = useAppStore();
  const { lat, lon, name, country } = currentLocation;
  const [data, setData] = useState<AirQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ lat: String(lat), lon: String(lon), city: name, country });
        const res = await fetch(`/api/air-quality?${params}`, { signal });
        if (!res.ok) throw new Error('Failed to retrieve live atmospheric data');
        setData(await res.json());
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof Error ? err.message : 'Unable to load real-time air quality');
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [lat, lon, name, country]
  );

  useEffect(() => {
    const controller = new AbortController();
    // Fetching on location change; the loading flag is set before the request on purpose.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return {
    data,
    aqi: data?.current.usAqi,
    pm25: data?.current.pm25,
    loading,
    error,
    refresh: () => load(),
  };
}
