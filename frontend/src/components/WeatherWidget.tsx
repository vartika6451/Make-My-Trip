import React, { useState } from 'react';
import { CloudRain, Sun, Cloud, Thermometer, Wind, Droplets } from 'lucide-react';

const mockWeatherData: Record<string, { temp: number; desc: string; wind: number; humidity: number; icon: 'sun' | 'rain' | 'cloud' }> = {
  Mumbai: { temp: 31, desc: 'Humid & Overcast', wind: 14, humidity: 82, icon: 'cloud' },
  Delhi: { temp: 38, desc: 'Hot & Clear', wind: 8, humidity: 35, icon: 'sun' },
  Bangalore: { temp: 26, desc: 'Pleasant & Cloudy', wind: 18, humidity: 60, icon: 'cloud' },
  Goa: { temp: 29, desc: 'Thunderstorms Likely', wind: 22, humidity: 90, icon: 'rain' },
  London: { temp: 18, desc: 'Light Drizzle', wind: 15, humidity: 75, icon: 'rain' },
  'New York': { temp: 24, desc: 'Partly Cloudy', wind: 12, humidity: 55, icon: 'cloud' },
};

export default function WeatherWidget() {
  const [city, setCity] = useState('Delhi');
  const weather = mockWeatherData[city] || mockWeatherData['Delhi'];

  const getIcon = () => {
    switch (weather.icon) {
      case 'sun':
        return <Sun size={48} className="text-amber-500 animate-pulse" />;
      case 'rain':
        return <CloudRain size={48} className="text-blue-400 animate-bounce" />;
      default:
        return <Cloud size={48} className="text-slate-400" />;
    }
  };

  return (
    <div className="glass rounded-3xl p-6 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl flex flex-col justify-between h-[320px]">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Thermometer className="text-brand-accent" size={20} />
          Destination Weather
        </h3>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {Object.keys(mockWeatherData).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between my-6">
        <div>
          <span className="text-5xl font-black">{weather.temp}°C</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">{weather.desc}</p>
        </div>
        {getIcon()}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-700/50 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Wind size={14} className="text-brand-secondary" />
          <span>Wind: {weather.wind} km/h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets size={14} className="text-brand-secondary" />
          <span>Humidity: {weather.humidity}%</span>
        </div>
      </div>
    </div>
  );
}
