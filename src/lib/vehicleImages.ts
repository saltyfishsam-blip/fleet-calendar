/**
 * 車輛外觀圖庫與免費 Unsplash 圖片對照服務
 */

export interface VehicleImagePreset {
  id: string;
  category: "SEDAN" | "SUV" | "VAN" | "EV";
  categoryName: "商務轎車" | "運動休旅" | "商務廂型" | "純電公務";
  title: string;
  url: string;
}

export const VEHICLE_IMAGE_PRESETS: VehicleImagePreset[] = [
  {
    id: "sedan-1",
    category: "SEDAN",
    categoryName: "商務轎車",
    title: "商務深灰轎車 (Sedan)",
    url: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sedan-2",
    category: "SEDAN",
    categoryName: "商務轎車",
    title: "極簡雅緻房車",
    url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "suv-1",
    category: "SUV",
    categoryName: "運動休旅",
    title: "全地形商務休旅 (SUV)",
    url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "suv-2",
    category: "SUV",
    categoryName: "運動休旅",
    title: "高底盤都會休旅",
    url: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "van-1",
    category: "VAN",
    categoryName: "商務廂型",
    title: "多功能商務客車 (Van / MPV)",
    url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ev-1",
    category: "EV",
    categoryName: "純電公務",
    title: "純電智慧公務車 (EV)",
    url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
  },
];

/**
 * 依車輛型號或車牌自動匹配適當之車輛照片
 */
export function getVehicleImage(model?: string, plateNumber?: string, customUrl?: string | null): string {
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl;
  }

  const modelLower = (model || "").toLowerCase();

  // 判斷是否為廂型車 / MPV / Van
  if (
    modelLower.includes("van") ||
    modelLower.includes("hiace") ||
    modelLower.includes("alphard") ||
    modelLower.includes("sienna") ||
    modelLower.includes("廂型") ||
    modelLower.includes("9人") ||
    modelLower.includes("8人") ||
    modelLower.includes("7人")
  ) {
    return VEHICLE_IMAGE_PRESETS[4].url;
  }

  // 判斷是否為休旅車 / SUV
  if (
    modelLower.includes("suv") ||
    modelLower.includes("rav4") ||
    modelLower.includes("cr-v") ||
    modelLower.includes("cx-5") ||
    modelLower.includes("休旅") ||
    modelLower.includes("kuga") ||
    modelLower.includes("tucson")
  ) {
    return VEHICLE_IMAGE_PRESETS[2].url;
  }

  // 判斷是否為純電車 / EV
  if (
    modelLower.includes("tesla") ||
    modelLower.includes("ev") ||
    modelLower.includes("純電") ||
    modelLower.includes("model 3") ||
    modelLower.includes("model y")
  ) {
    return VEHICLE_IMAGE_PRESETS[5].url;
  }

  // 預設商務轎車
  return VEHICLE_IMAGE_PRESETS[0].url;
}

/**
 * 系統精選背景圖片庫
 */
export const SYSTEM_BACKGROUNDS = {
  // 登入頁專用沉浸式商務車隊背景
  loginHero: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
  // 備用夜幕車流光軌背景
  nightFleet: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
  // 科技幾何極簡背景
  minimalTech: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
};
