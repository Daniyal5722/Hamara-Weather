import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading weather data">
      {/* Hero & Metrics Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* Hero Card Skeleton */}
        <div className="lg:col-span-1 rounded-3xl p-8 bg-white/10 dark:bg-slate-800/50 border border-white/20 min-h-[380px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="h-7 w-36 bg-slate-300/40 dark:bg-white/20 rounded-xl"></div>
              <div className="h-4 w-24 bg-slate-300/30 dark:bg-white/10 rounded-lg"></div>
            </div>
            <div className="h-10 w-10 bg-slate-300/40 dark:bg-white/20 rounded-2xl"></div>
          </div>
          
          <div className="my-8 space-y-4">
            <div className="h-20 w-44 bg-slate-300/50 dark:bg-white/20 rounded-3xl"></div>
            <div className="h-6 w-32 bg-slate-300/30 dark:bg-white/10 rounded-xl"></div>
          </div>

          <div className="h-12 w-full bg-slate-300/20 dark:bg-white/10 rounded-2xl"></div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-3xl p-5 bg-white/10 dark:bg-slate-800/40 border border-white/10 flex flex-col justify-between h-36">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-slate-300/30 dark:bg-white/10"></div>
                <div className="h-4 w-16 bg-slate-300/30 dark:bg-white/10 rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-7 w-20 bg-slate-300/40 dark:bg-white/20 rounded-lg"></div>
                <div className="h-3 w-14 bg-slate-300/20 dark:bg-white/10 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Timeline Skeleton */}
      <div className="rounded-3xl p-6 bg-white/10 dark:bg-slate-800/40 border border-white/10 space-y-4">
        <div className="h-6 w-48 bg-slate-300/40 dark:bg-white/20 rounded-xl"></div>
        <div className="flex space-x-4 overflow-hidden pt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="min-w-[90px] h-32 rounded-2xl bg-white/10 dark:bg-white/5 p-4 flex flex-col items-center justify-between">
              <div className="h-3 w-10 bg-slate-300/30 dark:bg-white/10 rounded"></div>
              <div className="w-8 h-8 rounded-full bg-slate-300/40 dark:bg-white/20"></div>
              <div className="h-4 w-8 bg-slate-300/40 dark:bg-white/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Forecast Skeleton */}
      <div className="rounded-3xl p-6 bg-white/10 dark:bg-slate-800/40 border border-white/10 space-y-4">
        <div className="h-6 w-48 bg-slate-300/40 dark:bg-white/20 rounded-xl"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-2xl bg-white/10 dark:bg-white/5 flex items-center justify-between px-4">
              <div className="h-4 w-20 bg-slate-300/30 dark:bg-white/10 rounded"></div>
              <div className="w-6 h-6 rounded-full bg-slate-300/40 dark:bg-white/20"></div>
              <div className="h-4 w-28 bg-slate-300/30 dark:bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
