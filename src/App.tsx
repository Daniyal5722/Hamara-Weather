import React, { useState, useEffect } from 'react';
import { CityWeatherData, TemperatureUnit, ThemeMode } from './types';
import { generateWeatherDataForCity, CITIES_DATABASE, fetchWeatherForCoordinates, findNearestCity } from './data/weatherData';
import { WeatherCanvas } from './components/WeatherCanvas';
import { Header } from './components/Header';
import { HeroCurrentWeather } from './components/HeroCurrentWeather';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { HourlyTimeline } from './components/HourlyTimeline';
import { WeeklyForecast } from './components/WeeklyForecast';
import { Footer } from './components/Footer';
import { GpsSettingsModal, GpsSettingsConfig } from './components/GpsSettingsModal';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const [cityWeather, setCityWeather] = useState<CityWeatherData>(() =>
    generateWeatherDataForCity('Tokyo', 'Japan', 22)
  );
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  // GPS Settings configuration state stored in localStorage
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

  // Sync theme class on HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist GPS config
  const handleUpdateGpsConfig = (newConfig: GpsSettingsConfig) => {
    setGpsConfig(newConfig);
    try {
      localStorage.setItem('hamara_gps_config', JSON.stringify(newConfig));
    } catch (e) {}
    showNotification('GPS Preferences Saved');
  };

  // Auto-detect GPS on startup if enabled
  useEffect(() => {
    if (gpsConfig.autoDetectOnStartup) {
      handleUseGPS();
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  const handleSelectCity = (cityName: string, country?: string) => {
    const matched = CITIES_DATABASE.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    const countryName = country || matched?.country || 'Global';
    
    const newWeather = generateWeatherDataForCity(
      matched ? matched.name : cityName,
      countryName
    );

    setCityWeather(newWeather);
    showNotification(`Updated weather for ${newWeather.cityName}, ${newWeather.country}`);
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingGPS(true);
    showNotification('Acquiring satellite GPS position...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLastCoords({ lat: latitude, lon: longitude, accuracy });

        try {
          const gpsWeather = await fetchWeatherForCoordinates(latitude, longitude, gpsConfig.highAccuracy);
          setCityWeather(gpsWeather);
          showNotification(`Synced GPS Location! (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
        } catch (err) {
          const fallback = generateWeatherDataForCity(`GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`, 'Current Location');
          setCityWeather(fallback);
          showNotification('Synced GPS position.');
        } finally {
          setIsLoadingGPS(false);
        }
      },
      (error) => {
        setIsLoadingGPS(false);
        console.warn('GPS Error:', error.message);
        showNotification('GPS access denied or timed out. Please check location permissions.');
      },
      {
        enableHighAccuracy: gpsConfig.highAccuracy,
        timeout: gpsConfig.timeoutMs,
        maximumAge: 0
      }
    );
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const nearestCityInfo = lastCoords ? findNearestCity(lastCoords.lat, lastCoords.lon) : null;

  return (
    <div className={`min-h-screen relative flex flex-col justify-between transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Dynamic Animated Atmospheric Particle Background */}
      <WeatherCanvas condition={cityWeather.condition} theme={theme} />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Top Header */}
        <Header
          unit={unit}
          onToggleUnit={handleToggleUnit}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onSelectCity={handleSelectCity}
          onUseGPS={handleUseGPS}
          isLoadingGPS={isLoadingGPS}
          onOpenGpsSettings={() => setIsGpsModalOpen(true)}
        />

        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 bg-sky-500 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center space-x-2 text-xs font-bold animate-bounce border border-sky-300/40">
            <i className="fa-solid fa-circle-check"></i>
            <span>{notification}</span>
          </div>
        )}

        {/* Main Dashboard Content */}
        <main className="space-y-8 flex-1">
          {/* Hero Section: Current Weather & 4-8 Weather Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            <div className="lg:col-span-1">
              <HeroCurrentWeather weather={cityWeather} unit={unit} />
            </div>
            <div className="lg:col-span-2">
              <WeatherMetricsGrid weather={cityWeather} />
            </div>
          </div>

          {/* FEATURE COMPONENT: 24-HOUR HOURLY FORECAST WITH TRENDS */}
          <HourlyTimeline hourly={cityWeather.hourly} unit={unit} />

          {/* 7-DAY EXTENDED FORECAST */}
          <WeeklyForecast daily={cityWeather.daily} unit={unit} />
        </main>

        {/* Footer */}
        <Footer onSelectCity={handleSelectCity} />

        {/* GPS Settings Modal */}
        <GpsSettingsModal
          isOpen={isGpsModalOpen}
          onClose={() => setIsGpsModalOpen(false)}
          config={gpsConfig}
          onUpdateConfig={handleUpdateGpsConfig}
          onSyncGPS={handleUseGPS}
          isLoadingGPS={isLoadingGPS}
          lastCoords={lastCoords}
          nearestCityName={nearestCityInfo?.nearest.name}
          distanceKm={nearestCityInfo?.distanceKm}
        />
      </div>
    </div>
  );
}
