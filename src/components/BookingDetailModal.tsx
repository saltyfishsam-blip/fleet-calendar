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
        return { text: "上午 (08:00 - 12:00)", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
      case "AFTERNOON":
        return { text: "下午 (13:00 - 17:30)", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "ALL_DAY":
      default:
        return { text: "全天 (08:00 - 18:00)", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    }
  };

  const slotInfo = getTimeSlotLabel(booking.timeSlot);
  const dateFormatted = booking.startDate.split("T")[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${slotInfo.badge}`}>
              {booking.timeSlot === "MORNING" ? "上午" : booking.timeSlot === "AFTERNOON" ? "下午" : "全天"}
            </span>
            <h3 className="text-lg font-bold text-white">用車借用詳情</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
          {/* 借用事由 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>借用事由 / 目的地</span>
            </div>
            <p className="text-base font-semibold text-white mt-1">{booking.reason}</p>
          </div>

          {/* 車輛與專案資訊 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
                <Car className="w-4 h-4 text-blue-400" />
                <span>借用車輛</span>
              </div>
              <p className="font-bold text-slate-200">{booking.vehicle.plateNumber}</p>
              <p className="text-xs text-slate-400">{booking.vehicle.model}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>計畫案件</span>
              </div>
              <p className="font-bold text-slate-200">
                {booking.project ? booking.project.name : "一般公務洽公"}
              </p>
              {booking.project?.code && (
                <p className="text-xs text-slate-400">{booking.project.code}</p>
              )}
            </div>
          </div>

          {/* 預約日期與借用人 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>預約日期與時段</span>
              </div>
              <p className="font-bold text-slate-200">{dateFormatted}</p>
              <p className="text-xs text-slate-400">{slotInfo.text}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
                <User className="w-4 h-4 text-blue-400" />
                <span>借用人</span>
              </div>
              <p className="font-bold text-slate-200">{booking.user.name}</p>
              <p className="text-xs text-slate-400">
                {booking.user.department || "未指定部門"}
                {booking.user.phone ? ` • ${booking.user.phone}` : ""}
              </p>
            </div>
          </div>

          {/* 同行人員名單 */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>同行人員名冊</span>
            </div>
            {booking.companions && booking.companions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {booking.companions.map((c: any) => (
                  <span
                    key={c.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
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
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                <Gauge className="w-4 h-4 text-blue-400" />
                <span>里程結算狀態</span>
              </div>
              {booking.mileageLog?.distance !== null && booking.mileageLog?.distance !== undefined ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  已結算
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  尚未完成結算
                </span>
              )}
            </div>

            {booking.mileageLog ? (
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">出發里程：</span>
                  <span className="font-mono font-medium">{booking.mileageLog.startMileage} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">歸還里程：</span>
                  <span className="font-mono font-medium">
                    {booking.mileageLog.endMileage !== null ? `${booking.mileageLog.endMileage} km` : "尚未登記"}
                  </span>
                </div>
                {booking.mileageLog.distance !== null && (
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 font-semibold text-emerald-400">
                    <span>本次行駛里程：</span>
                    <span className="font-mono font-bold">{booking.mileageLog.distance} km</span>
                  </div>
                )}
                {booking.mileageLog.note && (
                  <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-slate-400">
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
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 transition border border-slate-700"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>編輯預約</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(booking.id)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 transition border border-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>刪除預約</span>
                </button>
              </>
            )}
            <Link
              href="/mileage"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-600/30 transition text-center"
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
