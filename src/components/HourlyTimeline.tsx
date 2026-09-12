import React, { useRef, useState, useEffect } from 'react';
import { HourlyForecastItem, TemperatureUnit } from '../types';

interface HourlyTimelineProps {
  hourly: HourlyForecastItem[];
  unit: TemperatureUnit;
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({ hourly, unit }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const formatTemp = (tempC: number) => {
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°`;
    }
    return `${Math.round(tempC)}°`;
  };

  const minTemp = Math.min(...hourly.map((h) => h.temp));
  const maxTemp = Math.max(...hourly.map((h) => h.temp));
  const tempRange = Math.max(1, maxTemp - minTemp);

  const selectedItem = hourly[selectedIndex] || hourly[0];
  const prevTemp = selectedIndex > 0 ? hourly[selectedIndex - 1].temp : selectedItem.temp;
  const tempDiff = Math.round((selectedItem.temp - prevTemp) * 10) / 10;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Keyboard navigation across cards
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight' && idx < hourly.length - 1) {
      setSelectedIndex(idx + 1);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      setSelectedIndex(idx - 1);
    }
  };

  return (
    <section 
      aria-label="24-Hour Hourly Weather Forecast"
      className="glass-card rounded-3xl p-5 sm:p-6 relative overflow-hidden transition-all shadow-xl"
    >
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-500 dark:text-sky-400">
            <i className="fa-regular fa-clock text-base"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Next 24 Hours Forecast</h3>
            <p className="text-xs text-slate-600 dark:text-white/60">
              Interactive hourly temperature trends, sparklines & precipitation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div id="hourlyRangeBadge" className="px-3 py-1 bg-white/30 dark:bg-white/10 border border-slate-300/50 dark:border-white/20 rounded-xl text-xs font-semibold text-slate-800 dark:text-sky-200">
            24-Hour Span • Low {formatTemp(minTemp)} • High {formatTemp(maxTemp)}
          </div>

          {/* Desktop Scroll Buttons */}
          <div className="hidden md:flex items-center space-x-1.5">
            <button
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="p-1.5 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-sky-500/20 text-slate-700 dark:text-white transition-colors"
            >
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={scrollRight}
              aria-label="Scroll right"
              className="p-1.5 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-sky-500/20 text-slate-700 dark:text-white transition-colors"
            >
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Selection Detail Banner */}
      <div
        id="hourlyDetailBanner"
        className="bg-sky-500/15 dark:bg-sky-500/20 border border-sky-400/40 dark:border-sky-400/30 rounded-2xl p-3.5 mb-6 flex flex-wrap items-center justify-between text-xs text-slate-800 dark:text-white gap-3 transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center space-x-2.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-600 dark:text-sky-300 font-extrabold uppercase text-[10px]">
            Selected Hour
          </span>
          <span id="selectedHourLabel" className="font-bold text-sky-700 dark:text-sky-300 text-sm">
            {selectedItem.timeLabel}:
          </span>
          <span id="selectedHourTemp" className="font-black text-sm text-slate-900 dark:text-white">
            {formatTemp(selectedItem.temp)}
          </span>
          <span id="selectedHourDesc" className="text-slate-600 dark:text-white/80 font-medium">
            ({selectedItem.condition})
          </span>
        </div>

        <div className="flex items-center space-x-4 flex-wrap">
          {/* Trend indicator vs previous hour */}
          <span id="selectedHourTrend" className="font-bold flex items-center gap-1">
            {Math.abs(tempDiff) >= 0.1 ? (
              <>
                <i className={`fa-solid ${tempDiff > 0 ? 'fa-arrow-trend-up text-red-500 dark:text-red-400' : 'fa-arrow-trend-down text-sky-500 dark:text-sky-400'}`}></i>
                <span className={tempDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-sky-600 dark:text-sky-400'}>
                  {tempDiff > 0 ? `+${tempDiff.toFixed(1)}°` : `${tempDiff.toFixed(1)}°`} vs prev hour
                </span>
              </>
            ) : (
              <span className="text-slate-500 dark:text-white/60">Steady temperature</span>
            )}
          </span>

          <span id="selectedHourRain" className="font-bold text-cyan-600 dark:text-cyan-300 flex items-center gap-1">
            <i className="fa-solid fa-droplet"></i>
            {selectedItem.rainProb}% Rain chance
          </span>

          <span className="hidden lg:inline-flex text-slate-500 dark:text-white/60 items-center gap-1">
            <i className="fa-solid fa-wind text-xs"></i>
            {selectedItem.windSpeed} km/h wind
          </span>
        </div>
      </div>

      {/* Horizontally Scrollable 24-Hour Item Container */}
      <div
        id="hourlyContainer"
        ref={scrollContainerRef}
        tabIndex={0}
        aria-label="Scrollable 24-hour timeline cards"
        className="flex items-center space-x-3 overflow-x-auto no-scrollbar hourly-scroll py-2 px-1 focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-xl"
      >
        {hourly.map((item, idx) => {
          const itemPrevTemp = idx > 0 ? hourly[idx - 1].temp : item.temp;
          const diff = Math.round((item.temp - itemPrevTemp) * 10) / 10;

          let trendIcon = 'fa-arrow-right';
          let trendColor = 'text-slate-400 dark:text-white/40';

          if (diff > 0.2) {
            trendIcon = 'fa-arrow-trend-up';
            trendColor = 'text-red-500 dark:text-red-400';
          } else if (diff < -0.2) {
            trendIcon = 'fa-arrow-trend-down';
            trendColor = 'text-sky-500 dark:text-sky-400';
          }

          // Bar height ratio for mini sparkline temperature bar
          const normTemp = (item.temp - minTemp) / tempRange;
          const barHeightPct = Math.max(20, Math.min(100, normTemp * 100));
          const isSelected = selectedIndex === idx;

          return (
            <div
              key={item.index}
              role="button"
              tabIndex={0}
              aria-selected={isSelected}
              onClick={() => setSelectedIndex(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`flex-shrink-0 w-20 py-4 px-2.5 rounded-2xl cursor-pointer transition-all flex flex-col items-center space-y-2 border outline-none select-none ${
                isSelected
                  ? 'bg-sky-500/30 dark:bg-sky-500/35 border-sky-500 dark:border-sky-400 shadow-lg shadow-sky-500/30 scale-105 ring-2 ring-sky-400'
                  : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-white/20 hover:bg-white/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {/* Hour Time Label */}
              <span className={`text-xs font-bold ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-white/80'}`}>
                {item.timeLabel}
              </span>

              {/* Weather Icon */}
              <i className={`fa-solid ${item.icon} text-xl ${isSelected ? 'text-sky-600 dark:text-sky-300' : 'text-slate-800 dark:text-white/90'} py-1 transition-transform group-hover:scale-110`}></i>

              {/* Temperature Display */}
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {formatTemp(item.temp)}
              </span>

              {/* Mini Sparkline Bar & Trend Arrow */}
              <div className="flex items-center space-x-1 py-1">
                <div className="w-1.5 bg-slate-300/50 dark:bg-white/20 rounded-full h-6 relative overflow-hidden flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-sky-400 via-sky-500 to-red-400 rounded-full sparkline-bar"
                    style={{ height: `${barHeightPct}%` }}
                  ></div>
                </div>
                <i className={`fa-solid ${trendIcon} ${trendColor} text-[10px]`}></i>
              </div>

              {/* Precipitation Probability Badge */}
              {item.rainProb > 0 ? (
                <div className="flex items-center space-x-0.5 text-[10px] text-cyan-600 dark:text-cyan-300 font-extrabold">
                  <i className="fa-solid fa-droplet text-[9px]"></i>
                  <span>{item.rainProb}%</span>
                </div>
              ) : (
                <div className="h-3"></div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
