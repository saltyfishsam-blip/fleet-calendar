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
  Check,
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

  const [weatherTip, setWeatherTip] = useState<{
    tempRange: string;
    desc: string;
    rainProb: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    Promise.all([
      fetch("/api/admin/vehicles").then((r) => r.json()),
      fetch("/api/admin/projects").then((r) => r.json()),
      fetch("/api/admin/personnel").then((r) => r.json()),
    ])
      .then(([vData, pData, psData]) => {
        const activeV = (vData.vehicles || []).filter((v: Vehicle) => v.isActive);
        setVehicles(activeV);
        setProjects((pData.projects || []).filter((p: any) => p.isActive));
        setPersonnelList((psData.personnel || []).filter((p: any) => p.isActive));

        if (editBooking) {
          setDate(editBooking.startDate.split("T")[0]);
          setTimeSlot(editBooking.timeSlot);
          setVehicleId(String(editBooking.vehicle.id));
          setProjectId(editBooking.project ? String(editBooking.project.id) : "");
          setReason(editBooking.reason);
          setSelectedPersonnelIds(editBooking.companions.map((c: any) => c.id));
        } else {
          setDate(initialDate || new Date().toISOString().split("T")[0]);
          setTimeSlot("MORNING");
          setVehicleId(activeV.length > 0 ? String(activeV[0].id) : "");
          setProjectId("");
          setReason("");
          setSelectedPersonnelIds([]);
        }
      })
      .catch(() => {});
  }, [isOpen, initialDate, editBooking]);

  useEffect(() => {
    if (!date || !targetCity) return;
    fetch(`/api/weather?city=${encodeURIComponent(targetCity)}&date=${date}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.targetDayForecast) {
          const f = data.targetDayForecast;
          setWeatherTip({
            tempRange: `${f.minTemp}°C ~ ${f.maxTemp}°C`,
            desc: f.description,
            rainProb: f.precipitationProbability,
          });
        } else if (data?.current) {
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
    if (selectedPersonnelIds.includes(id)) {
      setSelectedPersonnelIds(selectedPersonnelIds.filter((pId) => pId !== id));
    } else {
      setSelectedPersonnelIds([...selectedPersonnelIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!vehicleId) {
      setErrorMsg("請選擇用車車輛");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("請輸入借用事由");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        date,
        timeSlot,
        vehicleId: parseInt(vehicleId, 10),
        projectId: projectId ? parseInt(projectId, 10) : null,
        reason: reason.trim(),
        companionIds: selectedPersonnelIds,
      };

      const url = editBooking ? `/api/bookings/${editBooking.id}` : "/api/bookings";
      const method = editBooking ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "預約失敗，請確認資料");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setErrorMsg("連線伺服器異常，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900/90 border border-white/[0.12] rounded-3xl shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/10">
        {/* 頂部標題 */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-white/20">
              <Car className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              {editBooking ? "修改用車預約" : "建立公務用車預約"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-rose-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 預約日期與時段 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>預約日期</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>預約時段</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="MORNING">上午 (08:00 - 12:00)</option>
                <option value="AFTERNOON">下午 (13:00 - 17:30)</option>
                <option value="ALL_DAY">全天 (08:00 - 18:00)</option>
              </select>
            </div>
          </div>

          {/* 目的地與天氣預報輔助提示 */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>目的地縣市 (出勤氣象參考)</span>
              </label>
              <select
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="bg-slate-900 border border-white/[0.1] rounded-xl px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {TAIWAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name} className="bg-slate-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {weatherTip && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-300 font-medium">
                <div className="flex items-center space-x-2">
                  <CloudSun className="w-4 h-4 text-amber-400" />
                  <span>
                    {targetCity}預估：<strong className="text-white">{weatherTip.desc}</strong> ({weatherTip.tempRange})
                  </span>
                </div>
                <div className="flex items-center text-cyan-400 font-bold text-[11px]">
                  <Droplets className="w-3.5 h-3.5 mr-0.5" />
                  <span>降雨 {weatherTip.rainProb}%</span>
                </div>
              </div>
            )}
          </div>

          {/* 選擇用車車輛 */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 mb-1.5">
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              <span>借用車輛</span>
            </label>
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900">
                  {v.plateNumber} · {v.model} ({v.capacity} 人座)
                </option>
              ))}
            </select>
          </div>

          {/* 計畫案件名稱 */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 mb-1.5">
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              <span>計畫案件代號 / 名稱</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="" className="bg-slate-900">無特定專案 (一般公務洽公)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name} {p.code ? `(${p.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* 借用事由 */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>借用事由 / 目的地</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例：前往北區廠房進行設備例行檢查"
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* 同行人員多選標籤 */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 mb-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>同行人員（點選快速加入）</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-slate-950/60 border border-white/[0.08] rounded-2xl">
              {personnelList.map((p) => {
                const isSelected = selectedPersonnelIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePersonnel(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 border cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-white/20 shadow-md shadow-blue-500/20"
                        : "bg-white/[0.03] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
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
          <div className="pt-3 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-white/[0.1] text-slate-300 hover:bg-white/[0.08] text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 border border-white/20 transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "處理中..." : editBooking ? "儲存修改" : "確認送出預約"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
