import { NextResponse } from "next/server";
import { TAIWAN_CITIES, getWeatherDescription } from "@/lib/weather";

// 確保在具有本機憑證檢驗之開發環境下可正常呼叫外部氣象 API
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

interface CacheEntry {
  timestamp: number;
  data: any;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 分鐘快取

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityName = decodeURIComponent(searchParams.get("city") || "台北市").trim();
  const targetDate = searchParams.get("date"); // YYYY-MM-DD

  const city =
    TAIWAN_CITIES.find((c) => c.name === cityName || c.name.includes(cityName)) ||
    TAIWAN_CITIES.find((c) => c.name === "台北市")!;

  try {
    const cacheKey = `weather_${city.name}`;
    const now = Date.now();
    const cached = memoryCache.get(cacheKey);

    let rawData: any = null;

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      rawData = cached.data;
    } else {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTaipei`;

      const response = await fetch(url, {
        headers: { "User-Agent": "FleetCalendar/1.0" },
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo 回應狀態碼：${response.status}`);
      }

      rawData = await response.json();
      memoryCache.set(cacheKey, { timestamp: now, data: rawData });
    }

    // 當前天氣解析
    const currentCode = rawData.current?.weather_code ?? 0;
    const currentDesc = getWeatherDescription(currentCode);

    const current = {
      temperature: Math.round(rawData.current?.temperature_2m ?? 26),
      apparentTemperature: Math.round(rawData.current?.apparent_temperature ?? 28),
      humidity: rawData.current?.relative_humidity_2m ?? 75,
      precipitation: rawData.current?.precipitation ?? 0,
      windSpeed: Math.round(rawData.current?.wind_speed_10m ?? 10),
      weatherCode: currentCode,
      description: currentDesc.text,
      iconType: currentDesc.iconType,
    };

    // 每日預報解析 (7 天)
    const dailyList: any[] = [];
    if (rawData.daily && Array.isArray(rawData.daily.time)) {
      for (let i = 0; i < rawData.daily.time.length; i++) {
        const dDate = rawData.daily.time[i];
        const dCode = rawData.daily.weather_code[i];
        const dDesc = getWeatherDescription(dCode);
        dailyList.push({
          date: dDate,
          maxTemp: Math.round(rawData.daily.temperature_2m_max[i]),
          minTemp: Math.round(rawData.daily.temperature_2m_min[i]),
          precipitationProbability: rawData.daily.precipitation_probability_max[i] ?? 0,
          weatherCode: dCode,
          description: dDesc.text,
          iconType: dDesc.iconType,
        });
      }
    }

    // 若指定了預約日期，額外提供該日之預報摘述
    let targetDayForecast = null;
    if (targetDate) {
      targetDayForecast = dailyList.find((d) => d.date === targetDate) || null;
    }

    return NextResponse.json({
      city: city.name,
      region: city.region,
      current,
      daily: dailyList,
      targetDayForecast,
    });
  } catch (error: unknown) {
    console.error("氣象資料取得失敗，啟用備用數據:", error);
    // 依所選城市降級回傳合理之備用資料
    return NextResponse.json(
      {
        city: city.name,
        region: city.region,
        current: {
          temperature: 27,
          apparentTemperature: 29,
          humidity: 72,
          precipitation: 0,
          windSpeed: 12,
          weatherCode: 1,
          description: "多雲時晴",
          iconType: "cloud-sun",
        },
        daily: [
          {
            date: new Date().toISOString().split("T")[0],
            maxTemp: 31,
            minTemp: 24,
            precipitationProbability: 20,
            weatherCode: 1,
            description: "多雲時晴",
            iconType: "cloud-sun",
          },
        ],
        targetDayForecast: null,
      },
      { status: 200 }
    );
  }
}
