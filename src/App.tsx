import React, { useState, useEffect } from 'react';
import { CityWeatherData, TemperatureUnit, ThemeMode } from './types';
import { generateWeatherDataForCity, CITIES_DATABASE } from './data/weatherData';
import { WeatherCanvas } from './components/WeatherCanvas';
import { Header } from './components/Header';
import { HeroCurrentWeather } from './components/HeroCurrentWeather';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { HourlyTimeline } from './components/HourlyTimeline';
import { WeeklyForecast } from './components/WeeklyForecast';
import { Footer } from './components/Footer';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const [cityWeather, setCityWeather] = useState<CityWeatherData>(() =>
    generateWeatherDataForCity('Tokyo', 'Japan', 22)
  );
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync theme class on HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
    showNotification('Locating your GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoadingGPS(false);
        const { latitude, longitude } = position.coords;

        // Find closest city from database or generate custom location
        const customName = `Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
        const localTemp = Math.round(18 + Math.abs(latitude % 10));

        const gpsWeather = generateWeatherDataForCity('Your Location', 'GPS Coordinates', localTemp);
        gpsWeather.lat = latitude;
        gpsWeather.lon = longitude;

        setCityWeather(gpsWeather);
        showNotification('Successfully synced weather for your current GPS location!');
      },
      (error) => {
        setIsLoadingGPS(false);
        console.warn('GPS Error:', error.message);
        showNotification('GPS access denied or unavailable. Showing Tokyo as default.');
      },
      { timeout: 8000 }
    );
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

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
      </div>
    </div>
  );
}
