import { useCallback, useEffect, useRef, useState } from 'react';

export function useResendTimer(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  const [active, setActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActive(false);
  }, []);

  const start = useCallback(() => {
    setRemaining(seconds);
    setActive(true);
  }, [seconds]);

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setActive(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');

  return {
    remaining,
    formatted: `${mm}:${ss}`,
    active,
    expired: !active && remaining === 0,
    start,
    stop,
  };
}
