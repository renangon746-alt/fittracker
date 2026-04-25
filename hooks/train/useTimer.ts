import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer(autoStart = false, initialSeconds = 0) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [running, setRunning] = useState(autoStart);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running]);

    const toggle = useCallback(() => setRunning(r => !r), []);
    const reset = useCallback(() => { setSeconds(0); setRunning(false); }, []);

    const formatted = (() => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    })();

    return { seconds, running, formatted, toggle, reset };
}
