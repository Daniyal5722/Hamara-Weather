import React, { useState, useRef, useEffect } from 'react';
import { TemperatureUnit, ThemeMode, SearchResultItem } from '../types';
import { searchLocations } from '../services/weatherApi';

interface HeaderProps {
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectCity: (cityName: string, country?: string, lat?: number, lon?: number) => void;
  onUseGPS: () => void;
  isLoadingGPS: boolean;
  onOpenSettings: () => void;
  recentSearches: string[];
  onClearRecentSearches: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onToggleUnit,
  theme,
  onToggleTheme,
  onSelectCity,
  onUseGPS,
  isLoadingGPS,
  onOpenSettings,
  recentSearches,
  onClearRecentSearches
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced Geocoding Search using Open-Meteo API
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      const selected = searchResults[selectedIndex];
      handleSelectLocation(selected.name, selected.country, selected.latitude, selected.longitude);
      return;
    }

    if (searchQuery.trim()) {
      onSelectCity(searchQuery.trim());
      setIsDropdownOpen(false);
    }
  };

  const handleSelectLocation = (name: string, country: string, lat?: number, lon?: number) => {
    setSearchQuery('');
    onSelectCity(name, country, lat, lon);
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
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
    <header className="glass-card rounded-2xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-6 transition-all">
      {/* Brand Logo */}
      <div 
        className="flex items-center space-x-3 cursor-pointer group" 
        onClick={() => onSelectCity('Tokyo', 'Japan', 35.6762, 139.6503)}
        title="Reset to default Tokyo location"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
          <i className="fa-solid fa-sun text-white text-xl animate-spin-slow"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
            Hamara Weather
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-400/30">
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
            onKeyDown={handleKeyDown}
            placeholder="Search global city, region, or country..."
            aria-label="Search city weather"
            autoComplete="off"
            className="w-full bg-white/30 dark:bg-slate-800/60 border border-slate-300/60 dark:border-white/20 rounded-xl px-4 py-2.5 pl-10 pr-9 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all shadow-inner"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-500 dark:text-white/60 text-xs"></i>
          
          {isSearching ? (
            <i className="fa-solid fa-spinner animate-spin absolute right-3 top-3 text-sky-500 text-xs"></i>
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setIsDropdownOpen(false); }}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              aria-label="Clear search query"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          ) : null}
        </form>

        {/* Search Results & Recent Searches Dropdown */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {/* Search Suggestions List */}
            {searchResults.length > 0 ? (
              searchResults.map((item, index) => (
                <button
                  key={`${item.id}-${index}`}
                  onClick={() => handleSelectLocation(item.name, item.country, item.latitude, item.longitude)}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-colors ${
                    index === selectedIndex
                      ? 'bg-sky-500 text-white'
                      : 'hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className="font-semibold flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-sky-500 dark:text-sky-400 text-xs"></i>
                    {item.name}
                    {item.admin1 && (
                      <span className="text-xs font-normal opacity-75">, {item.admin1}</span>
                    )}
                  </span>
                  <span className="text-xs font-medium opacity-80">{item.country}</span>
                </button>
              ))
            ) : searchQuery.trim().length >= 2 && !isSearching ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-white/60">
                No location matching &quot;{searchQuery}&quot; found. Press Enter to search anyway.
              </div>
            ) : null}

            {/* Recent Searches Section */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-white/50 uppercase tracking-wider">
                  <span>Recent Searches</span>
                  <button
                    onClick={onClearRecentSearches}
                    className="hover:text-red-400 transition-colors"
                  >
                    Clear History
                  </button>
                </div>
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectLocation(term, '')}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs flex items-center space-x-2.5 hover:bg-sky-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-white/80"
                  >
                    <i className="fa-solid fa-clock-rotate-left text-slate-400 text-xs"></i>
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls (GPS, Settings, Unit Toggle, Dark/Light Mode) */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          id="gpsBtn"
          onClick={onUseGPS}
          disabled={isLoadingGPS}
          title="Detect Current GPS Location"
          aria-label="Use Current GPS Location"
          className="p-2.5 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-sky-500/20 border border-slate-300/40 dark:border-white/20 text-sky-500 dark:text-sky-400 transition-all active:scale-95 disabled:opacity-50"
        >
          <i className={`fa-solid ${isLoadingGPS ? 'fa-spinner animate-spin' : 'fa-location-crosshairs'} text-base`}></i>
        </button>

        <button
          onClick={onOpenSettings}
          title="App & GPS Settings"
          aria-label="Open App & GPS Settings"
          className="p-2.5 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-sky-500/20 border border-slate-300/40 dark:border-white/20 text-slate-600 dark:text-sky-300 transition-all active:scale-95"
        >
          <i className="fa-solid fa-sliders text-base"></i>
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
