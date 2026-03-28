import { useState, useRef, useEffect } from 'react';

export function useTimer(startTime, active) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (active && startTime) {
      // Initialize elapsed immediately in case we resumed
      setElapsed(Date.now() - startTime);
      timerRef.current = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    } else {
      clearInterval(timerRef.current);
      if (!active) setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [active, startTime]);

  return elapsed;
}
