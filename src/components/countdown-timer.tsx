
'use client';

import React, { useState, useEffect } from 'react';

export function CountdownTimer() {
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Set target for 7 days in the future
    return date;
  });

  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    // Set initial time left on mount to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft] && timeLeft[interval as keyof typeof timeLeft] !== 0) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="text-center">
        <span className="text-4xl font-bold">{String(timeLeft[interval as keyof typeof timeLeft]).padStart(2, '0')}</span>
        <span className="block text-sm uppercase text-white/70">{interval}</span>
      </div>
    );
  });

  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      {timerComponents.length ? timerComponents : <span>Loading...</span>}
    </div>
  );
}
