import React from 'react';
import { CityWeatherData, TemperatureUnit } from '../types';

interface HeroCurrentWeatherProps {
  weather: CityWeatherData;
  unit: TemperatureUnit;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const HeroCurrentWeather: React.FC<HeroCurrentWeatherProps> = ({
  weather,
  unit,
  isFavorite = false,
  onToggleFavorite
}) => {
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
    <article className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl h-full">
      {/* Background ambient radial glow */}
      <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-sky-400/25 dark:bg-sky-400/20 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-400/35 transition-all duration-700"></div>

      <div>
        {/* Top Header Row */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 id="cityName" className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {weather.cityName}
              </h2>
              {onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-amber-400 text-lg transition-transform active:scale-125"
                >
                  <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-star`}></i>
                </button>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {weather.country} {weather.admin1 ? `• ${weather.admin1}` : ''}
            </p>
            <p id="currentDate" className="text-xs text-slate-600 dark:text-white/70 mt-2 flex items-center gap-1.5 font-medium">
              <i className="fa-regular fa-calendar text-sky-500"></i>
              {currentDateFormatted}
            </p>
          </div>
          <span className="px-3 py-1 bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-400/30 rounded-full text-[11px] font-bold shrink-0 animate-pulse">
            ● Live Sync
          </span>
        </div>

        {/* Temperature & Large Icon Display */}
        <div className="mt-6 sm:mt-8 flex items-center justify-between">
          <div>
            <span id="currentTemp" className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-none drop-shadow-sm">
              {formatTemp(weather.currentTemp)}
            </span>
            <p id="conditionText" className="text-lg sm:text-xl font-bold text-sky-600 dark:text-sky-200 mt-2">
              {weather.condition}
            </p>
          </div>
          <div className="text-6xl sm:text-7xl text-sky-500 dark:text-sky-300 drop-shadow-xl transform hover:scale-110 transition-transform duration-300">
            <i id="heroIcon" className={`fa-solid ${weather.icon}`}></i>
          </div>
        </div>

        {/* Insight Badge */}
        {weather.insight && (
          <div className="mt-5 p-3.5 rounded-2xl bg-sky-500/10 dark:bg-slate-800/60 border border-sky-400/20 text-xs text-slate-700 dark:text-sky-200 flex items-center gap-2.5">
            <i className="fa-solid fa-lightbulb text-amber-400 text-sm shrink-0"></i>
            <span className="font-medium leading-relaxed">{weather.insight}</span>
          </div>
        )}
      </div>

      {/* Footer Metrics Row */}
      <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/10 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500 dark:text-white/60 text-xs font-semibold block">High / Low</span>
          <span id="tempRange" className="font-bold text-slate-900 dark:text-white text-base">
            {formatTemp(weather.highTemp)} / {formatTemp(weather.lowTemp)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-white/60 text-xs font-semibold block">Feels Like</span>
          <span id="feelsLike" className="font-bold text-slate-900 dark:text-white text-base">
            {formatTemp(weather.feelsLike)}
          </span>
        </div>
      </div>
    </article>
  );
};
