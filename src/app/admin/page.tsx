"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Car,
  Users,
  Folder,
  Calendar,
  Gauge,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  UserCheck,
  Search,
  Sparkles,
  Layers,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "vehicles" | "resources" | "users" | "bookings">("overview");

  // Dashboard Stats
  const [statsData, setStatsData] = useState<any>(null);

  // Entities Data
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal 狀態
  const [modalType, setModalType] = useState<"vehicle" | "person" | "project" | "user" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // 表單狀態
  const [vPlate, setVPlate] = useState("");
  const [vModel, setVModel] = useState("");
  const [vCapacity, setVCapacity] = useState("5");
  const [vActive, setVActive] = useState(true);

  const [psName, setPsName] = useState("");
  const [psDept, setPsDept] = useState("");

  const [pjName, setPjName] = useState("");
  const [pjCode, setPjCode] = useState("");

  const [uUsername, setUUsername] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uName, setUName] = useState("");
  const [uRole, setURole] = useState<"USER" | "ADMIN">("USER");
  const [uDept, setUDept] = useState("");
  const [uPhone, setUPhone] = useState("");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, vRes, psRes, pjRes, uRes, bRes] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()),
        fetch("/api/admin/vehicles").then((r) => r.json()),
        fetch("/api/admin/personnel").then((r) => r.json()),
        fetch("/api/admin/projects").then((r) => r.json()),
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
      ]);

      setStatsData(sRes);
      setVehicles(vRes.vehicles || []);
      setPersonnel(psRes.personnel || []);
      setProjects(pjRes.projects || []);
      setUsers(uRes.users || []);
      setAllBookings(bRes.bookings || []);
    } catch {
      showToast("載入後台資訊失敗", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 車輛 新增/編輯
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        plateNumber: vPlate.trim().toUpperCase(),
        model: vModel.trim(),
        capacity: parseInt(vCapacity, 10),
        isActive: vActive,
      };

      const url = editingItem ? `/api/admin/vehicles/${editingItem.id}` : "/api/admin/vehicles";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "儲存失敗", "error");
        return;
      }

      showToast("車輛資料已更新");
      setModalType(null);
      loadAllData();
    } catch {
      showToast("儲存失敗，請稍後再試", "error");
    }
  };

  // 同行人員 新增/編輯
  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: psName.trim(),
        department: psDept.trim() || null,
        isActive: true,
      };

      const url = editingItem ? `/api/admin/personnel/${editingItem.id}` : "/api/admin/personnel";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "儲存失敗", "error");
        return;
      }

      showToast("人員資料已更新");
      setModalType(null);
      loadAllData();
    } catch {
      showToast("儲存失敗，請稍後再試", "error");
    }
  };

  // 專案 新增/編輯
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: pjName.trim(),
        code: pjCode.trim() || null,
        isActive: true,
      };

      const url = editingItem ? `/api/admin/projects/${editingItem.id}` : "/api/admin/projects";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "儲存失敗", "error");
        return;
      }

      showToast("專案資料已更新");
      setModalType(null);
      loadAllData();
    } catch {
      showToast("儲存失敗，請稍後再試", "error");
    }
  };

  // 使用者帳號 新增/編輯
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: uName.trim(),
        role: uRole,
        department: uDept.trim() || null,
        phone: uPhone.trim() || null,
      };

      if (!editingItem) {
        payload.username = uUsername.trim();
        payload.password = uPassword.trim();
      } else if (uPassword.trim() !== "") {
        payload.password = uPassword.trim();
      }

      const url = editingItem ? `/api/admin/users/${editingItem.id}` : "/api/admin/users";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "儲存失敗", "error");
        return;
      }

      showToast("使用者帳號資料已更新");
      setModalType(null);
      loadAllData();
    } catch {
      showToast("儲存失敗，請稍後再試", "error");
    }
  };

  // 通用刪除
  const handleDelete = async (endpoint: string, id: number, name: string) => {
    if (!confirm(`確定要刪除「${name}」嗎？此操作不可逆！`)) return;

    try {
      const res = await fetch(`/api/admin/${endpoint}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "刪除失敗", "error");
        return;
      }
      showToast("資料已成功刪除");
      loadAllData();
    } catch {
      showToast("刪除失敗，請稍後再試", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Toast 訊息 */}
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

      {/* 頂部標題與分頁導覽 */}
      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-6 shadow-2xl shadow-black/40 ring-1 ring-white/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 border border-white/20">
                <Shield className="w-5 h-5 text-amber-300" />
              </div>
              <span>後台管理控管中心</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              全方位管理公務車名冊、同仁帳號權限、專案代碼與全域預約稽核
            </p>
          </div>

          {/* 分頁 Tab 切換 */}
          <div className="flex flex-wrap items-center bg-slate-950/80 border border-white/[0.1] p-1 rounded-xl shadow-inner gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border border-white/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              總覽儀表板
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "vehicles"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border border-white/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              車輛管理
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "resources"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border border-white/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              人員與專案
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "users"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border border-white/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              帳號權限
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border border-white/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              全域預約稽核
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 font-medium">載入資料中...</div>
      ) : (
        <>
          {/* 1. 總覽儀表板 */}
          {activeTab === "overview" && statsData?.stats && (
            <div className="space-y-6">
              {/* 關鍵指標卡片 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl ring-1 ring-white/5">
                  <div className="flex items-center justify-between text-slate-400 mb-2 font-semibold">
                    <span className="text-xs">公務車輛總數</span>
                    <Car className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {statsData.stats.totalVehicles}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      ({statsData.stats.activeVehicles} 輛服役中)
                    </span>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl ring-1 ring-white/5">
                  <div className="flex items-center justify-between text-slate-400 mb-2 font-semibold">
                    <span className="text-xs">今日出車預約</span>
                    <Calendar className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {statsData.stats.todayBookings}
                    </span>
                    <span className="text-xs font-bold text-slate-400">筆排程</span>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl ring-1 ring-white/5">
                  <div className="flex items-center justify-between text-slate-400 mb-2 font-semibold">
                    <span className="text-xs">待結算里程</span>
                    <Gauge className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      {statsData.stats.pendingMileageCount}
                    </span>
                    <span className="text-xs font-bold text-slate-400">筆待填寫</span>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl ring-1 ring-white/5">
                  <div className="flex items-center justify-between text-slate-400 mb-2 font-semibold">
                    <span className="text-xs">系統註冊用戶</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {statsData.stats.totalUsers}
                    </span>
                    <span className="text-xs font-bold text-slate-400">位使用者</span>
                  </div>
                </div>
              </div>

              {/* 近期預約與里程即時動態 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 最新預約 */}
                <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 shadow-xl ring-1 ring-white/5">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4 tracking-wide">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>最新用車預約動態</span>
                  </h3>
                  <div className="space-y-3">
                    {statsData.recentBookings?.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.06] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">
                            {b.reason} ({b.user.name})
                          </div>
                          <div className="text-slate-400 mt-0.5 font-medium">
                            {b.startDate.split("T")[0]} · {b.vehicle.plateNumber}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono font-bold">
                          {b.timeSlot === "MORNING" ? "上午" : b.timeSlot === "AFTERNOON" ? "下午" : "全天"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 最新里程回報 */}
                <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 shadow-xl ring-1 ring-white/5">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4 tracking-wide">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>最新里程結算紀錄</span>
                  </h3>
                  <div className="space-y-3">
                    {statsData.recentMileageLogs?.map((m: any) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.06] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">
                            {m.vehicle.plateNumber} · {m.user.name}
                          </div>
                          <div className="text-slate-400 mt-0.5 font-mono">
                            {m.startMileage} km → {m.endMileage ?? "?"} km
                          </div>
                        </div>
                        {m.distance !== null && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-black font-mono border border-emerald-500/30">
                            +{m.distance} km
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. 車輛管理 */}
          {activeTab === "vehicles" && (
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 shadow-xl ring-1 ring-white/5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">公務車輛維護名冊</h2>
                  <p className="text-xs text-slate-400 font-medium">新增、編輯車牌號碼或切換啟用與保養停用狀態</p>
                </div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setVPlate("");
                    setVModel("");
                    setVCapacity("5");
                    setVActive(true);
                    setModalType("vehicle");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-blue-600/25 border border-white/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增車輛</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-white/[0.08]">
                    <tr>
                      <th className="p-3.5">車牌號碼</th>
                      <th className="p-3.5">車輛廠牌型號</th>
                      <th className="p-3.5">乘載人數</th>
                      <th className="p-3.5">目前狀態</th>
                      <th className="p-3.5 text-right">管理操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-white/[0.03] transition">
                        <td className="p-3.5 font-mono font-bold text-white">{v.plateNumber}</td>
                        <td className="p-3.5 font-medium">{v.model}</td>
                        <td className="p-3.5 font-medium">{v.capacity} 人座</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              v.isActive
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {v.isActive ? "服役中 (可借用)" : "停用 / 保養中"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem(v);
                              setVPlate(v.plateNumber);
                              setVModel(v.model);
                              setVCapacity(String(v.capacity));
                              setVActive(v.isActive);
                              setModalType("vehicle");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                            title="編輯"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("vehicles", v.id, v.plateNumber)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. 人員與專案資源 */}
          {activeTab === "resources" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 人員名冊管理 */}
              <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 shadow-xl ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide">同行人員名冊</h2>
                    <p className="text-xs text-slate-400 font-medium">維護常用同行人員清單庫</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setPsName("");
                      setPsDept("");
                      setModalType("person");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1 shadow-md shadow-blue-600/20 border border-white/20 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增人員</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {personnel.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        {p.department && (
                          <span className="text-slate-400 ml-2 font-medium">({p.department})</span>
                        )}
                      </div>
                      <div className="space-x-1">
                        <button
                          onClick={() => {
                            setEditingItem(p);
                            setPsName(p.name);
                            setPsDept(p.department || "");
                            setModalType("person");
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete("personnel", p.id, p.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 專案代號管理 */}
              <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 shadow-xl ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide">計畫專案代碼</h2>
                    <p className="text-xs text-slate-400 font-medium">維護專案代號與預約歸屬案件</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setPjName("");
                      setPjCode("");
                      setModalType("project");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1 shadow-md shadow-blue-600/20 border border-white/20 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增專案</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {projects.map((pj) => (
                    <div
                      key={pj.id}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-bold text-white text-sm">{pj.name}</span>
                        {pj.code && (
                          <span className="text-cyan-400 ml-2 font-mono font-bold">[{pj.code}]</span>
                        )}
                      </div>
                      <div className="space-x-1">
                        <button
                          onClick={() => {
                            setEditingItem(pj);
                            setPjName(pj.name);
                            setPjCode(pj.code || "");
                            setModalType("project");
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete("projects", pj.id, pj.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. 使用者帳號管理 */}
          {activeTab === "users" && (
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 shadow-xl ring-1 ring-white/5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">使用者與管理員權限</h2>
                  <p className="text-xs text-slate-400 font-medium">建立系統使用者、修改密碼或升降管理員權限</p>
                </div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setUUsername("");
                    setUPassword("");
                    setUName("");
                    setURole("USER");
                    setUDept("");
                    setUPhone("");
                    setModalType("user");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-600/25 border border-white/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增使用者</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-white/[0.08]">
                    <tr>
                      <th className="p-3.5">帳號</th>
                      <th className="p-3.5">姓名</th>
                      <th className="p-3.5">權限角色</th>
                      <th className="p-3.5">所屬部門</th>
                      <th className="p-3.5">聯絡電話</th>
                      <th className="p-3.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.03] transition">
                        <td className="p-3.5 font-mono font-bold text-white">{u.username}</td>
                        <td className="p-3.5 font-bold text-slate-200">{u.name}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              u.role === "ADMIN"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {u.role === "ADMIN" ? "系統管理員" : "一般同仁"}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium">{u.department || "-"}</td>
                        <td className="p-3.5 font-medium">{u.phone || "-"}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem(u);
                              setUUsername(u.username);
                              setUPassword("");
                              setUName(u.name);
                              setURole(u.role);
                              setUDept(u.department || "");
                              setUPhone(u.phone || "");
                              setModalType("user");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                            title="編輯"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("users", u.id, u.username)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. 全域預約稽核 */}
          {activeTab === "bookings" && (
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 shadow-xl ring-1 ring-white/5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">全域用車預約稽核</h2>
                  <p className="text-xs text-slate-400 font-medium">檢視系統所有使用者之預約排程與里程執行狀態</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-white/[0.08]">
                    <tr>
                      <th className="p-3.5">預約日期</th>
                      <th className="p-3.5">車牌與車型</th>
                      <th className="p-3.5">借用人</th>
                      <th className="p-3.5">事由與專案</th>
                      <th className="p-3.5">時段</th>
                      <th className="p-3.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {allBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.03] transition">
                        <td className="p-3.5 font-bold text-white">{b.startDate.split("T")[0]}</td>
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-slate-200">{b.vehicle.plateNumber}</span>
                          <span className="text-slate-400 block">{b.vehicle.model}</span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-200">{b.user.name}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-white">{b.reason}</span>
                          {b.project && (
                            <span className="text-cyan-400 block text-[11px] font-mono">
                              {b.project.name}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono font-bold">
                            {b.timeSlot === "MORNING" ? "上午" : b.timeSlot === "AFTERNOON" ? "下午" : "全天"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDelete("bookings", b.id, `預約 #${b.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="刪除預約"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* 彈窗：車輛新增/編輯 */}
      {modalType === "vehicle" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-white/[0.12] w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-black/80 ring-1 ring-white/10">
            <h3 className="text-base font-bold text-white mb-4 tracking-wide">
              {editingItem ? "編輯車輛資訊" : "新增公務車輛"}
            </h3>
            <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">車牌號碼</label>
                <input
                  type="text"
                  required
                  value={vPlate}
                  onChange={(e) => setVPlate(e.target.value)}
                  placeholder="例：ABC-1234"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">車輛型號規格</label>
                <input
                  type="text"
                  required
                  value={vModel}
                  onChange={(e) => setVModel(e.target.value)}
                  placeholder="例：Toyota Corolla Cross"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">乘載人數</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={vCapacity}
                  onChange={(e) => setVCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="vActiveCheck"
                  checked={vActive}
                  onChange={(e) => setVActive(e.target.checked)}
                  className="rounded bg-slate-950 border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="vActiveCheck" className="text-slate-300 font-bold cursor-pointer">
                  啟用此車輛（允許同仁借用）
                </label>
              </div>
              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-white/[0.1] text-slate-300 hover:bg-white/[0.08] font-bold transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/25 border border-white/20 transition cursor-pointer"
                >
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 彈窗：人員新增/編輯 */}
      {modalType === "person" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-white/[0.12] w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-black/80 ring-1 ring-white/10">
            <h3 className="text-base font-bold text-white mb-4 tracking-wide">
              {editingItem ? "編輯同行人員" : "新增同行人員"}
            </h3>
            <form onSubmit={handleSavePerson} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">人員姓名</label>
                <input
                  type="text"
                  required
                  value={psName}
                  onChange={(e) => setPsName(e.target.value)}
                  placeholder="例：王小明"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">所屬部門</label>
                <input
                  type="text"
                  value={psDept}
                  onChange={(e) => setPsDept(e.target.value)}
                  placeholder="例：工務組"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-white/[0.1] text-slate-300 hover:bg-white/[0.08] font-bold transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/25 border border-white/20 transition cursor-pointer"
                >
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 彈窗：專案新增/編輯 */}
      {modalType === "project" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-white/[0.12] w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-black/80 ring-1 ring-white/10">
            <h3 className="text-base font-bold text-white mb-4 tracking-wide">
              {editingItem ? "編輯專案代號" : "新增專案代號"}
            </h3>
            <form onSubmit={handleSaveProject} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">專案名稱</label>
                <input
                  type="text"
                  required
                  value={pjName}
                  onChange={(e) => setPjName(e.target.value)}
                  placeholder="例：市區巡檢計畫"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">專案代碼 (選填)</label>
                <input
                  type="text"
                  value={pjCode}
                  onChange={(e) => setPjCode(e.target.value)}
                  placeholder="例：PRJ-2026-001"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-white/[0.1] text-slate-300 hover:bg-white/[0.08] font-bold transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/25 border border-white/20 transition cursor-pointer"
                >
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 彈窗：使用者新增/編輯 */}
      {modalType === "user" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-white/[0.12] w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-black/80 ring-1 ring-white/10">
            <h3 className="text-base font-bold text-white mb-4 tracking-wide">
              {editingItem ? "編輯使用者資訊" : "建立新使用者帳號"}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-medium">
              {!editingItem && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">登入帳號</label>
                  <input
                    type="text"
                    required
                    value={uUsername}
                    onChange={(e) => setUUsername(e.target.value)}
                    placeholder="例：john"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {editingItem ? "重設密碼 (留空則維持原密碼)" : "登入密碼"}
                </label>
                <input
                  type="password"
                  required={!editingItem}
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  placeholder={editingItem ? "若不變更請留空" : "請輸入初始密碼"}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">真實姓名</label>
                <input
                  type="text"
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="例：陳大文"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">權限角色</label>
                <select
                  value={uRole}
                  onChange={(e) => setURole(e.target.value as "USER" | "ADMIN")}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer"
                >
                  <option value="USER" className="bg-slate-900">一般同仁 (USER)</option>
                  <option value="ADMIN" className="bg-slate-900">系統管理員 (ADMIN)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">部門 (選填)</label>
                  <input
                    type="text"
                    value={uDept}
                    onChange={(e) => setUDept(e.target.value)}
                    placeholder="例：業務組"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">電話 (選填)</label>
                  <input
                    type="text"
                    value={uPhone}
                    onChange={(e) => setUPhone(e.target.value)}
                    placeholder="例：0912-345-678"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>
              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-white/[0.1] text-slate-300 hover:bg-white/[0.08] font-bold transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/25 border border-white/20 transition cursor-pointer"
                >
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
