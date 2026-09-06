"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Car,
  Users,
  Folder,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  ListFilter,
} from "lucide-react";
import BookingModal from "@/components/BookingModal";
import BookingDetailModal from "@/components/BookingDetailModal";
import WeatherWidget from "@/components/WeatherWidget";

interface BookingItem {
  id: number;
  reason: string;
  startDate: string;
  endDate: string;
  timeSlot: string;
  status: string;
  vehicleId: number;
  vehicle: { id: number; plateNumber: string; model: string };
  projectId: number | null;
  project: { id: number; name: string; code: string | null } | null;
  userId: number;
  user: { id: number; name: string; username: string; department: string | null; phone: string | null };
  companions: { id: number; name: string; department: string | null }[];
  mileageLog: any | null;
}

interface Vehicle {
  id: number;
  plateNumber: string;
  model: string;
  isActive: boolean;
}

export default function CalendarPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<BookingItem | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);
  const [targetDateForNewBooking, setTargetDateForNewBooking] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 取得目前使用者與車輛
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) setCurrentUser(d.user);
      });

    fetch("/api/admin/vehicles")
      .then((r) => r.json())
      .then((d) => {
        setVehicles(d.vehicles || []);
      });
  }, []);

  const loadBookings = useCallback(() => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    let url = `/api/bookings?year=${year}&month=${month}`;
    if (selectedVehicleId !== "all") {
      url += `&vehicleId=${selectedVehicleId}`;
    }

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentDate, selectedVehicleId]);

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
        return "bg-blue-600/90 text-white border-blue-400/30 hover:bg-blue-500";
      case "AFTERNOON":
        return "bg-amber-600/90 text-white border-amber-400/30 hover:bg-amber-500";
      case "ALL_DAY":
      default:
        return "bg-emerald-600/90 text-white border-emerald-400/30 hover:bg-emerald-500";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Toast 提示訊息 */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 border text-sm font-medium ${
              toastMsg.type === "success"
                ? "bg-slate-900 border-emerald-500/50 text-emerald-400"
                : "bg-slate-900 border-red-500/50 text-red-400"
            }`}
          >
            {toastMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* 自訂區域即時與未來天氣小工具 */}
      <WeatherWidget />

      {/* 頂部控制工具列 */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* 年月導覽與快速按鈕 */}
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="上個月"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                今日
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="下個月"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-500 hidden sm:inline" />
              <span>{year} 年 {month + 1} 月</span>
            </h2>
          </div>

          {/* 車輛篩選與檢視模式切換 */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 車輛篩選下拉選單 */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex-1 sm:flex-initial">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">所有公務車輛</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} ({v.model})
                  </option>
                ))}
              </select>
            </div>

            {/* 檢視模式切換（月曆 / 清單） */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("month")}
                className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                  viewMode === "month"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="月曆檢視"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">月曆檢視</span>
              </button>
              <button
                onClick={() => setViewMode("agenda")}
                className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                  viewMode === "agenda"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="日程清單檢視"
              >
                <ListFilter className="w-4 h-4" />
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
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>預約用車</span>
            </button>
          </div>
        </div>

        {/* 時段圖例說明 */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">時段圖例：</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>上午 (08:00 - 12:00)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>下午 (13:00 - 17:30)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>全天 (08:00 - 18:00)</span>
          </div>
        </div>
      </div>

      {/* 主檢視區 */}
      {viewMode === "month" ? (
        /* 桌機與平板月曆網格 */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* 星期標題 */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950 text-center text-xs font-bold text-slate-400 py-3">
            <span className="text-red-400">週日</span>
            <span>週一</span>
            <span>週二</span>
            <span>週三</span>
            <span>週四</span>
            <span>週五</span>
            <span className="text-blue-400">週六</span>
          </div>

          {/* 月曆日期格子 */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/80 bg-slate-900">
            {daysArray.map((dayNum, idx) => {
              if (dayNum === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[110px] sm:min-h-[135px] bg-slate-950/30 p-1.5"
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
                  className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 transition group hover:bg-slate-800/50 cursor-pointer flex flex-col justify-between ${
                    isToday ? "bg-blue-950/20" : ""
                  }`}
                >
                  <div>
                    {/* 日期數字與今日標記 */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isToday
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/40"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-semibold text-blue-400 hidden sm:inline">
                          今日
                        </span>
                      )}
                    </div>

                    {/* 當日預約標籤列表 */}
                    <div className="space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[95px] pr-0.5">
                      {dayBookings.map((b) => (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBookingForDetail(b);
                          }}
                          className={`booking-badge px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer border shadow-sm truncate ${getSlotColor(
                            b.timeSlot
                          )}`}
                          title={`${b.reason} (${b.user.name}) - ${b.vehicle.plateNumber}`}
                        >
                          <div className="font-semibold truncate">
                            {b.vehicle.plateNumber} · {b.user.name}
                          </div>
                          <div className="text-[10px] opacity-90 truncate">
                            {b.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 空格新增預約提示 */}
                  {dayBookings.length === 0 && (
                    <div className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition text-center py-1">
                      + 點擊預約
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-semibold text-slate-300">本月份尚無預約紀錄</p>
              <p className="text-xs text-slate-500 mt-1">點擊上方「預約用車」建立第一筆借用行程</p>
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
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg transition cursor-pointer active:scale-[0.99] group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getSlotColor(b.timeSlot)}`}>
                        {b.timeSlot === "MORNING" ? "上午" : b.timeSlot === "AFTERNOON" ? "下午" : "全天"}
                      </span>
                      <span className="text-sm font-bold text-slate-200">{datePart}</span>
                      <span className="text-xs text-slate-400 hidden sm:inline">{slotLabel}</span>
                    </div>

                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                      {b.vehicle.plateNumber}
                    </span>
                  </div>

                  {/* 借用事由 */}
                  <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition mb-2">
                    {b.reason}
                  </h4>

                  {/* 案件與借用人資訊 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Folder className="w-3.5 h-3.5 text-blue-400" />
                      <span>{b.project ? b.project.name : "一般洽公"}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Car className="w-3.5 h-3.5 text-blue-400" />
                      <span>{b.vehicle.model}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        借用人：{b.user.name}
                        {b.companions.length > 0 ? ` + ${b.companions.length} 位同行` : ""}
                      </span>
                    </div>
                  </div>

                  {/* 同行人員 Chips */}
                  {b.companions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      <span className="text-xs text-slate-500 py-0.5">同行：</span>
                      {b.companions.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px]"
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
