import React from 'react';

export interface GpsSettingsConfig {
  autoDetectOnStartup: boolean;
  highAccuracy: boolean;
  timeoutMs: number;
}

interface GpsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GpsSettingsConfig;
  onUpdateConfig: (newConfig: GpsSettingsConfig) => void;
  onSyncGPS: () => void;
  isLoadingGPS: boolean;
  lastCoords: { lat: number; lon: number; accuracy?: number } | null;
  nearestCityName?: string;
  distanceKm?: number;
}

export const GpsSettingsModal: React.FC<GpsSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onSyncGPS,
  isLoadingGPS,
  lastCoords,
  nearestCityName,
  distanceKm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-white/20 dark:border-white/10 text-slate-900 dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gpsModalTitle"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close GPS settings modal"
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-white transition-colors"
        >
          <i className="fa-solid fa-xmark text-base"></i>
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-500 dark:text-sky-400">
            <i className="fa-solid fa-location-crosshairs text-xl"></i>
          </div>
          <div>
            <h3 id="gpsModalTitle" className="text-xl font-bold tracking-wide">
              GPS Location Settings
            </h3>
            <p className="text-xs text-sky-600 dark:text-sky-300">
              Configure Geolocation, precision, and auto-sync preferences
            </p>
          </div>
        </div>

        {/* GPS Active Status Card */}
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/30 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${lastCoords ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></div>
            <div>
              <span className="text-xs font-bold block">
                {lastCoords ? 'GPS Location Synced' : 'GPS Location Ready'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-white/70">
                {lastCoords
                  ? `${lastCoords.lat.toFixed(4)}°, ${lastCoords.lon.toFixed(4)}° (${lastCoords.accuracy ? `±${Math.round(lastCoords.accuracy)}m accuracy` : 'High Precision'})`
                  : 'Click sync to fetch live satellite coordinates'}
              </span>
            </div>
          </div>
          {nearestCityName && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300">
              Near {nearestCityName} ({distanceKm} km)
            </span>
          )}
        </div>

        {/* Settings Options List */}
        <div className="space-y-4 mb-8">
          {/* Option 1: Auto-Detect on Startup */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10">
            <div>
              <label htmlFor="autoDetectToggle" className="font-semibold text-sm block cursor-pointer">
                Auto-Detect GPS on Startup
              </label>
              <span className="text-xs text-slate-500 dark:text-white/60">
                Automatically request your current location when opening the app
              </span>
            </div>
            <input
              type="checkbox"
              id="autoDetectToggle"
              checked={config.autoDetectOnStartup}
              onChange={(e) =>
                onUpdateConfig({ ...config, autoDetectOnStartup: e.target.checked })
              }
              className="w-5 h-5 accent-sky-500 cursor-pointer rounded"
            />
          </div>

          {/* Option 2: High Precision GPS */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10">
            <div>
              <label htmlFor="highAccuracyToggle" className="font-semibold text-sm block cursor-pointer">
                High Precision GPS Mode
              </label>
              <span className="text-xs text-slate-500 dark:text-white/60">
                Enable device hardware satellite location (`enableHighAccuracy`)
              </span>
            </div>
            <input
              type="checkbox"
              id="highAccuracyToggle"
              checked={config.highAccuracy}
              onChange={(e) =>
                onUpdateConfig({ ...config, highAccuracy: e.target.checked })
              }
              className="w-5 h-5 accent-sky-500 cursor-pointer rounded"
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200/50 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-xs font-bold hover:bg-white/20 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={() => {
              onSyncGPS();
            }}
            disabled={isLoadingGPS}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/30 flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <i className={`fa-solid ${isLoadingGPS ? 'fa-spinner animate-spin' : 'fa-location-arrow'}`}></i>
            <span>{isLoadingGPS ? 'Locating GPS...' : 'Sync GPS Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
