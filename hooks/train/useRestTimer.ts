import { useCallback, useEffect, useRef, useState } from 'react';

export function useRestTimer() {
    const [restSeconds, setRestSeconds] = useState(0);
    const [active, setActive] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (active && restSeconds > 0) {
            intervalRef.current = setInterval(() => {
                setRestSeconds(s => {
                    if (s <= 1) {
                        setActive(false);
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (restSeconds === 0) setActive(false);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [active, restSeconds]);

    const startRest = useCallback((seconds: number) => {
        setRestSeconds(seconds);
        setActive(true);
    }, []);

    const addTime = useCallback((delta: number) => {
        setRestSeconds(s => Math.max(0, s + delta));
    }, []);

    const stopRest = useCallback(() => {
        setActive(false);
        setRestSeconds(0);
    }, []);

    const formatted = (() => {
        const m = Math.floor(restSeconds / 60);
        const s = restSeconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    })();

    return { restSeconds, active, formatted, startRest, addTime, stopRest };
}
