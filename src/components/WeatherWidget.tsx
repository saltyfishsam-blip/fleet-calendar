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
  Sparkles,
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

  // 初始化時讀取 LocalStorage 偏好城市
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
      // 保持靜默降級
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

  // 渲染氣象圖標
  const renderWeatherIcon = (iconType: string, className = "w-6 h-6") => {
    switch (iconType) {
      case "sun":
        return <Sun className={`${className} text-amber-400`} />;
      case "cloud-sun":
        return <CloudSun className={`${className} text-amber-300`} />;
      case "cloud":
        return <Cloud className={`${className} text-slate-300`} />;
      case "rain":
        return <CloudRain className={`${className} text-blue-400`} />;
      case "heavy-rain":
      case "thunder":
        return <CloudLightning className={`${className} text-indigo-400`} />;
      case "fog":
        return <CloudFog className={`${className} text-slate-400`} />;
      default:
        return <CloudSun className={`${className} text-amber-300`} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl mb-6 transition-all duration-300">
      {/* 頂部：城市選擇與即時氣溫概況 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* 左側：城市選單與地區標籤 */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mr-2">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-7 appearance-none"
            >
              {["北部", "中部", "南部", "東部", "離島"].map((region) => (
                <optgroup key={region} label={`【${region}地區】`} className="bg-slate-900 text-slate-400">
                  {TAIWAN_CITIES.filter((c) => c.region === region).map((city) => (
                    <option key={city.name} value={city.name} className="text-white">
                      {city.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium hidden sm:inline">
            自訂工作區域
          </span>
        </div>

        {/* 右側：即時數據與展開按鈕 */}
        {weather && weather.current && (
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <div className="flex items-center space-x-2.5">
              {renderWeatherIcon(weather.current.iconType, "w-7 h-7")}
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {weather.current.temperature}°C
                  </span>
                  <span className="text-xs font-semibold text-blue-400">
                    {weather.current.description}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                  <span>體感 {weather.current.apparentTemperature}°C</span>
                  <span>•</span>
                  <span className="flex items-center text-blue-300">
                    <Droplets className="w-3 h-3 mr-0.5 inline" />
                    降雨機率 {weather.daily[0]?.precipitationProbability ?? 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* 展開 3 日預報切換按鈕 */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1 text-xs font-medium"
              title={isExpanded ? "收合預報" : "展開未來預報"}
            >
              <span className="hidden sm:inline">{isExpanded ? "收合" : "未來 3 日預報"}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* 展開部分：未來 3 天預報卡片 */}
      {isExpanded && weather && weather.daily && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center space-x-1">
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
              <span>{selectedCity} 未來 3 日出勤天氣趨勢</span>
            </span>
            <span className="text-[10px] text-slate-500">提供出車前行車天候安全參考</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {weather.daily.slice(1, 4).map((day) => {
              const [, m, d] = day.date.split("-");
              return (
                <div
                  key={day.date}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    {renderWeatherIcon(day.iconType, "w-6 h-6")}
                    <div>
                      <div className="font-bold text-white">
                        {m}月{d}日
                      </div>
                      <div className="text-[11px] text-slate-400">{day.description}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-200">
                      {day.minTemp}°C - {day.maxTemp}°C
                    </div>
                    <div className="text-[10px] text-blue-400 flex items-center justify-end">
                      <Droplets className="w-3 h-3 mr-0.5" />
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
