export type WeatherCondition = 
  | 'Clear Sky'
  | 'Partly Cloudy'
  | 'Overcast'
  | 'Light Rain'
  | 'Heavy Rain'
  | 'Thunderstorm'
  | 'Snow'
  | 'Mist';

export interface HourlyForecastItem {
  index: number;
  timeLabel: string;
  hour24: number;
  temp: number; // in Celsius
  feelsLike: number;
  condition: WeatherCondition;
  icon: string; // FontAwesome icon class name
  rainProb: number; // percentage 0-100
  windSpeed: number; // km/h
  humidity: number; // percentage
  uvIndex: number;
}

export interface DailyForecastItem {
  dayName: string;
  dateStr: string;
  condition: WeatherCondition;
  icon: string;
  minTemp: number;
  maxTemp: number;
  rainProb: number;
}

export interface CityWeatherData {
  id: string;
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  currentTemp: number;
  feelsLike: number;
  condition: WeatherCondition;
  icon: string;
  highTemp: number;
  lowTemp: number;
  humidity: number;
  dewPoint: number;
  windSpeed: number;
  windDirection: string;
  windAngle: number;
  uvIndex: number;
  uvLevel: string;
  pressure: number;
  visibility: string;
  airQualityIndex: number; // AQI 1-500
  airQualityLabel: string;
  sunrise: string;
  sunset: string;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  insight: string;
}

export type TemperatureUnit = 'C' | 'F';
export type ThemeMode = 'dark' | 'light';
