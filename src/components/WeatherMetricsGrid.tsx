import React from 'react';
import { CityWeatherData } from '../types';

interface WeatherMetricsGridProps {
  weather: CityWeatherData;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({ weather }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Humidity Widget */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-sky-400/50 transition-all hover:scale-[1.02]">
        <div className="flex items-center space-x-2.5 text-sky-500 dark:text-sky-400">
          <i className="fa-solid fa-droplet text-lg"></i>
          <span className="text-xs font-semibold text-slate-700 dark:text-white/70">Humidity</span>
        </div>
        <div className="mt-4">
          <span id="humidityVal" className="text-2xl font-black text-slate-900 dark:text-white">
            {weather.humidity}%
          </span>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Dew point: {weather.dewPoint}°C
          </p>
        </div>
      </div>

      {/* Wind Speed Widget */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-teal-400/50 transition-all hover:scale-[1.02]">
        <div className="flex items-center space-x-2.5 text-teal-600 dark:text-teal-300">
          <i className="fa-solid fa-wind text-lg"></i>
          <span className="text-xs font-semibold text-slate-700 dark:text-white/70">Wind Speed</span>
        </div>
        <div className="mt-4">
          <span id="windVal" className="text-2xl font-black text-slate-900 dark:text-white">
            {weather.windSpeed} km/h
          </span>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Direction: {weather.windDirection} ({weather.windAngle}°)
          </p>
        </div>
      </div>

      {/* UV Index Widget */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-amber-400/50 transition-all hover:scale-[1.02]">
        <div className="flex items-center space-x-2.5 text-amber-500 dark:text-amber-400">
          <i className="fa-solid fa-sun text-lg"></i>
          <span className="text-xs font-semibold text-slate-700 dark:text-white/70">UV Index</span>
        </div>
        <div className="mt-4">
          <span id="uvVal" className="text-2xl font-black text-slate-900 dark:text-white">
            {weather.uvIndex} ({weather.uvLevel})
          </span>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            {weather.uvIndex >= 6 ? 'Protection required' : 'Moderate exposure'}
          </p>
        </div>
      </div>

      {/* Pressure Widget */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-indigo-400/50 transition-all hover:scale-[1.02]">
        <div className="flex items-center space-x-2.5 text-indigo-500 dark:text-indigo-300">
          <i className="fa-solid fa-gauge-high text-lg"></i>
          <span className="text-xs font-semibold text-slate-700 dark:text-white/70">Pressure</span>
        </div>
        <div className="mt-4">
          <span id="pressureVal" className="text-2xl font-black text-slate-900 dark:text-white">
            {weather.pressure} hPa
          </span>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Steady atmosphere
          </p>
        </div>
      </div>

      {/* Air Quality Index (AQI) Widget */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-400/50 transition-all hover:scale-[1.02]">
        <div className="flex items-center space-x-2.5 text-emerald-500 dark:text-emerald-400">
          <i className="fa-solid fa-leaf text-lg"></i>
          <span className="text-xs font-semibold text-slate-700 dark:text-white/70">Air Quality</span>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {weather.airQualityIndex} AQI
          </span>
          <p className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold mt-1">
            {weather.airQualityLabel}
          </p>
        </div>
      </div>

      {/* Visibility Widget */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-sky-400/50 transition-all hover:scale-[1.02]">
        <div className="flex items-center space-x-2.5 text-sky-500 dark:text-sky-300">
          <i className="fa-solid fa-eye text-lg"></i>
          <span className="text-xs font-semibold text-slate-700 dark:text-white/70">Visibility</span>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {weather.visibility}
          </span>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Clear horizon view
          </p>
        </div>
      </div>

      {/* Sunrise Widget */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-amber-400/50 transition-all hover:scale-[1.02]">
        <div className="flex items-center space-x-2.5 text-amber-500">
          <i className="fa-solid fa-mountain-sun text-lg"></i>
          <span className="text-xs font-semibold text-slate-700 dark:text-white/70">Sunrise</span>
        </div>
        <div className="mt-4">
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
            {weather.sunrise}
          </span>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Dawn transition
          </p>
        </div>
      </div>

      {/* Sunset Widget */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-purple-400/50 transition-all hover:scale-[1.02]">
        <div className="flex items-center space-x-2.5 text-purple-500 dark:text-purple-300">
          <i className="fa-solid fa-cloud-moon text-lg"></i>
          <span className="text-xs font-semibold text-slate-700 dark:text-white/70">Sunset</span>
        </div>
        <div className="mt-4">
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
            {weather.sunset}
          </span>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Dusk transition
          </p>
        </div>
      </div>
    </div>
  );
};
