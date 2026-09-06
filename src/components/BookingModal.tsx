"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Car,
  Folder,
  Users,
  FileText,
  AlertTriangle,
  MapPin,
  CloudSun,
  Droplets,
} from "lucide-react";
import { TAIWAN_CITIES } from "@/lib/weather";

interface Vehicle {
  id: number;
  plateNumber: string;
  model: string;
  capacity: number;
  isActive: boolean;
}

interface Project {
  id: number;
  name: string;
  code: string | null;
}

interface Personnel {
  id: number;
  name: string;
  department: string | null;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  editBooking?: any;
}

export default function BookingModal({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  editBooking,
}: BookingModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("MORNING");
  const [vehicleId, setVehicleId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [targetCity, setTargetCity] = useState("台北市");
  const [reason, setReason] = useState("");
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<number[]>([]);

  // 天氣預報提示
  const [weatherTip, setWeatherTip] = useState<{
    tempRange: string;
    desc: string;
    rainProb: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // 載入車輛、專案與人員名單
    Promise.all([
      fetch("/api/admin/vehicles").then((r) => r.json()),
      fetch("/api/admin/projects").then((r) => r.json()),
      fetch("/api/admin/personnel").then((r) => r.json()),
    ]).then(([vData, pData, psData]) => {
      const activeVehicles = (vData.vehicles || []).filter((v: Vehicle) => v.isActive);
      setVehicles(activeVehicles);
      setProjects(pData.projects || []);
      setPersonnelList(psData.personnel || []);

      if (editBooking) {
        setDate(editBooking.startDate.split("T")[0]);
        setTimeSlot(editBooking.timeSlot);
        setVehicleId(String(editBooking.vehicleId));
        setProjectId(editBooking.projectId ? String(editBooking.projectId) : "");
        setReason(editBooking.reason);
        setSelectedPersonnelIds(editBooking.companions.map((c: any) => c.id));
      } else {
        const todayStr = initialDate || new Date().toISOString().split("T")[0];
        setDate(todayStr);
        setTimeSlot("MORNING");
        if (activeVehicles.length > 0) setVehicleId(String(activeVehicles[0].id));
        if (pData.projects?.length > 0) setProjectId(String(pData.projects[0].id));
        setReason("");
        setSelectedPersonnelIds([]);
      }
      setErrorMsg("");
    });
  }, [isOpen, initialDate, editBooking]);

  // 當日期或目的地縣市改變時，抓取該日天氣預報提示
  useEffect(() => {
    if (!date || !targetCity) {
      setWeatherTip(null);
      return;
    }

    fetch(`/api/weather?city=${encodeURIComponent(targetCity)}&date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.targetDayForecast) {
          const tf = data.targetDayForecast;
          setWeatherTip({
            tempRange: `${tf.minTemp}°C - ${tf.maxTemp}°C`,
            desc: tf.description,
            rainProb: tf.precipitationProbability,
          });
        } else if (data.current) {
          setWeatherTip({
            tempRange: `${data.current.temperature}°C`,
            desc: data.current.description,
            rainProb: data.daily?.[0]?.precipitationProbability ?? 0,
          });
        }
      })
      .catch(() => setWeatherTip(null));
  }, [date, targetCity]);

  const togglePersonnel = (id: number) => {
    setSelectedPersonnelIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const payload = {
      date,
      timeSlot,
      vehicleId: parseInt(vehicleId, 10),
      projectId: projectId ? parseInt(projectId, 10) : null,
      reason,
      companionIds: selectedPersonnelIds,
    };

    try {
      const url = editBooking ? `/api/bookings/${editBooking.id}` : "/api/bookings";
      const method = editBooking ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "預約失敗");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setErrorMsg("伺服器連線失敗，請稍後再試");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal 標題列 */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {editBooking ? "編輯用車預約" : "建立用車預約"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-red-400 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 預約日期與時段 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>預約日期</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>預約時段</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="MORNING">上午 (08:00 - 12:00)</option>
                <option value="AFTERNOON">下午 (13:00 - 17:30)</option>
                <option value="ALL_DAY">全天 (08:00 - 18:00)</option>
              </select>
            </div>
          </div>

          {/* 目的地與天氣預報輔助提示 */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>目的地縣市 (氣象參考)</span>
              </label>
              <select
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {TAIWAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {weatherTip && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CloudSun className="w-4 h-4 text-amber-400" />
                  <span>
                    {targetCity}天候預估：<strong className="text-white">{weatherTip.desc}</strong> ({weatherTip.tempRange})
                  </span>
                </div>
                <div className="flex items-center text-blue-400 font-semibold text-[11px]">
                  <Droplets className="w-3.5 h-3.5 mr-0.5" />
                  <span>降雨機率 {weatherTip.rainProb}%</span>
                </div>
              </div>
            )}
          </div>

          {/* 選擇用車車輛 */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>借用車輛</span>
            </label>
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} - {v.model} ({v.capacity} 人座)
                </option>
              ))}
            </select>
          </div>

          {/* 計畫案件名稱 */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span>計畫案件代號 / 名稱</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">-- 無特定專案 (一般洽公) --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.code ? `(${p.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* 借用事由 */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>借用事由 / 目的地</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例：前往北區廠房進行設備例行檢查"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 同行人員多選標籤 */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-2">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>同行人員（點選加入標籤）</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
              {personnelList.map((p) => {
                const isSelected = selectedPersonnelIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePersonnel(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1 border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/30"
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <span>{p.name}</span>
                    {p.department && (
                      <span className={`text-[10px] ${isSelected ? "text-blue-200" : "text-slate-500"}`}>
                        ({p.department})
                      </span>
                    )}
                  </button>
                );
              })}
              {personnelList.length === 0 && (
                <span className="text-xs text-slate-500 p-1">暫無同行人員名冊</span>
              )}
            </div>
          </div>

          {/* 底部按鈕 */}
          <div className="pt-4 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {loading ? "處理中..." : editBooking ? "儲存修改" : "確認送出預約"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
