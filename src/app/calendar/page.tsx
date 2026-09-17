"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  LayoutGrid,
  ListFilter,
  Users,
  Car,
  Folder,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import BookingModal from "@/components/BookingModal";
import BookingDetailModal from "@/components/BookingDetailModal";
import WeatherWidget from "@/components/WeatherWidget";

interface BookingItem {
  id: number;
  reason: string;
  startDate: string;
  endDate: string;
  timeSlot: "MORNING" | "AFTERNOON" | "ALL_DAY" | "CUSTOM";
  status: string;
  vehicle: { id: number; plateNumber: string; model: string; capacity: number };
  project?: { id: number; name: string; code?: string } | null;
  user: { id: number; username: string; name: string; department?: string };
  companions: { id: number; name: string; department?: string }[];
  mileageLog?: {
    id: number;
    startMileage: number;
    endMileage?: number | null;
    distance?: number | null;
  } | null;
}

interface VehicleItem {
  id: number;
  plateNumber: string;
  model: string;
  capacity: number;
  isActive: boolean;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");
  const [loading, setLoading] = useState(true);

  // 當前登入使用者
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 控制 Modal 開關
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);
  const [targetDateForNewBooking, setTargetDateForNewBooking] = useState<string>("");
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<BookingItem | null>(null);

  // Toast 訊息提示
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const loadVehicles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles.filter((v: VehicleItem) => v.isActive));
      }
    } catch {
      // 靜默降級處理
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth() + 1;
      let url = `/api/bookings?year=${y}&month=${m}`;
      if (selectedVehicleId !== "all") {
        url += `&vehicleId=${selectedVehicleId}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch {
      showToast("載入預約行程失敗", "error");
    } finally {
      setLoading(false);
    }
  }, [currentDate, selectedVehicleId]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm("確定要刪除這筆借用預約嗎？")) return;

    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "刪除失敗", "error");
        return;
      }
      showToast("預約已成功刪除");
      setSelectedBookingForDetail(null);
      loadBookings();
    } catch {
      showToast("刪除失敗，請稍後再試", "error");
    }
  };

  const handleOpenEdit = (b: BookingItem) => {
    setSelectedBookingForDetail(null);
    setEditingBooking(b);
    setIsBookingModalOpen(true);
  };

  const handleOpenNewForDate = (dateStr: string) => {
    setEditingBooking(null);
    setTargetDateForNewBooking(dateStr);
    setIsBookingModalOpen(true);
  };

  // 月曆資料計算
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 是週日
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const getSlotColor = (slot: string) => {
    switch (slot) {
      case "MORNING":
        return "bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white border-blue-400/40 shadow-sm shadow-blue-500/10 hover:brightness-110";
      case "AFTERNOON":
        return "bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white border-amber-400/40 shadow-sm shadow-amber-500/10 hover:brightness-110";
      case "ALL_DAY":
      default:
        return "bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white border-emerald-400/40 shadow-sm shadow-emerald-500/10 hover:brightness-110";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Toast 提示訊息 */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 border text-xs font-semibold backdrop-blur-xl ${
              toastMsg.type === "success"
                ? "bg-slate-950/90 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/20"
                : "bg-slate-950/90 border-rose-500/50 text-rose-400 ring-1 ring-rose-500/20"
            }`}
          >
            {toastMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* 自訂區域即時與未來天氣小工具 */}
      <WeatherWidget />

      {/* 頂部控制工具列 */}
      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-6 shadow-2xl shadow-black/40 ring-1 ring-white/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* 年月導覽與快速按鈕 */}
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/[0.1] shadow-inner">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="上個月"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer tracking-wide"
              >
                今日
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="下個月"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-400 hidden sm:inline" />
              <span>{year} 年 {month + 1} 月</span>
            </h2>
          </div>

          {/* 車輛篩選與檢視模式切換 */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 車輛篩選下拉選單 */}
            <div className="flex items-center space-x-2 bg-slate-950/80 border border-white/[0.1] rounded-xl px-3.5 py-1.5 flex-1 sm:flex-initial shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">所有公務車輛</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900">
                    {v.plateNumber} ({v.model})
                  </option>
                ))}
              </select>
            </div>

            {/* 檢視模式切換（月曆 / 清單） */}
            <div className="flex items-center bg-slate-950/80 border border-white/[0.1] p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setViewMode("month")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  viewMode === "month"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border border-white/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="月曆檢視"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">月曆檢視</span>
              </button>
              <button
                onClick={() => setViewMode("agenda")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  viewMode === "agenda"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border border-white/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="日程清單檢視"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">日程清單</span>
              </button>
            </div>

            {/* 新增預約按鈕 */}
            <button
              onClick={() => {
                setEditingBooking(null);
                setTargetDateForNewBooking(new Date().toISOString().split("T")[0]);
                setIsBookingModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-500/25 border border-white/20 transition duration-150 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>預約用車</span>
            </button>
          </div>
        </div>

        {/* 時段圖例說明 */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
          <span className="font-bold text-slate-300">時段圖例：</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
            <span>上午 (08:00 - 12:00)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
            <span>下午 (13:00 - 17:30)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <span>全天 (08:00 - 18:00)</span>
          </div>
        </div>
      </div>

      {/* 主檢視區 */}
      {viewMode === "month" ? (
        /* 桌機與平板月曆網格 */
        <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden ring-1 ring-white/5">
          {/* 星期標題 */}
          <div className="grid grid-cols-7 border-b border-white/[0.08] bg-slate-950/80 text-center text-xs font-black text-slate-400 py-3.5 tracking-wider uppercase">
            <span className="text-rose-400">週日</span>
            <span>週一</span>
            <span>週二</span>
            <span>週三</span>
            <span>週四</span>
            <span>週五</span>
            <span className="text-cyan-400">週六</span>
          </div>

          {/* 月曆日期格子 */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-white/[0.06] bg-slate-900/40">
            {daysArray.map((dayNum, idx) => {
              if (dayNum === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[110px] sm:min-h-[140px] bg-slate-950/40 p-1.5"
                  />
                );
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isToday = dateStr === todayStr;

              // 篩選當日預約
              const dayBookings = bookings.filter(
                (b) => b.startDate.split("T")[0] === dateStr
              );

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest(".booking-badge")) return;
                    handleOpenNewForDate(dateStr);
                  }}
                  className={`min-h-[110px] sm:min-h-[140px] p-2 sm:p-2.5 transition-all duration-150 group hover:bg-white/[0.03] cursor-pointer flex flex-col justify-between relative ${
                    isToday ? "bg-blue-500/[0.08] ring-1 ring-inset ring-blue-500/30" : ""
                  }`}
                >
                  <div>
                    {/* 日期數字與今日標記 */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                          isToday
                            ? "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/40 border border-white/20"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase hidden sm:inline px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* 當日預約標籤列表 */}
                    <div className="space-y-1.5 overflow-y-auto max-h-[85px] sm:max-h-[100px] pr-0.5">
                      {dayBookings.map((b) => (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBookingForDetail(b);
                          }}
                          className={`booking-badge px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border shadow-sm truncate ${getSlotColor(
                            b.timeSlot
                          )}`}
                          title={`${b.reason} (${b.user.name}) - ${b.vehicle.plateNumber}`}
                        >
                          <div className="font-bold truncate tracking-wide">
                            {b.vehicle.plateNumber} · {b.user.name}
                          </div>
                          <div className="text-[10px] opacity-90 truncate font-normal">
                            {b.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 空格新增預約提示 */}
                  {dayBookings.length === 0 && (
                    <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition text-center py-1">
                      + 預約用車
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 手機端與清單日程檢視（Agenda View） */
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-12 text-center text-slate-400 shadow-xl">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-bold text-slate-200">本月份尚無預約紀錄</p>
              <p className="text-xs text-slate-400 mt-1">點擊上方「預約用車」建立第一筆借用行程</p>
            </div>
          ) : (
            bookings.map((b) => {
              const datePart = b.startDate.split("T")[0];
              const slotLabel =
                b.timeSlot === "MORNING"
                  ? "上午 (08:00 - 12:00)"
                  : b.timeSlot === "AFTERNOON"
                  ? "下午 (13:00 - 17:30)"
                  : "全天 (08:00 - 18:00)";

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBookingForDetail(b)}
                  className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-150 cursor-pointer active:scale-[0.99] group ring-1 ring-white/5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${getSlotColor(b.timeSlot)}`}>
                        {b.timeSlot === "MORNING" ? "上午" : b.timeSlot === "AFTERNOON" ? "下午" : "全天"}
                      </span>
                      <span className="text-sm font-black text-slate-100">{datePart}</span>
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">{slotLabel}</span>
                    </div>

                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-white/[0.1] text-slate-200 shadow-inner">
                      {b.vehicle.plateNumber}
                    </span>
                  </div>

                  {/* 借用事由 */}
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition mb-2 tracking-wide">
                    {b.reason}
                  </h4>

                  {/* 案件與借用人資訊 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Folder className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{b.project ? b.project.name : "一般洽公"}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Car className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{b.vehicle.model}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        借用人：{b.user.name}
                        {b.companions.length > 0 ? ` + ${b.companions.length} 位同行` : ""}
                      </span>
                    </div>
                  </div>

                  {/* 同行人員 Chips */}
                  {b.companions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                      <span className="text-xs text-slate-400 py-0.5 font-medium">同行人員：</span>
                      {b.companions.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[11px] font-medium"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 新增 / 編輯預約 Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingBooking(null);
        }}
        onSuccess={() => {
          showToast(editingBooking ? "預約修改成功" : "用車預約建立成功");
          loadBookings();
        }}
        initialDate={targetDateForNewBooking}
        editBooking={editingBooking}
      />

      {/* 預約詳情 Modal */}
      <BookingDetailModal
        booking={selectedBookingForDetail}
        currentUser={currentUser}
        isOpen={Boolean(selectedBookingForDetail)}
        onClose={() => setSelectedBookingForDetail(null)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteBooking}
      />
    </div>
  );
}
