// components/Clock.tsx
import { useEffect, useState } from "react";

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 text-text-800 text-right z-50 border-0">
        <p className="text-xl font-normal text-accent">
          {time.toLocaleDateString("en-GB", {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
        <p className="text-2xl font-normal text-accent">
          {time.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
    </div>
  );
}