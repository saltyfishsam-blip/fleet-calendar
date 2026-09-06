// 台灣主要縣市經緯度字典與氣象資料解析工具

export interface CityCoord {
  name: string;
  lat: number;
  lon: number;
  region: string;
}

export const TAIWAN_CITIES: CityCoord[] = [
  { name: "台北市", lat: 25.033, lon: 121.5654, region: "北部" },
  { name: "新北市", lat: 25.0117, lon: 121.4658, region: "北部" },
  { name: "基隆市", lat: 25.1276, lon: 121.7392, region: "北部" },
  { name: "桃園市", lat: 24.9936, lon: 121.301, region: "北部" },
  { name: "新竹市", lat: 24.8138, lon: 120.9675, region: "北部" },
  { name: "新竹縣", lat: 24.8387, lon: 121.0177, region: "北部" },
  { name: "宜蘭縣", lat: 24.757, lon: 121.753, region: "東部" },
  { name: "苗栗縣", lat: 24.5602, lon: 120.8214, region: "中部" },
  { name: "台中市", lat: 24.1477, lon: 120.6736, region: "中部" },
  { name: "彰化縣", lat: 24.0518, lon: 120.5161, region: "中部" },
  { name: "南投縣", lat: 23.9609, lon: 120.9719, region: "中部" },
  { name: "雲林縣", lat: 23.7092, lon: 120.4313, region: "中部" },
  { name: "嘉義市", lat: 23.48, lon: 120.4491, region: "南部" },
  { name: "嘉義縣", lat: 23.4518, lon: 120.2555, region: "南部" },
  { name: "台南市", lat: 22.9997, lon: 120.227, region: "南部" },
  { name: "高雄市", lat: 22.6273, lon: 120.3014, region: "南部" },
  { name: "屏東縣", lat: 22.5519, lon: 120.5487, region: "南部" },
  { name: "花蓮縣", lat: 23.9872, lon: 121.6016, region: "東部" },
  { name: "台東縣", lat: 22.7583, lon: 121.1444, region: "東部" },
  { name: "澎湖縣", lat: 23.5712, lon: 119.5793, region: "離島" },
  { name: "金門縣", lat: 24.4492, lon: 118.3766, region: "離島" },
  { name: "連江縣", lat: 26.1558, lon: 119.9519, region: "離島" },
];

/**
 * WMO 天氣代碼解析對照表
 */
export function getWeatherDescription(code: number): {
  text: string;
  iconType: "sun" | "cloud-sun" | "cloud" | "rain" | "heavy-rain" | "thunder" | "fog";
} {
  switch (code) {
    case 0:
      return { text: "晴朗無雲", iconType: "sun" };
    case 1:
      return { text: "大致多雲", iconType: "cloud-sun" };
    case 2:
      return { text: "多雲時晴", iconType: "cloud-sun" };
    case 3:
      return { text: "陰天多雲", iconType: "cloud" };
    case 45:
    case 48:
      return { text: "濃霧天氣", iconType: "fog" };
    case 51:
    case 53:
    case 55:
      return { text: "局部細雨", iconType: "rain" };
    case 61:
    case 63:
      return { text: "有短暫雨", iconType: "rain" };
    case 65:
      return { text: "大雨滂沱", iconType: "heavy-rain" };
    case 80:
    case 81:
    case 82:
      return { text: "局部陣雨", iconType: "rain" };
    case 95:
    case 96:
    case 99:
      return { text: "雷陣雨", iconType: "thunder" };
    default:
      return { text: "多雲天候", iconType: "cloud" };
  }
}
