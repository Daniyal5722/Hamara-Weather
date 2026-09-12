import React, { useState, useRef, useEffect } from 'react';
import { TemperatureUnit, ThemeMode } from '../types';
import { CITIES_DATABASE } from '../data/weatherData';

interface HeaderProps {
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectCity: (cityName: string, country?: string) => void;
  onUseGPS: () => void;
  isLoadingGPS: boolean;
  onOpenGpsSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onToggleUnit,
  theme,
  onToggleTheme,
  onSelectCity,
  onUseGPS,
  isLoadingGPS,
  onOpenGpsSettings
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCities = searchQuery.trim()
    ? CITIES_DATABASE.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSelectCity(searchQuery.trim());
      setIsDropdownOpen(false);
    }
  };

  const handleSelectSuggestion = (name: string, country: string) => {
    setSearchQuery(name);
    onSelectCity(name, country);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="glass-card rounded-2xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8 transition-all">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectCity('Tokyo', 'Japan')}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
          <i className="fa-solid fa-sun text-white text-xl animate-spin-slow"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
            Hamara Weather
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/30">
              Live
            </span>
          </h1>
          <p className="text-xs text-sky-600 dark:text-sky-200 opacity-80">Next-Gen Atmospheric Forecast</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 min-w-[220px] max-w-md mx-0 sm:mx-2 relative" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            id="searchInput"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search city (e.g. Tokyo, London, New York)..."
            aria-label="Search city weather"
            className="w-full bg-white/20 dark:bg-slate-800/60 border border-slate-300/40 dark:border-white/20 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all shadow-inner"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-500 dark:text-white/60 text-xs"></i>
          
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setIsDropdownOpen(false); }}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </form>

        {/* Autocomplete Dropdown */}
        {isDropdownOpen && filteredCities.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCities.map((city) => (
              <button
                key={`${city.name}-${city.country}`}
                onClick={() => handleSelectSuggestion(city.name, city.country)}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span className="font-medium flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-sky-500 text-xs"></i>
                  {city.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{city.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls (GPS, GPS Settings, Unit Toggle, Dark/Light Mode) */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          id="gpsBtn"
          onClick={onUseGPS}
          disabled={isLoadingGPS}
          title="Current Location GPS"
          aria-label="Use Current GPS Location"
          className="p-2.5 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-sky-500/20 border border-slate-300/40 dark:border-white/20 text-sky-500 dark:text-sky-400 transition-all active:scale-95 disabled:opacity-50"
        >
          <i className={`fa-solid ${isLoadingGPS ? 'fa-spinner animate-spin' : 'fa-location-crosshairs'} text-base`}></i>
        </button>

        <button
          onClick={onOpenGpsSettings}
          title="GPS Location Settings"
          aria-label="Open GPS Location Settings"
          className="p-2.5 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-sky-500/20 border border-slate-300/40 dark:border-white/20 text-slate-600 dark:text-sky-300 transition-all active:scale-95"
        >
          <i className="fa-solid fa-gear text-base"></i>
        </button>

        <button
          id="unitBtn"
          onClick={onToggleUnit}
          title="Toggle Temperature Unit"
          aria-label={`Switch to degree ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
          className="px-3 py-2 rounded-xl bg-sky-500/10 dark:bg-white/10 hover:bg-sky-500/20 border border-sky-400/40 dark:border-white/20 font-bold text-sm text-sky-600 dark:text-white transition-all active:scale-95 min-w-[42px] text-center"
        >
          °{unit}
        </button>

        <button
          id="themeBtn"
          onClick={onToggleTheme}
          title="Toggle Theme"
          aria-label="Toggle Dark and Light theme"
          className="p-2.5 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-white/30 border border-slate-300/40 dark:border-white/20 text-amber-500 dark:text-yellow-300 transition-all active:scale-95"
        >
          <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-amber-300' : 'fa-moon text-indigo-600'} text-base`}></i>
        </button>
      </div>
    </header>
  );
};
