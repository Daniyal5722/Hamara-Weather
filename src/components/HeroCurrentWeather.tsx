import React from 'react';
import { CityWeatherData, TemperatureUnit } from '../types';

interface HeroCurrentWeatherProps {
  weather: CityWeatherData;
  unit: TemperatureUnit;
}

export const HeroCurrentWeather: React.FC<HeroCurrentWeatherProps> = ({ weather, unit }) => {
  const formatTemp = (tempC: number) => {
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°`;
    }
    return `${Math.round(tempC)}°`;
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl">
      {/* Background ambient radial glow */}
      <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-sky-400/25 dark:bg-sky-400/20 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-400/35 transition-all duration-700"></div>

      <div>
        {/* Top Header Row */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 id="cityName" className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {weather.cityName}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({weather.country})</span>
            </h2>
            <p id="currentDate" className="text-xs sm:text-sm text-slate-600 dark:text-white/70 mt-1 flex items-center gap-1.5">
              <i className="fa-regular fa-calendar text-sky-500"></i>
              {currentDateFormatted}
            </p>
          </div>
          <span className="px-3 py-1 bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-400/30 rounded-full text-xs font-semibold shrink-0 animate-pulse">
            ● Live Real-Time
          </span>
        </div>

        {/* Temperature & Large Icon Display */}
        <div className="mt-6 sm:mt-8 flex items-center justify-between">
          <div>
            <span id="currentTemp" className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-none drop-shadow-sm">
              {formatTemp(weather.currentTemp)}
            </span>
            <p id="conditionText" className="text-lg sm:text-xl font-semibold text-sky-600 dark:text-sky-200 mt-2">
              {weather.condition}
            </p>
          </div>
          <div className="text-6xl sm:text-7xl text-sky-500 dark:text-sky-300 drop-shadow-xl transform hover:scale-110 transition-transform duration-300">
            <i id="heroIcon" className={`fa-solid ${weather.icon}`}></i>
          </div>
        </div>

        {/* Insight Badge */}
        {weather.insight && (
          <div className="mt-5 p-3 rounded-2xl bg-sky-500/10 dark:bg-slate-800/60 border border-sky-400/20 text-xs text-slate-700 dark:text-sky-200 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-amber-400 shrink-0"></i>
            <span>{weather.insight}</span>
          </div>
        )}
      </div>

      {/* Footer Metrics Row */}
      <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/10 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500 dark:text-white/60 text-xs block">High / Low</span>
          <span id="tempRange" className="font-bold text-slate-900 dark:text-white text-base">
            {formatTemp(weather.highTemp)} / {formatTemp(weather.lowTemp)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-white/60 text-xs block">Feels Like</span>
          <span id="feelsLike" className="font-bold text-slate-900 dark:text-white text-base">
            {formatTemp(weather.feelsLike)}
          </span>
        </div>
      </div>
    </article>
  );
};
