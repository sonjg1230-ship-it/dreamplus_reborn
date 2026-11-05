import React, { useState, useEffect } from 'react';

export const UrgencyTopBar: React.FC = () => {
  // Real-time countdown calculation synced to current day midnight
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '21',
    minutes: '51',
    seconds: '49',
  });

  useEffect(() => {
    // Initial calculate remaining seconds until end of current cycle
    let totalSeconds = 21 * 3600 + 51 * 60 + 49;

    const interval = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
      } else {
        totalSeconds = 24 * 3600; // Reset for continuous countdown
      }

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      setTimeLeft({
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A] text-white shadow-md flex items-center justify-between px-3 h-10 max-w-xl mx-auto border-b-0">
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
        <span className="text-orange-500 font-bold">선착순 마감임박</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-100 hidden sm:inline">오늘 접수 마감까지</span>
        <span className="text-slate-100 sm:hidden">마감까지</span>
      </div>
      <div className="flex items-center gap-1 font-mono text-xs font-semibold">
        <span className="bg-[#DC2626] px-1.5 py-0.5 rounded text-white font-bold tracking-wider">
          {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
        </span>
        <span className="text-[11px] text-slate-300 font-normal">남음</span>
      </div>
    </aside>
  );
};
