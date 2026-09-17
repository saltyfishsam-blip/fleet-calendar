"use client";

import { X, Calendar, Clock, Car, Folder, Users, User, FileText, Gauge, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";

interface BookingDetailModalProps {
  booking: any | null;
  currentUser: any | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (booking: any) => void;
  onDelete: (id: number) => void;
}

export default function BookingDetailModal({
  booking,
  currentUser,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: BookingDetailModalProps) {
  if (!isOpen || !booking) return null;

  const canManage =
    currentUser &&
    (currentUser.role === "ADMIN" || currentUser.userId === booking.userId);

  const getTimeSlotLabel = (slot: string) => {
    switch (slot) {
      case "MORNING":
        return {
          text: "上午 (08:00 - 12:00)",
          badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        };
      case "AFTERNOON":
        return {
          text: "下午 (13:00 - 17:30)",
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        };
      case "ALL_DAY":
      default:
        return {
          text: "全天 (08:00 - 18:00)",
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        };
    }
  };

  const slotInfo = getTimeSlotLabel(booking.timeSlot);
  const dateFormatted = booking.startDate.split("T")[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 border border-white/[0.12] w-full max-w-lg rounded-3xl shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border shadow-sm ${slotInfo.badge}`}>
              {booking.timeSlot === "MORNING" ? "上午" : booking.timeSlot === "AFTERNOON" ? "下午" : "全天"}
            </span>
            <h3 className="text-base font-bold text-white tracking-wide">用車借用詳情</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs sm:text-sm max-h-[78vh] overflow-y-auto">
          {/* 借用事由 */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.08]">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>借用事由 / 目的地</span>
            </div>
            <p className="text-base font-bold text-white mt-1 tracking-wide">{booking.reason}</p>
          </div>

          {/* 車輛與專案資訊 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06]">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>借用車輛</span>
              </div>
              <p className="font-mono font-bold text-slate-100 text-sm">{booking.vehicle.plateNumber}</p>
              <p className="text-xs text-slate-400 font-medium">{booking.vehicle.model}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06]">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <Folder className="w-4 h-4 text-cyan-400" />
                <span>計畫案件</span>
              </div>
              <p className="font-bold text-slate-100 text-sm">
                {booking.project ? booking.project.name : "一般公務洽公"}
              </p>
              {booking.project?.code && (
                <p className="text-xs text-slate-400 font-mono">{booking.project.code}</p>
              )}
            </div>
          </div>

          {/* 預約日期與借用人 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06]">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>預約日期與時段</span>
              </div>
              <p className="font-bold text-slate-100 text-sm">{dateFormatted}</p>
              <p className="text-xs text-slate-400 font-medium">{slotInfo.text}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06]">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <User className="w-4 h-4 text-cyan-400" />
                <span>借用同仁</span>
              </div>
              <p className="font-bold text-slate-100 text-sm">{booking.user.name}</p>
              <p className="text-xs text-slate-400 font-medium">
                {booking.user.department || "未指定部門"}
                {booking.user.phone ? ` • ${booking.user.phone}` : ""}
              </p>
            </div>
          </div>

          {/* 同行人員名單 */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06]">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>同行人員名冊</span>
            </div>
            {booking.companions && booking.companions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {booking.companions.map((c: any) => (
                  <span
                    key={c.id}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-xs font-medium"
                  >
                    {c.name}
                    {c.department ? ` (${c.department})` : ""}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500">無同行人員（單人出勤）</span>
            )}
          </div>

          {/* 里程回報紀錄狀態 */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>里程結算狀態</span>
              </div>
              {booking.mileageLog?.distance !== null && booking.mileageLog?.distance !== undefined ? (
                <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  已結算
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  尚未結算
                </span>
              )}
            </div>

            {booking.mileageLog ? (
              <div className="space-y-1.5 text-xs text-slate-300 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">出發里程：</span>
                  <span className="font-mono font-bold text-white">{booking.mileageLog.startMileage} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">歸還里程：</span>
                  <span className="font-mono font-bold text-white">
                    {booking.mileageLog.endMileage !== null ? `${booking.mileageLog.endMileage} km` : "尚未登記"}
                  </span>
                </div>
                {booking.mileageLog.distance !== null && (
                  <div className="flex justify-between border-t border-white/[0.06] pt-1.5 font-bold text-emerald-400">
                    <span>本次行駛總里程：</span>
                    <span className="font-mono font-bold">+{booking.mileageLog.distance} km</span>
                  </div>
                )}
                {booking.mileageLog.note && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-white/[0.06] text-slate-300 text-xs">
                    備註：{booking.mileageLog.note}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">此筆預約尚未填寫出發/歸還里程。</p>
            )}
          </div>

          {/* 操作按鈕群 */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(booking)}
                  className="flex-1 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition border border-white/[0.1] cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>編輯預約</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(booking.id)}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold flex items-center justify-center space-x-1.5 transition border border-rose-500/30 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>刪除預約</span>
                </button>
              </>
            )}
            <Link
              href="/mileage"
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-600/25 border border-white/20 transition text-center cursor-pointer"
            >
              <Gauge className="w-4 h-4" />
              <span>前往里程登記</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
