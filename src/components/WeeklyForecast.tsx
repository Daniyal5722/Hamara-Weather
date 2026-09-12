import React from 'react';
import { DailyForecastItem, TemperatureUnit } from '../types';

interface WeeklyForecastProps {
  daily: DailyForecastItem[];
  unit: TemperatureUnit;
}

export const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ daily, unit }) => {
  const formatTemp = (tempC: number) => {
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°`;
    }
    return `${Math.round(tempC)}°`;
  };

  const allMins = daily.map(d => d.minTemp);
  const allMaxs = daily.map(d => d.maxTemp);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const globalRange = Math.max(1, globalMax - globalMin);

  return (
    <section 
      aria-label="7-Day Extended Weather Forecast"
      className="glass-card rounded-3xl p-5 sm:p-6 transition-all shadow-xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-500 dark:text-indigo-300">
          <i className="fa-regular fa-calendar-days text-base"></i>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">7-Day Extended Forecast</h3>
          <p className="text-xs text-slate-600 dark:text-white/60">
            Daily temperature spectrum & weather Outlook
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {daily.map((item, index) => {
          // Calculate slider positions for range bar
          const leftPct = ((item.minTemp - globalMin) / globalRange) * 100;
          const widthPct = Math.max(15, ((item.maxTemp - item.minTemp) / globalRange) * 100);

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/70 transition-colors text-xs sm:text-sm"
            >
              {/* Day Name & Date */}
              <div className="w-24 sm:w-28 shrink-0">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  {item.dayName}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-white/60">
                  {item.dateStr}
                </span>
              </div>

              {/* Weather Icon & Rain */}
              <div className="flex items-center space-x-2 w-28 sm:w-36 shrink-0">
                <i className={`fa-solid ${item.icon} text-base text-sky-500 dark:text-sky-300 w-6 text-center`}></i>
                <span className="text-slate-700 dark:text-slate-200 font-medium truncate hidden sm:inline">
                  {item.condition}
                </span>
                {item.rainProb > 0 && (
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    {item.rainProb}%
                  </span>
                )}
              </div>

              {/* Min Temp */}
              <span className="w-10 text-right font-bold text-slate-600 dark:text-white/70">
                {formatTemp(item.minTemp)}
              </span>

              {/* Temperature Spectrum Bar */}
              <div className="flex-1 max-w-xs mx-2 h-2.5 bg-slate-200 dark:bg-slate-700/60 rounded-full relative overflow-hidden">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`
                  }}
                ></div>
              </div>

              {/* Max Temp */}
              <span className="w-10 text-left font-bold text-slate-900 dark:text-white">
                {formatTemp(item.maxTemp)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
