'use client';

import React, { useState, useEffect } from 'react';

type TimeLeft = {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export function CountdownTimer({ targetDate }: { targetDate?: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({});
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const target = targetDate
      ? new Date(targetDate)
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          return d;
        })();

    const calculate = () => {
      const difference = +target - Date.now();
      if (difference <= 0) {
        setExpired(true);
        setTimeLeft({});
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (expired) {
    return <p className="text-sm opacity-70 mt-4">Offer has ended</p>;
  }

  const segments = Object.entries(timeLeft) as [keyof TimeLeft, number][];
  if (segments.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {segments.map(([label, value]) => (
        <div key={label} className="text-center bg-black/20 rounded-lg py-2 px-1">
          <span className="text-xl md:text-2xl font-bold block tabular-nums">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase opacity-70 tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  );
}
