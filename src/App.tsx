import React, { useState, useEffect } from 'react';
import { CityWeatherData, TemperatureUnit, ThemeMode, MotionMode, FavoriteLocation } from './types';
import { generateWeatherDataForCity, CITIES_DATABASE, findNearestCity } from './data/weatherData';
import { fetchLiveWeatherData, searchLocations, reverseGeocodeCoords, fetchIpLocation } from './services/weatherApi';
import { WeatherCanvas } from './components/WeatherCanvas';
import { Header } from './components/Header';
import { FavoritesBar } from './components/FavoritesBar';
import { HeroCurrentWeather } from './components/HeroCurrentWeather';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { HourlyTimeline } from './components/HourlyTimeline';
import { WeeklyForecast } from './components/WeeklyForecast';
import { SkeletonLoader } from './components/SkeletonLoader';
import { SettingsModal } from './components/SettingsModal';
import { GpsSettingsConfig } from './components/GpsSettingsModal';
import { Footer } from './components/Footer';

export default function App() {
  // Theme state persisted in localStorage
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('hamara_theme');
      if (saved) return saved as ThemeMode;
    } catch (e) {}
    return 'dark';
  });

  // Temperature unit state
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    try {
      const saved = localStorage.getItem('hamara_unit');
      if (saved) return saved as TemperatureUnit;
    } catch (e) {}
    return 'C';
  });

  // Motion mode state
  const [motionMode, setMotionMode] = useState<MotionMode>(() => {
    try {
      const saved = localStorage.getItem('hamara_motion');
      if (saved) return saved as MotionMode;
    } catch (e) {}
    return 'standard';
  });

  // Weather data & loading states
  const [cityWeather, setCityWeather] = useState<CityWeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // GPS loading state & toast notifications
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Favorites state stored in localStorage
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(() => {
    try {
      const saved = localStorage.getItem('hamara_favorites');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'tokyo', cityName: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
      { id: 'london', cityName: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
      { id: 'new-york', cityName: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 }
    ];
  });

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hamara_recent_searches');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['Tokyo', 'London', 'New York', 'Paris', 'Dubai'];
  });

  // GPS Settings configuration state
  const [gpsConfig, setGpsConfig] = useState<GpsSettingsConfig>(() => {
    try {
      const saved = localStorage.getItem('hamara_gps_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      autoDetectOnStartup: false,
      highAccuracy: true,
      timeoutMs: 10000
    };
  });

  const [lastCoords, setLastCoords] = useState<{ lat: number; lon: number; accuracy?: number } | null>(null);

  // Apply Theme Mode (Dark, Light, System)
  useEffect(() => {
    const applyTheme = () => {
      let isDark = true;
      if (themeMode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = themeMode === 'dark';
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    try {
      localStorage.setItem('hamara_theme', themeMode);
    } catch (e) {}
  }, [themeMode]);

  // Save Unit preference
  const handleToggleUnit = () => {
    const newUnit = unit === 'C' ? 'F' : 'C';
    setUnit(newUnit);
    try {
      localStorage.setItem('hamara_unit', newUnit);
    } catch (e) {}
  };

  // Save Motion preference
  const handleSelectMotionMode = (mode: MotionMode) => {
    setMotionMode(mode);
    try {
      localStorage.setItem('hamara_motion', mode);
    } catch (e) {}
    showNotification(`Motion mode set to ${mode}`);
  };

  // Save Favorites
  const saveFavorites = (newList: FavoriteLocation[]) => {
    setFavorites(newList);
    try {
      localStorage.setItem('hamara_favorites', JSON.stringify(newList));
    } catch (e) {}
  };

  // Toggle favorite for current location
  const handleToggleCurrentFavorite = () => {
    if (!cityWeather) return;

    const exists = favorites.some((f) => f.cityName.toLowerCase() === cityWeather.cityName.toLowerCase());
    if (exists) {
      const updated = favorites.filter((f) => f.cityName.toLowerCase() !== cityWeather.cityName.toLowerCase());
      saveFavorites(updated);
      showNotification(`Removed ${cityWeather.cityName} from favorites`);
    } else {
      const newFav: FavoriteLocation = {
        id: cityWeather.id,
        cityName: cityWeather.cityName,
        country: cityWeather.country,
        lat: cityWeather.lat,
        lon: cityWeather.lon
      };
      saveFavorites([newFav, ...favorites]);
      showNotification(`Saved ${cityWeather.cityName} to favorites!`);
    }
  };

  const handleRemoveFavoriteById = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = favorites.filter((f) => f.id !== id);
    saveFavorites(updated);
    showNotification('Removed favorite location');
  };

  // Save Recent Search
  const addRecentSearch = (query: string) => {
    if (!query || query.trim().length < 2) return;
    const trimmed = query.trim();
    const filtered = recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('hamara_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('hamara_recent_searches');
    } catch (e) {}
    showNotification('Cleared recent search history');
  };

  // Persist GPS config
  const handleUpdateGpsConfig = (newConfig: GpsSettingsConfig) => {
    setGpsConfig(newConfig);
    try {
      localStorage.setItem('hamara_gps_config', JSON.stringify(newConfig));
    } catch (e) {}
    showNotification('GPS Preferences Saved');
  };

  // Primary Weather Loader function
  const loadWeather = async (cityName: string, country?: string, lat?: number, lon?: number) => {
    setIsWeatherLoading(true);
    setWeatherError(null);

    try {
      let targetLat = lat;
      let targetLon = lon;
      let targetCountry = country || '';
      let targetCityName = cityName;
      let admin1: string | undefined = undefined;

      // If lat/lon not provided, try live Open-Meteo Geocoding first!
      if (targetLat === undefined || targetLon === undefined) {
        const geoResults = await searchLocations(cityName);
        if (geoResults && geoResults.length > 0) {
          const topResult = geoResults[0];
          targetLat = topResult.latitude;
          targetLon = topResult.longitude;
          targetCityName = topResult.name;
          targetCountry = topResult.country || 'Global';
          admin1 = topResult.admin1;
        } else {
          const matched = CITIES_DATABASE.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
          if (matched) {
            targetLat = matched.lat;
            targetLon = matched.lon;
            targetCountry = matched.country;
          } else {
            targetLat = 35.6762;
            targetLon = 139.6503;
            targetCountry = 'Japan';
          }
        }
      }

      addRecentSearch(targetCityName);

      const liveData = await fetchLiveWeatherData(targetLat, targetLon, targetCityName, targetCountry, admin1);
      setCityWeather(liveData);
    } catch (err) {
      console.warn('Weather fetch encountered issue, using fallback:', err);
      const fallback = generateWeatherDataForCity(cityName, country || 'Global');
      setCityWeather(fallback);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // Initial load on mount: default to user's current location automatically
  useEffect(() => {
    handleUseGPS(true);
  }, []);

  const handleSelectCity = (cityName: string, country?: string, lat?: number, lon?: number) => {
    loadWeather(cityName, country, lat, lon);
  };

  const handleSelectFavorite = (fav: FavoriteLocation) => {
    loadWeather(fav.cityName, fav.country, fav.lat, fav.lon);
  };

  // Robust GPS Geolocation strategy with immediate reverse geocoding and fallback
  const handleUseGPS = (isInitialMount: boolean = false) => {
    setIsLoadingGPS(true);
    if (!isInitialMount) {
      showNotification('Acquiring satellite GPS position...');
    }

    if (!navigator.geolocation) {
      console.warn('Geolocation API is not supported by browser.');
      handleGpsFallback(isInitialMount);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLastCoords({ lat: latitude, lon: longitude, accuracy });

        try {
          // Perform immediate reverse geocoding API request right after obtaining coordinates
          const geo = await reverseGeocodeCoords(latitude, longitude);
          
          await loadWeather(geo.cityName, geo.countryName, latitude, longitude);
          if (!isInitialMount) {
            showNotification(`Synced GPS Location: ${geo.cityName} (${geo.countryName})`);
          }
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
          const fallback = generateWeatherDataForCity(`GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`, 'Current Location');
          setCityWeather(fallback);
        } finally {
          setIsLoadingGPS(false);
        }
      },
      async (error) => {
        console.warn('GPS Error:', error.message);
        if (!isInitialMount) {
          showNotification('GPS access unavailable. Falling back to approximate location.');
        }
        await handleGpsFallback(isInitialMount);
      },
      {
        enableHighAccuracy: gpsConfig.highAccuracy,
        timeout: isInitialMount ? 5000 : gpsConfig.timeoutMs,
        maximumAge: 0
      }
    );
  };

  const handleGpsFallback = async (isInitialMount: boolean) => {
    try {
      // Try IP-based location fallback first
      const ipLoc = await fetchIpLocation();
      if (ipLoc) {
        await loadWeather(ipLoc.cityName, ipLoc.countryName, ipLoc.lat, ipLoc.lon);
        if (!isInitialMount) {
          showNotification(`Location detected: ${ipLoc.cityName} (${ipLoc.countryName})`);
        }
        setIsLoadingGPS(false);
        return;
      }
    } catch (e) {}

    // Default city fallback if IP lookup also fails
    await loadWeather('Tokyo', 'Japan', 35.6762, 139.6503);
    setIsLoadingGPS(false);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const nearestCityInfo = lastCoords ? findNearestCity(lastCoords.lat, lastCoords.lon) : null;
  const isCurrentFavorite = cityWeather
    ? favorites.some((f) => f.cityName.toLowerCase() === cityWeather.cityName.toLowerCase())
    : false;

  return (
    <div className="min-h-screen relative flex flex-col justify-between transition-colors duration-500 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Dynamic Animated Atmospheric Particle Background */}
      {cityWeather && (
        <WeatherCanvas
          condition={cityWeather.condition}
          theme={themeMode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : themeMode}
          motionMode={motionMode}
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Top Header Navigation */}
        <Header
          unit={unit}
          onToggleUnit={handleToggleUnit}
          theme={themeMode}
          onToggleTheme={() => setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          onSelectCity={handleSelectCity}
          onUseGPS={handleUseGPS}
          isLoadingGPS={isLoadingGPS}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          recentSearches={recentSearches}
          onClearRecentSearches={handleClearRecentSearches}
        />

        {/* Favorites Quick Access Bar */}
        {cityWeather && (
          <FavoritesBar
            favorites={favorites}
            currentCityName={cityWeather.cityName}
            onSelectFavorite={handleSelectFavorite}
            onRemoveFavorite={handleRemoveFavoriteById}
          />
        )}

        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 bg-sky-500 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center space-x-2 text-xs font-bold animate-bounce border border-sky-300/40">
            <i className="fa-solid fa-circle-check"></i>
            <span>{notification}</span>
          </div>
        )}

        {/* Main Dashboard Content */}
        <main className="space-y-8 flex-1">
          {/* Skeleton Loader or Real Content */}
          {isWeatherLoading || !cityWeather ? (
            <SkeletonLoader />
          ) : weatherError ? (
            <div className="glass-card rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-12">
              <i className="fa-solid fa-triangle-exclamation text-amber-400 text-4xl"></i>
              <h3 className="text-xl font-bold">Weather Data Unavailable</h3>
              <p className="text-xs text-slate-500 dark:text-white/60">{weatherError}</p>
              <button
                onClick={() => handleUseGPS()}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-lg"
              >
                Reload Live Location
              </button>
            </div>
          ) : (
            <>
              {/* Hero Section: Current Weather & 8 Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                <div className="lg:col-span-1">
                  <HeroCurrentWeather
                    weather={cityWeather}
                    unit={unit}
                    isFavorite={isCurrentFavorite}
                    onToggleFavorite={handleToggleCurrentFavorite}
                  />
                </div>
                <div className="lg:col-span-2">
                  <WeatherMetricsGrid weather={cityWeather} />
                </div>
              </div>

              {/* FEATURE COMPONENT: 24-HOUR HOURLY FORECAST WITH TRENDS */}
              <HourlyTimeline hourly={cityWeather.hourly} unit={unit} />

              {/* 7-DAY EXTENDED FORECAST */}
              <WeeklyForecast daily={cityWeather.daily} unit={unit} />
            </>
          )}
        </main>

        {/* Footer */}
        <Footer onSelectCity={handleSelectCity} />

        {/* App & GPS Settings Modal */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          unit={unit}
          onToggleUnit={handleToggleUnit}
          theme={themeMode}
          onSelectTheme={(mode) => setThemeMode(mode)}
          motionMode={motionMode}
          onSelectMotionMode={handleSelectMotionMode}
          gpsConfig={gpsConfig}
          onUpdateGpsConfig={handleUpdateGpsConfig}
          onSyncGPS={handleUseGPS}
          isLoadingGPS={isLoadingGPS}
          lastCoords={lastCoords}
          nearestCityName={nearestCityInfo?.nearest.name}
          distanceKm={nearestCityInfo?.distanceKm}
          favorites={favorites}
          onSelectFavorite={handleSelectFavorite}
          onRemoveFavorite={handleRemoveFavoriteById}
        />
      </div>
    </div>
  );
}
