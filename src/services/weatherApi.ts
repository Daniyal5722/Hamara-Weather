import { CityWeatherData, HourlyForecastItem, DailyForecastItem, WeatherCondition, SearchResultItem } from '../types';
import { generateWeatherDataForCity, findNearestCity } from '../data/weatherData';

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

// Format local ISO time string e.g. "2026-09-12T14:30" to "2:30 PM"
function formatIsoTimeTo12h(isoStr?: string): string {
  if (!isoStr || !isoStr.includes('T')) return '12:00 PM';
  const timePart = isoStr.split('T')[1];
  if (!timePart) return '12:00 PM';
  const [hStr, mStr] = timePart.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr ? mStr.slice(0, 2) : '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// Format local ISO hour string e.g. "2026-09-12T14:00" to "2 PM"
function formatIsoHourTo12h(isoStr?: string): string {
  if (!isoStr || !isoStr.includes('T')) return '12 PM';
  const timePart = isoStr.split('T')[1];
  if (!timePart) return '12 PM';
  const h = parseInt(timePart.split(':')[0], 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12} ${ampm}`;
}

// Reverse Geocode latitude and longitude to exact location name (City, Admin Region, Country)
export async function reverseGeocodeCoords(lat: number, lon: number): Promise<{ cityName: string; countryName: string; admin1?: string }> {
  // Provider 1: BigDataCloud Reverse Geocoding
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.localityInfo?.administrative?.[2]?.name || data.localityInfo?.administrative?.[1]?.name;
      const country = data.countryName || '';
      const admin1 = data.principalSubdivision || '';
      if (city) {
        return { cityName: city, countryName: country || 'Global', admin1 };
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocoding failed:', err);
  }

  // Provider 2: Nominatim OpenStreetMap Reverse Geocoding
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(nomUrl, { headers: { 'Accept-Language': 'en' } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || addr.state_district;
        const country = addr.country || '';
        const admin1 = addr.state || '';
        if (city) {
          return { cityName: city, countryName: country || 'Global', admin1 };
        }
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocoding failed:', err);
  }

  // Provider 3: Open-Meteo Geocoding lookup by coordinates range or distance check to static database
  const { nearest, distanceKm } = findNearestCity(lat, lon);
  if (distanceKm < 50) {
    return { cityName: nearest.name, countryName: nearest.country };
  }

  return { cityName: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`, countryName: 'Current GPS' };
}

// Fetch IP-based current location as fallback when browser GPS is blocked/denied
export async function fetchIpLocation(): Promise<{ cityName: string; countryName: string; lat: number; lon: number } | null> {
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);
        const cityName = data.city || 'My Location';
        const countryName = data.country || 'Global';
        return { cityName, countryName, lat, lon };
      }
    }
  } catch (err) {
    console.warn('IP location fallback failed:', err);
  }
  return null;
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
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`;

    const [resWeather, resAqi] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl).catch(() => null)
    ]);

    if (!resWeather.ok) {
      throw new Error(`Open-Meteo API status ${resWeather.status}`);
    }

    const data = await resWeather.json();
    const current = data.current;
    const hourlyData = data.hourly;
    const dailyData = data.daily;

    let usAqi = 35;
    if (resAqi && resAqi.ok) {
      const aqiData = await resAqi.json();
      if (aqiData.current?.us_aqi !== undefined && aqiData.current?.us_aqi !== null) {
        usAqi = Math.round(aqiData.current.us_aqi);
      }
    }

    const isNight = current.is_day === 0;
    const { condition, icon } = mapWmoCodeToCondition(current.weather_code, isNight);

    // Align starting hourly index with current local time of location
    let startIndex = 0;
    if (hourlyData?.time && Array.isArray(hourlyData.time) && current?.time) {
      const matchIdx = hourlyData.time.findIndex((t: string) => t === current.time);
      if (matchIdx >= 0) {
        startIndex = matchIdx;
      }
    }

    // Map 24 hours timeline starting from current local hour
    const hourly: HourlyForecastItem[] = [];
    const totalHourlyRecords = hourlyData.time?.length || 24;

    for (let i = 0; i < 24; i++) {
      const idx = (startIndex + i) % totalHourlyRecords;
      const rawTime = hourlyData.time[idx];
      const hour24 = rawTime && rawTime.includes('T') ? parseInt(rawTime.split('T')[1].split(':')[0], 10) : i;
      const hourNight = hour24 >= 19 || hour24 < 6;

      const timeLabel = i === 0 ? 'Now' : formatIsoHourTo12h(rawTime);

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
      let dayName = 'Today';
      let formattedDateStr = 'Today';

      if (dateStrRaw) {
        const parts = dateStrRaw.split('-');
        if (parts.length === 3) {
          const dDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          dayName = d === 0 ? 'Today' : daysOfWeek[dDate.getDay()];
          formattedDateStr = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }

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
    const dewPoint = Math.round(hourlyData.dew_point_2m?.[startIndex] ?? currentTemp - 5);
    const windSpeed = Math.round(current.wind_speed_10m ?? 12);
    const windAngle = Math.round(current.wind_direction_10m ?? 45);
    const windDirection = windAngleToDirection(windAngle);
    const uvVal = Math.round(dailyData.uv_index_max?.[0] ?? 4);

    let uvLevel = 'Low';
    if (uvVal >= 3 && uvVal <= 5) uvLevel = 'Moderate';
    else if (uvVal >= 6 && uvVal <= 7) uvLevel = 'High';
    else if (uvVal >= 8) uvLevel = 'Very High';

    const pressure = Math.round(current.surface_pressure ?? 1013);
    const rawVis = hourlyData.visibility?.[startIndex] ? (hourlyData.visibility[startIndex] / 1000).toFixed(1) : '10.0';
    const visibility = `${rawVis} km`;

    // Sunrise & Sunset formatted in local timezone time
    const sunrise = formatIsoTimeTo12h(dailyData.sunrise?.[0]);
    const sunset = formatIsoTimeTo12h(dailyData.sunset?.[0]);

    // AQI Classification
    let aqiLabel = 'Good';
    if (usAqi > 50 && usAqi <= 100) aqiLabel = 'Moderate';
    else if (usAqi > 100 && usAqi <= 150) aqiLabel = 'Unhealthy (Sensitive)';
    else if (usAqi > 150) aqiLabel = 'Unhealthy';

    // Weather Insight
    let insight = 'Pleasant atmospheric balance with mild breeze.';
    if (condition.includes('Rain') || condition === 'Thunderstorm') {
      insight = 'Precipitation active today. Remember your umbrella when heading out!';
    } else if (uvVal >= 6) {
      insight = 'High UV index today. Sun protection and sunglasses recommended.';
    } else if (currentTemp > 30) {
      insight = 'Warm temperatures today. Stay hydrated during outdoor activities.';
    } else if (currentTemp < 5) {
      insight = 'Cold atmospheric temperature. Dress in warm layers.';
    }

    return {
      id: `${cityName.toLowerCase().replace(/\s+/g, '-')}-${Math.round(lat * 100)}`,
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
      airQualityIndex: usAqi,
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
