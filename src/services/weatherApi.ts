import { CityWeatherData, HourlyForecastItem, DailyForecastItem, WeatherCondition, SearchResultItem } from '../types';
import { generateWeatherDataForCity } from '../data/weatherData';

// Map WMO Weather Interpretation Codes from Open-Meteo
export function mapWmoCodeToCondition(code: number, isNight: boolean = false): { condition: WeatherCondition; icon: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: isNight ? 'fa-moon' : 'fa-sun' };
    case 1:
    case 2:
      return { condition: 'Partly Cloudy', icon: isNight ? 'fa-cloud-moon' : 'fa-cloud-sun' };
    case 3:
      return { condition: 'Overcast', icon: 'fa-cloud' };
    case 45:
    case 48:
      return { condition: 'Mist', icon: 'fa-smog' };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
    case 61:
    case 63:
    case 66:
      return { condition: 'Light Rain', icon: isNight ? 'fa-cloud-moon-rain' : 'fa-cloud-sun-rain' };
    case 65:
    case 67:
    case 80:
    case 81:
    case 82:
      return { condition: 'Heavy Rain', icon: 'fa-cloud-showers-heavy' };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return { condition: 'Snow', icon: 'fa-snowflake' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', icon: 'fa-cloud-bolt' };
    default:
      return { condition: 'Partly Cloudy', icon: isNight ? 'fa-cloud-moon' : 'fa-cloud-sun' };
  }
}

// Convert wind angle degrees to compass direction
export function windAngleToDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
  return directions[index];
}

// Search locations using Open-Meteo Geocoding API
export async function searchLocations(query: string): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      country: item.country || '',
      admin1: item.admin1 || '',
      latitude: item.latitude,
      longitude: item.longitude
    }));
  } catch (err) {
    console.warn('Geocoding API failed, returning empty:', err);
    return [];
  }
}

// Fetch real live weather from Open-Meteo API
export async function fetchLiveWeatherData(
  lat: number,
  lon: number,
  cityName: string,
  countryName: string,
  admin1?: string
): Promise<CityWeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo API status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;
    const hourlyData = data.hourly;
    const dailyData = data.daily;

    const isNight = current.is_day === 0;
    const { condition, icon } = mapWmoCodeToCondition(current.weather_code, isNight);

    // Map 24 hours timeline
    const currentHourIndex = new Date().getHours();
    const hourly: HourlyForecastItem[] = [];

    for (let i = 0; i < 24; i++) {
      const idx = i;
      const rawTime = hourlyData.time[idx];
      const timeDate = rawTime ? new Date(rawTime) : new Date();
      timeDate.setHours(timeDate.getHours());

      const hour24 = timeDate.getHours();
      const hourNight = hour24 >= 19 || hour24 < 6;
      const timeLabel = i === 0 ? 'Now' : timeDate.toLocaleTimeString([], { hour: 'numeric' });

      const hCode = hourlyData.weather_code?.[idx] ?? 0;
      const hCond = mapWmoCodeToCondition(hCode, hourNight);

      hourly.push({
        index: i,
        timeLabel,
        hour24,
        temp: Math.round((hourlyData.temperature_2m?.[idx] ?? 20) * 10) / 10,
        feelsLike: Math.round((hourlyData.apparent_temperature?.[idx] ?? 20) * 10) / 10,
        condition: hCond.condition,
        icon: hCond.icon,
        rainProb: Math.round(hourlyData.precipitation_probability?.[idx] ?? 0),
        windSpeed: Math.round(hourlyData.wind_speed_10m?.[idx] ?? 10),
        humidity: Math.round(hourlyData.relative_humidity_2m?.[idx] ?? 50),
        uvIndex: Math.round(hourlyData.uv_index?.[idx] ?? 0)
      });
    }

    // Map 7 days daily forecast
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daily: DailyForecastItem[] = [];

    for (let d = 0; d < 7; d++) {
      const dateStrRaw = dailyData.time?.[d];
      const dDate = dateStrRaw ? new Date(dateStrRaw) : new Date();
      const dayName = d === 0 ? 'Today' : daysOfWeek[dDate.getDay()];
      const formattedDateStr = dDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

      const dCode = dailyData.weather_code?.[d] ?? 0;
      const dCond = mapWmoCodeToCondition(dCode, false);

      daily.push({
        dayName,
        dateStr: formattedDateStr,
        condition: dCond.condition,
        icon: dCond.icon,
        minTemp: Math.round(dailyData.temperature_2m_min?.[d] ?? 15),
        maxTemp: Math.round(dailyData.temperature_2m_max?.[d] ?? 25),
        rainProb: Math.round(dailyData.precipitation_probability_max?.[d] ?? 0)
      });
    }

    const currentTemp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    const highTemp = daily[0]?.maxTemp ?? currentTemp + 3;
    const lowTemp = daily[0]?.minTemp ?? currentTemp - 4;
    const humidity = Math.round(current.relative_humidity_2m ?? 60);
    const dewPoint = Math.round(hourlyData.dew_point_2m?.[0] ?? currentTemp - 5);
    const windSpeed = Math.round(current.wind_speed_10m ?? 12);
    const windAngle = Math.round(current.wind_direction_10m ?? 45);
    const windDirection = windAngleToDirection(windAngle);
    const uvVal = Math.round(dailyData.uv_index_max?.[0] ?? 4);

    let uvLevel = 'Low';
    if (uvVal >= 3 && uvVal <= 5) uvLevel = 'Moderate';
    else if (uvVal >= 6 && uvVal <= 7) uvLevel = 'High';
    else if (uvVal >= 8) uvLevel = 'Very High';

    const pressure = Math.round(current.surface_pressure ?? 1013);
    const rawVis = hourlyData.visibility?.[0] ? (hourlyData.visibility[0] / 1000).toFixed(1) : '10.0';
    const visibility = `${rawVis} km`;

    // Format Sunrise & Sunset
    const formatTime = (isoStr?: string) => {
      if (!isoStr) return '06:00 AM';
      const dt = new Date(isoStr);
      return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const sunrise = formatTime(dailyData.sunrise?.[0]);
    const sunset = formatTime(dailyData.sunset?.[0]);

    // Simulated AQI
    const aqiVal = Math.min(180, Math.max(15, Math.round(25 + (lat % 20) * 3)));
    let aqiLabel = 'Good';
    if (aqiVal > 50 && aqiVal <= 100) aqiLabel = 'Moderate';
    else if (aqiVal > 100) aqiLabel = 'Unhealthy';

    // Insight
    let insight = 'Pleasant atmospheric balance with mild breeze.';
    if (condition.includes('Rain') || condition === 'Thunderstorm') {
      insight = 'Precipitation active today. Remember your umbrella when heading out!';
    } else if (uvVal >= 6) {
      insight = 'High UV index today. Sun protection and sunglasses recommended.';
    } else if (currentTemp > 28) {
      insight = 'Warm temperatures today. Stay hydrated during outdoor activities.';
    } else if (currentTemp < 5) {
      insight = 'Cold atmospheric temperature. Dress in warm layers.';
    }

    return {
      id: `${cityName.toLowerCase().replace(/\s+/g, '-')}-${Math.round(lat)}`,
      cityName,
      country: countryName,
      admin1,
      lat,
      lon,
      currentTemp,
      feelsLike,
      condition,
      icon,
      highTemp,
      lowTemp,
      humidity,
      dewPoint,
      windSpeed,
      windDirection,
      windAngle,
      uvIndex: uvVal,
      uvLevel,
      pressure,
      visibility,
      airQualityIndex: aqiVal,
      airQualityLabel: aqiLabel,
      sunrise,
      sunset,
      hourly,
      daily,
      insight,
      isLiveApi: true
    };
  } catch (err) {
    console.warn('Open-Meteo live API call failed, falling back to mock generator:', err);
    return generateWeatherDataForCity(cityName, countryName);
  }
}
