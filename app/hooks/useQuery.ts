import { useReducer, useEffect, useRef, useCallback } from 'react';

interface QueryState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

interface UseQueryOptions {
  enabled?: boolean;
  deps?: unknown[];
}

interface UseQueryResult<T> extends QueryState<T> {
  refetch: () => Promise<void>;
}

type QueryAction<T> =
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: T }
  | { type: 'ERROR'; error: Error };

function reducer<T>(_state: QueryState<T>, action: QueryAction<T>): QueryState<T> {
  switch (action.type) {
    case 'FETCH':
      return { data: null, error: null, loading: true };
    case 'SUCCESS':
      return { data: action.data, error: null, loading: false };
    case 'ERROR':
      return { data: null, error: action.error, loading: false };
  }
}

export function useQuery<T = unknown>(url: string, options?: UseQueryOptions): UseQueryResult<T> {
  const { enabled = true, deps = [] } = options ?? {};
  const [state, dispatch] = useReducer(reducer<T>, {
    data: null,
    error: null,
    loading: enabled,
  });
  const controllerRef = useRef<AbortController | null>(null);
  const fetchData = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    dispatch({ type: 'FETCH' });

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const data = (await response.json()) as T;
      dispatch({ type: 'SUCCESS', data });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      dispatch({
        type: 'ERROR',
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [url, ...deps]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, [fetchData, enabled]);

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    refetch: fetchData,
  };
}
