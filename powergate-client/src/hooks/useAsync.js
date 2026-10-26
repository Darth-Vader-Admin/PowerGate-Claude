import { useCallback, useEffect, useRef, useState } from "react";

// Runs an async loader on mount (and when deps change). Returns { data, loading, error, reload, setData }.
export default function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const mounted = useRef(true);

  const run = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await loader();
      if (mounted.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (mounted.current) setState({ data: null, loading: false, error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => {
      mounted.current = false;
    };
  }, [run]);

  const setData = useCallback(
    (updater) =>
      setState((prev) => ({
        ...prev,
        data: typeof updater === "function" ? updater(prev.data) : updater,
      })),
    []
  );

  return { ...state, reload: run, setData };
}
