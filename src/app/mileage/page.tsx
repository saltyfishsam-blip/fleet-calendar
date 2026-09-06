"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gauge,
  Calendar,
  Car,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Plus,
  ArrowRight,
  Filter,
} from "lucide-react";

interface MileageRecord {
  id: number;
  reason: string;
  startDate: string;
  endDate: string;
  timeSlot: string;
  status: string;
  vehicle: { id: number; plateNumber: string; model: string };
  project: { id: number; name: string; code: string | null } | null;
  user: { id: number; name: string; username: string; department: string | null };
  companions: { id: number; name: string; department: string | null }[];
  mileageLog: {
    id: number;
    startMileage: number;
    endMileage: number | null;
    distance: number | null;
    note: string | null;
    loggedAt: string;
  } | null;
}

export default function MileagePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [records, setRecords] = useState<MileageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"my" | "pending" | "all">("my");

  // Modal 狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<MileageRecord | null>(null);
  const [startMileage, setStartMileage] = useState<string>("");
  const [endMileage, setEndMileage] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) setCurrentUser(d.user);
      });
  }, []);

  const loadRecords = useCallback(() => {
    setLoading(true);
    fetch(`/api/mileage?mode=${filterMode}`)
      .then((r) => r.json())
      .then((data) => {
        setRecords(data.records || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterMode]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenMileageModal = async (booking: MileageRecord) => {
    setSelectedBooking(booking);
    setErrorMsg("");

    if (booking.mileageLog) {
      setStartMileage(String(booking.mileageLog.startMileage));
      setEndMileage(booking.mileageLog.endMileage !== null ? String(booking.mileageLog.endMileage) : "");
      setNote(booking.mileageLog.note || "");
    } else {
      // 自動抓取該車輛前次結束里程
      try {
        const res = await fetch(`/api/vehicles/${booking.vehicle.id}/last-mileage`);
        const data = await res.json();
        setStartMileage(data.lastMileage ? String(data.lastMileage) : "0");
      } catch {
        setStartMileage("0");
      }
      setEndMileage("");
      setNote("");
    }

    setIsModalOpen(true);
  };

  const calculatedDistance = () => {
    const start = parseInt(startMileage, 10);
    const end = parseInt(endMileage, 10);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      return end - start;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setErrorMsg("");

    const start = parseInt(startMileage, 10);
    const end = endMileage.trim() !== "" ? parseInt(endMileage, 10) : null;

    if (isNaN(start) || start < 0) {
      setErrorMsg("請輸入有效的出發里程");
      return;
    }

    if (end !== null) {
      if (isNaN(end) || end < 0) {
        setErrorMsg("請輸入有效的結束里程");
        return;
      }
      if (end < start) {
        setErrorMsg("防呆警示：結束里程不得小於出發里程");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/mileage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          startMileage: start,
          endMileage: end,
          note: note.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "回報里程失敗");
        setSubmitting(false);
        return;
      }

      showToast("里程紀錄已成功儲存！");
      setIsModalOpen(false);
      setSubmitting(false);
      loadRecords();
    } catch {
      setErrorMsg("連線伺服器異常，請稍後再試");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Toast 提示 */}
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

      {/* 標題與篩選列 */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Gauge className="w-5 h-5" />
              </div>
              <span>出車里程回報與結算</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              用車完畢後請及時登記出發與歸還里程數，維持車輛里程閉環資料正確性
            </p>
          </div>

          {/* 模式切換按鈕 */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode("my")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === "my"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              我的預約
            </button>
            <button
              onClick={() => setFilterMode("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === "pending"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              待結算里程
            </button>
            {currentUser?.role === "ADMIN" && (
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterMode === "all"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                全域紀錄 (管理員)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 里程紀錄清單 */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">資料載入中...</div>
      ) : records.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Gauge className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-semibold text-slate-300">目前無符合條件之里程紀錄</p>
          <p className="text-xs text-slate-500 mt-1">請先至約車行事曆建立用車預約</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((r) => {
            const dateStr = r.startDate.split("T")[0];
            const hasSettled = r.mileageLog?.endMileage !== null && r.mileageLog?.endMileage !== undefined;

            return (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition"
              >
                <div>
                  {/* 車牌與日期 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                      {r.vehicle.plateNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{dateStr}</span>
                  </div>

                  {/* 事由與借用人 */}
                  <h3 className="text-base font-bold text-white mb-2">{r.reason}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>借用人：{r.user.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Car className="w-3.5 h-3.5 text-blue-400" />
                      <span>{r.vehicle.model}</span>
                    </div>
                  </div>

                  {/* 里程數值看板 */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">出發里程</span>
                        <span className="font-mono font-bold text-slate-200 text-sm">
                          {r.mileageLog ? `${r.mileageLog.startMileage} km` : "尚未填寫"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">歸還里程</span>
                        <span className="font-mono font-bold text-slate-200 text-sm">
                          {r.mileageLog?.endMileage !== null && r.mileageLog?.endMileage !== undefined
                            ? `${r.mileageLog.endMileage} km`
                            : "尚未歸還"}
                        </span>
                      </div>
                    </div>

                    {r.mileageLog?.distance !== null && r.mileageLog?.distance !== undefined && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400">行駛總里程：</span>
                        <span className="font-mono font-bold text-emerald-400 text-base">
                          {r.mileageLog.distance} km
                        </span>
                      </div>
                    )}

                    {r.mileageLog?.note && (
                      <p className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-1.5">
                        備註：{r.mileageLog.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* 操作按鈕 */}
                <button
                  onClick={() => handleOpenMileageModal(r)}
                  className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition ${
                    hasSettled
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                  }`}
                >
                  <Gauge className="w-4 h-4" />
                  <span>{hasSettled ? "修改里程紀錄" : "填寫出發 / 歸還里程"}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 里程回報彈窗 Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal 標題 */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Gauge className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">里程登記與結算</h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 車輛資訊簡述 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">借用車輛：</span>
                  <span className="font-bold text-white">
                    {selectedBooking.vehicle.plateNumber} ({selectedBooking.vehicle.model})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">行程事由：</span>
                  <span className="text-slate-200">{selectedBooking.reason}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 出發里程 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  出發里程數 (km)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={startMileage}
                  onChange={(e) => setStartMileage(e.target.value)}
                  placeholder="例：12500"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  系統已自動帶入該車輛前次結算里程，如儀表板數值不符請手動修正
                </span>
              </div>

              {/* 歸還里程 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  歸還里程數 (km) <span className="text-slate-500 font-normal">（出發前可暫留空）</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={endMileage}
                  onChange={(e) => setEndMileage(e.target.value)}
                  placeholder="例：12580"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 即時計算預覽 */}
              {calculatedDistance() !== null && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400 text-xs font-semibold">
                  <span>本次行駛預計里程：</span>
                  <span className="font-mono text-base font-bold">{calculatedDistance()} km</span>
                </div>
              )}

              {/* 備註 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  使用備註 (選填)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例：返程已加滿 95 無鉛汽油、車況良好"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* 按鈕 */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs sm:text-sm font-medium transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {submitting ? "儲存中..." : "確認儲存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
