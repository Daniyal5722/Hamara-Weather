import React, { useState } from 'react';
import { TemperatureUnit, ThemeMode, MotionMode, FavoriteLocation } from '../types';
import { GpsSettingsConfig } from './GpsSettingsModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  theme: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  motionMode: MotionMode;
  onSelectMotionMode: (mode: MotionMode) => void;
  gpsConfig: GpsSettingsConfig;
  onUpdateGpsConfig: (config: GpsSettingsConfig) => void;
  onSyncGPS: () => void;
  isLoadingGPS: boolean;
  lastCoords: { lat: number; lon: number; accuracy?: number } | null;
  nearestCityName?: string;
  distanceKm?: number;
  favorites: FavoriteLocation[];
  onSelectFavorite: (fav: FavoriteLocation) => void;
  onRemoveFavorite: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  unit,
  onToggleUnit,
  theme,
  onSelectTheme,
  motionMode,
  onSelectMotionMode,
  gpsConfig,
  onUpdateGpsConfig,
  onSyncGPS,
  isLoadingGPS,
  lastCoords,
  nearestCityName,
  distanceKm,
  favorites,
  onSelectFavorite,
  onRemoveFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'gps' | 'favorites' | 'about'>('preferences');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-card w-full max-w-xl rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-white/20 dark:border-white/10 text-slate-900 dark:text-white max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsModalTitle"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Settings modal"
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-white transition-colors"
        >
          <i className="fa-solid fa-xmark text-base"></i>
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-500 dark:text-sky-400">
            <i className="fa-solid fa-sliders text-xl"></i>
          </div>
          <div>
            <h3 id="settingsModalTitle" className="text-xl font-bold tracking-wide">
              App & GPS Settings
            </h3>
            <p className="text-xs text-sky-600 dark:text-sky-300">
              Customize units, themes, GPS accuracy, and saved locations
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center space-x-1 p-1 bg-slate-200/50 dark:bg-slate-800/60 rounded-2xl mb-6 shrink-0 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-palette mr-1.5"></i> Preferences
          </button>
          
          <button
            onClick={() => setActiveTab('gps')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'gps'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-location-crosshairs mr-1.5"></i> GPS
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-star mr-1.5"></i> Favorites ({favorites.length})
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-circle-info mr-1.5"></i> About
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* TAB 1: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              {/* Temperature Unit Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10">
                <div>
                  <span className="font-semibold text-sm block">Temperature Scale</span>
                  <span className="text-xs text-slate-500 dark:text-white/60">
                    Switch between Celsius (°C) and Fahrenheit (°F)
                  </span>
                </div>
                <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-900/80 rounded-xl">
                  <button
                    onClick={() => unit !== 'C' && onToggleUnit()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      unit === 'C' ? 'bg-sky-500 text-white shadow' : 'text-slate-600 dark:text-white/70'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => unit !== 'F' && onToggleUnit()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      unit === 'F' ? 'bg-sky-500 text-white shadow' : 'text-slate-600 dark:text-white/70'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="p-4 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10 space-y-3">
                <div>
                  <span className="font-semibold text-sm block">Color Theme Mode</span>
                  <span className="text-xs text-slate-500 dark:text-white/60">
                    Choose visual appearance preference
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onSelectTheme('dark')}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all ${
                      theme === 'dark'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-600 dark:text-sky-300'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <i className="fa-solid fa-moon"></i>
                    <span>Dark</span>
                  </button>

                  <button
                    onClick={() => onSelectTheme('light')}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all ${
                      theme === 'light'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-600 dark:text-sky-300'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <i className="fa-solid fa-sun text-amber-500"></i>
                    <span>Light</span>
                  </button>

                  <button
                    onClick={() => onSelectTheme('system')}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all ${
                      theme === 'system'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-600 dark:text-sky-300'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <i className="fa-solid fa-desktop"></i>
                    <span>System</span>
                  </button>
                </div>
              </div>

              {/* Motion Mode Selector */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10">
                <div>
                  <span className="font-semibold text-sm block">Motion & Animations</span>
                  <span className="text-xs text-slate-500 dark:text-white/60">
                    Reduce particle canvas motion for accessibility or battery saving
                  </span>
                </div>
                <button
                  onClick={() => onSelectMotionMode(motionMode === 'standard' ? 'reduced' : 'standard')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    motionMode === 'reduced'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-600 dark:text-amber-300'
                      : 'bg-sky-500/20 border-sky-400 text-sky-600 dark:text-sky-300'
                  }`}
                >
                  {motionMode === 'reduced' ? 'Reduced Motion' : 'Standard Motion'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GPS SETTINGS */}
          {activeTab === 'gps' && (
            <div className="space-y-4">
              {/* Status Card */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${lastCoords ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></div>
                  <div>
                    <span className="text-xs font-bold block">
                      {lastCoords ? 'GPS Synced' : 'GPS Ready'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-white/70">
                      {lastCoords
                        ? `${lastCoords.lat.toFixed(4)}°, ${lastCoords.lon.toFixed(4)}° (${lastCoords.accuracy ? `±${Math.round(lastCoords.accuracy)}m accuracy` : 'High Precision'})`
                        : 'Click sync to acquire satellite coordinates'}
                    </span>
                  </div>
                </div>
                {nearestCityName && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300">
                    Near {nearestCityName} ({distanceKm} km)
                  </span>
                )}
              </div>

              {/* Toggle 1: Auto-Detect on Startup */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10">
                <div>
                  <label htmlFor="autoDetectToggle" className="font-semibold text-sm block cursor-pointer">
                    Auto-Detect GPS on Startup
                  </label>
                  <span className="text-xs text-slate-500 dark:text-white/60">
                    Automatically request location weather when opening the app
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="autoDetectToggle"
                  checked={gpsConfig.autoDetectOnStartup}
                  onChange={(e) =>
                    onUpdateGpsConfig({ ...gpsConfig, autoDetectOnStartup: e.target.checked })
                  }
                  className="w-5 h-5 accent-sky-500 cursor-pointer rounded"
                />
              </div>

              {/* Toggle 2: High Precision */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10">
                <div>
                  <label htmlFor="highAccuracyToggle" className="font-semibold text-sm block cursor-pointer">
                    High Precision Mode
                  </label>
                  <span className="text-xs text-slate-500 dark:text-white/60">
                    Use hardware GPS sensor (`enableHighAccuracy`)
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="highAccuracyToggle"
                  checked={gpsConfig.highAccuracy}
                  onChange={(e) =>
                    onUpdateGpsConfig({ ...gpsConfig, highAccuracy: e.target.checked })
                  }
                  className="w-5 h-5 accent-sky-500 cursor-pointer rounded"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={onSyncGPS}
                  disabled={isLoadingGPS}
                  className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/30 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <i className={`fa-solid ${isLoadingGPS ? 'fa-spinner animate-spin' : 'fa-location-arrow'}`}></i>
                  <span>{isLoadingGPS ? 'Locating Satellites...' : 'Sync Current GPS Location'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-3">
              {favorites.length === 0 ? (
                <div className="p-8 text-center bg-white/20 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/60">
                  <i className="fa-regular fa-star text-3xl text-amber-400 mb-2 block"></i>
                  <p className="text-xs font-semibold">No Saved Favorites Yet</p>
                  <p className="text-[11px] opacity-75 mt-1">
                    Click the star icon next to any city name to save it to your quick access list.
                  </p>
                </div>
              ) : (
                favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <i className="fa-solid fa-star text-amber-400 text-sm"></i>
                      <div>
                        <span className="font-bold text-sm block">{fav.cityName}</span>
                        <span className="text-xs text-slate-500 dark:text-white/60">{fav.country}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          onSelectFavorite(fav);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-300 text-xs font-bold hover:bg-sky-500 text-sky-600 dark:hover:text-white transition-colors"
                      >
                        View Weather
                      </button>
                      <button
                        onClick={() => onRemoveFavorite(fav.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove from favorites"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-white/80 leading-relaxed">
              <div className="p-4 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                    <i className="fa-solid fa-sun"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hamara Weather v2.0</h4>
                    <span className="text-[10px] text-sky-500 font-bold">Live Global Open-Meteo Integration</span>
                  </div>
                </div>
                <p className="pt-2 text-slate-600 dark:text-white/70">
                  Hamara Weather delivers real-time meteorological forecasts, 24-hour timelines, 7-day extended outlooks, and atmospheric metrics with live geolocation detection.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Data Provider</span>
                <p className="text-slate-600 dark:text-white/70">
                  Powered by Open-Meteo non-commercial Weather API & Geocoding Service. No proprietary keys required.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 mt-4 border-t border-slate-200/50 dark:border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/30 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
