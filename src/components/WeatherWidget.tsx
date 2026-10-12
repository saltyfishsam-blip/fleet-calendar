"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Droplets,
  Wind,
  MapPin,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Compass,
} from "lucide-react";
import { TAIWAN_CITIES } from "@/lib/weather";

interface WeatherData {
  city: string;
  region: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
    description: string;
    iconType: string;
  };
  daily: {
    date: string;
    maxTemp: number;
    minTemp: number;
    precipitationProbability: number;
    weatherCode: number;
    description: string;
    iconType: string;
  }[];
}

const STORAGE_KEY = "fleet_preferred_weather_city";

export default function WeatherWidget({
  onCityChange,
}: {
  onCityChange?: (city: string) => void;
}) {
  const [selectedCity, setSelectedCity] = useState<string>("台北市");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem(STORAGE_KEY);
      if (savedCity && TAIWAN_CITIES.some((c) => c.name === savedCity)) {
        setSelectedCity(savedCity);
      }
    }
  }, []);

  const fetchWeatherData = useCallback(async (city: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      setWeather(data);
    } catch {
      // 靜默降級處理
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData(selectedCity);
    if (onCityChange) onCityChange(selectedCity);
  }, [selectedCity, fetchWeatherData, onCityChange]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, city);
    }
  };

  const renderWeatherIcon = (iconType: string, className = "w-6 h-6") => {
    switch (iconType) {
      case "sun":
        return <Sun className={`${className} text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]`} />;
      case "cloud-sun":
        return <CloudSun className={`${className} text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.4)]`} />;
      case "cloud":
        return <Cloud className={`${className} text-slate-300 drop-shadow-[0_0_6px_rgba(203,213,225,0.3)]`} />;
      case "rain":
        return <CloudRain className={`${className} text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]`} />;
      case "heavy-rain":
      case "thunder":
        return <CloudLightning className={`${className} text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]`} />;
      case "fog":
        return <CloudFog className={`${className} text-slate-400`} />;
      default:
        return <CloudSun className={`${className} text-amber-300`} />;
    }
  };

  return (
    <div className="relative overflow-hidden bg-white/95 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 transition-all duration-300">
      {/* 頂部：城市選擇與即時氣溫概況 */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* 左側：城市選單與地區標籤 */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mr-2 shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer pr-8 appearance-none transition shadow-xs"
            >
              {["北部", "中部", "南部", "東部", "離島"].map((region) => (
                <optgroup key={region} label={`【${region}地區】`} className="bg-white text-slate-500">
                  {TAIWAN_CITIES.filter((c) => c.region === region).map((city) => (
                    <option key={city.name} value={city.name} className="text-slate-800">
                      {city.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
          </div>

          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-medium hidden sm:inline tracking-wide">
            自訂區域氣象
          </span>
        </div>

        {/* 右側：即時數據與展開按鈕 */}
        {weather && weather.current && (
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <div className="flex items-center space-x-3">
              {renderWeatherIcon(weather.current.iconType, "w-8 h-8")}
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {weather.current.temperature}°C
                  </span>
                  <span className="text-xs font-bold text-blue-600 tracking-wide">
                    {weather.current.description}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center space-x-2 font-medium">
                  <span>體感 {weather.current.apparentTemperature}°C</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center text-blue-600">
                    <Droplets className="w-3 h-3 mr-0.5 inline text-blue-500" />
                    降雨 {weather.daily[0]?.precipitationProbability ?? 0}%
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="hidden sm:flex items-center text-slate-500">
                    <Wind className="w-3 h-3 mr-0.5 inline" />
                    {weather.current.windSpeed} km/h
                  </span>
                </div>
              </div>
            </div>

            {/* 展開 3 日預報切換按鈕 */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition flex items-center space-x-1.5 text-xs font-semibold cursor-pointer shadow-xs"
              title={isExpanded ? "收合預報" : "展開未來預報"}
            >
              <span className="hidden sm:inline">{isExpanded ? "收合" : "3 日出勤預報"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* 展開部分：未來 3 天預報卡片 */}
      {isExpanded && weather && weather.daily && (
        <div className="relative z-10 mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>{selectedCity} 未來 3 日出勤天氣趨勢</span>
            </span>
            <span className="text-[11px] text-slate-400">提供出車行車安全參考</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {weather.daily.slice(1, 4).map((day) => {
              const [, m, d] = day.date.split("-");
              return (
                <div
                  key={day.date}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center justify-between text-xs transition duration-150"
                >
                  <div className="flex items-center space-x-3">
                    {renderWeatherIcon(day.iconType, "w-6 h-6")}
                    <div>
                      <div className="font-bold text-slate-800 tracking-wide">
                        {m}月{d}日
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{day.description}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-700">
                      {day.minTemp}°C ~ {day.maxTemp}°C
                    </div>
                    <div className="text-[10px] font-semibold text-blue-600 flex items-center justify-end mt-0.5">
                      <Droplets className="w-3 h-3 mr-0.5 text-blue-500" />
                      降雨 {day.precipitationProbability}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
