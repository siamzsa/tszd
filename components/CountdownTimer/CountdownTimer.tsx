'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetTime: number; // Timestamp in milliseconds
  label?: string;
}

export default function CountdownTimer({ targetTime, label = 'Next Candle' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ minutes: 0, seconds: 0, totalSeconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference > 0) {
        const totalSeconds = Math.floor(difference / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        setTimeLeft({ minutes, seconds, totalSeconds });
      } else {
        // Timer expired, reset to next minute
        const nextMinute = Math.ceil(now / 60000) * 60000;
        const totalSeconds = Math.floor((nextMinute - now) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ minutes, seconds, totalSeconds });
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const isLowTime = timeLeft.totalSeconds < 10;
  const isVeryLowTime = timeLeft.totalSeconds < 5;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-600 dark:border-gray-600">
      <div className="text-center">
        <div className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wide mb-2">
          {label}
        </div>
        <div className={`text-3xl font-bold font-mono ${
          isVeryLowTime ? 'text-red-500 animate-pulse' :
          isLowTime ? 'text-yellow-500' :
          'text-green-400'
        }`}>
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {timeLeft.totalSeconds > 0 ? 'remaining' : 'expired'}
        </div>
      </div>
    </div>
  );
}


