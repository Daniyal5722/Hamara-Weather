import { CityWeatherData, HourlyForecastItem, DailyForecastItem, WeatherCondition } from '../types';

export const CITIES_DATABASE: Array<{ name: string; country: string; lat: number; lon: number }> = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
  { name: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780 },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437 }
];

export function generateWeatherDataForCity(cityName: string, country: string = 'Global', customBaseTemp?: number): CityWeatherData {
  const seed = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Base temperature logic based on seed or custom input
  const baseTemp = customBaseTemp ?? (15 + (seed % 18));
  
  // 24-Hour Forecast Generation
  const hourly: HourlyForecastItem[] = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() + i);
    const hour24 = date.getHours();
    const isNight = hour24 >= 19 || hour24 < 6;

    const timeLabel = i === 0 ? 'Now' : date.toLocaleTimeString([], { hour: 'numeric' });
    
    // Wave pattern for day/night temperature cycle
    const tempVariation = Math.sin((i - 5) / 24 * Math.PI * 2) * 5.5 + Math.cos(i / 3) * 0.8;
    const temp = Math.round((baseTemp + tempVariation) * 10) / 10;
    const feelsLike = Math.round((temp + (i % 2 === 0 ? 0.8 : -0.4)) * 10) / 10;
    
    // Determine condition based on hour index & city seed
    let condition: WeatherCondition = 'Partly Cloudy';
    let icon = isNight ? 'fa-cloud-moon' : 'fa-cloud-sun';
    let rainProb = 0;

    const condPattern = (seed + i) % 10;
    if (condPattern === 0 || condPattern === 1) {
      condition = 'Clear Sky';
      icon = isNight ? 'fa-moon' : 'fa-sun';
      rainProb = 0;
    } else if (condPattern === 2 || condPattern === 3) {
      condition = 'Partly Cloudy';
      icon = isNight ? 'fa-cloud-moon' : 'fa-cloud-sun';
      rainProb = 15;
    } else if (condPattern === 4 || condPattern === 5) {
      condition = 'Overcast';
      icon = 'fa-cloud';
      rainProb = 35;
    } else if (condPattern === 6 || condPattern === 7) {
      condition = 'Light Rain';
      icon = isNight ? 'fa-cloud-moon-rain' : 'fa-cloud-sun-rain';
      rainProb = 60 + (i * 2) % 30;
    } else if (condPattern === 8) {
      condition = 'Heavy Rain';
      icon = 'fa-cloud-showers-heavy';
      rainProb = 85;
    } else {
      condition = 'Thunderstorm';
      icon = 'fa-cloud-bolt';
      rainProb = 90;
    }

    return {
      index: i,
      timeLabel,
      hour24,
      temp,
      feelsLike,
      condition,
      icon,
      rainProb,
      windSpeed: Math.round(8 + (i * 1.5) % 15),
      humidity: Math.round(55 + Math.sin(i) * 20),
      uvIndex: isNight ? 0 : Math.max(1, Math.round(8 - Math.abs(13 - hour24)))
    };
  });

  const temps = hourly.map(h => h.temp);
  const minTemp = Math.round(Math.min(...temps));
  const maxTemp = Math.round(Math.max(...temps));
  const currentTemp = hourly[0].temp;
  const currentCondition = hourly[0].condition;
  const currentIcon = hourly[0].icon;

  // Generate 7 Days Daily Forecast
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIdx = new Date().getDay();

  const daily: DailyForecastItem[] = Array.from({ length: 7 }, (_, idx) => {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() + idx);
    const dayName = idx === 0 ? 'Today' : daysOfWeek[(todayIdx + idx) % 7];
    const dateStr = dayDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

    const daySeed = seed + idx;
    const dayMin = Math.round(minTemp + (daySeed % 4) - 2);
    const dayMax = Math.round(maxTemp + (daySeed % 5) - 2);

    let dayCond: WeatherCondition = 'Partly Cloudy';
    let dayIcon = 'fa-cloud-sun';
    let rainProb = (daySeed * 17) % 80;

    if (daySeed % 4 === 0) {
      dayCond = 'Clear Sky';
      dayIcon = 'fa-sun';
      rainProb = 5;
    } else if (daySeed % 4 === 1) {
      dayCond = 'Partly Cloudy';
      dayIcon = 'fa-cloud-sun';
      rainProb = 20;
    } else if (daySeed % 4 === 2) {
      dayCond = 'Light Rain';
      dayIcon = 'fa-cloud-sun-rain';
      rainProb = 65;
    } else {
      dayCond = 'Thunderstorm';
      dayIcon = 'fa-cloud-bolt';
      rainProb = 80;
    }

    return {
      dayName,
      dateStr,
      condition: dayCond,
      icon: dayIcon,
      minTemp: dayMin,
      maxTemp: dayMax,
      rainProb
    };
  });

  const aqiVal = 25 + (seed % 65);
  let aqiLabel = 'Good';
  if (aqiVal > 50 && aqiVal <= 100) aqiLabel = 'Moderate';
  else if (aqiVal > 100) aqiLabel = 'Unhealthy';

  const uvVal = hourly[0].uvIndex || 4;
  let uvLvl = 'Low';
  if (uvVal >= 3 && uvVal <= 5) uvLvl = 'Moderate';
  else if (uvVal >= 6 && uvVal <= 7) uvLvl = 'High';
  else if (uvVal >= 8) uvLvl = 'Very High';

  return {
    id: cityName.toLowerCase().replace(/\s+/g, '-'),
    cityName,
    country,
    lat: 35.6762,
    lon: 139.6503,
    currentTemp,
    feelsLike: hourly[0].feelsLike,
    condition: currentCondition,
    icon: currentIcon,
    highTemp: maxTemp,
    lowTemp: minTemp,
    humidity: 65 + (seed % 20),
    dewPoint: Math.round(currentTemp - 5),
    windSpeed: 12 + (seed % 10),
    windDirection: 'NE',
    windAngle: 45 + (seed % 90),
    uvIndex: uvVal,
    uvLevel: uvLvl,
    pressure: 1012 + (seed % 10),
    visibility: '10.0 km',
    airQualityIndex: aqiVal,
    airQualityLabel: aqiLabel,
    sunrise: '05:42 AM',
    sunset: '06:18 PM',
    hourly,
    daily,
    insight: currentCondition.includes('Rain') 
      ? 'Rain expected later today. Don\'t forget your umbrella!'
      : currentTemp > 28 
      ? 'Warm & clear atmosphere. Excellent for outdoor leisure, stay hydrated.'
      : 'Pleasant atmospheric balance with mild breeze.'
  };
}
