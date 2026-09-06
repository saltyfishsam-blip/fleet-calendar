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
      showToast("載入後台資料失敗", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 車輛儲存
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/admin/vehicles/${editingItem.id}` : "/api/admin/vehicles";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plateNumber: vPlate,
          model: vModel,
          capacity: parseInt(vCapacity, 10),
          isActive: vActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingItem ? "車輛資料已更新" : "車輛新增成功");
      setModalType(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || "操作失敗", "error");
    }
  };

  // 人員儲存
  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/admin/personnel/${editingItem.id}` : "/api/admin/personnel";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: psName, department: psDept }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingItem ? "人員資料已更新" : "人員新增成功");
      setModalType(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || "操作失敗", "error");
    }
  };

  // 專案儲存
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/admin/projects/${editingItem.id}` : "/api/admin/projects";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: pjName, code: pjCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingItem ? "專案資料已更新" : "專案新增成功");
      setModalType(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || "操作失敗", "error");
    }
  };

  // 使用者儲存
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/admin/users/${editingItem.id}` : "/api/admin/users";
      const method = editingItem ? "PUT" : "POST";
      const payload: any = {
        name: uName,
        role: uRole,
        department: uDept,
        phone: uPhone,
      };
      if (!editingItem) {
        payload.username = uUsername;
        payload.password = uPassword;
      } else if (uPassword.trim()) {
        payload.password = uPassword.trim();
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingItem ? "使用者資料已更新" : "使用者新增成功");
      setModalType(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || "操作失敗", "error");
    }
  };

  // 刪除項目通用
  const handleDelete = async (endpoint: string, id: number, label: string) => {
    if (!confirm(`確定要刪除此筆「${label}」嗎？`)) return;
    try {
      const res = await fetch(`/api/admin/${endpoint}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || "刪除成功");
      loadAllData();
    } catch (err: any) {
      showToast(err.message || "刪除失敗", "error");
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

      {/* 標題列 */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span>後台管理中樞</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              集中控管公務車輛資源、人員名冊、專案代號、帳號權限與全域調度歷史
            </p>
          </div>

          {/* 分頁 Tab */}
          <div className="flex flex-wrap items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              總覽儀表板
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "vehicles"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              車輛管理
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "resources"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              人員與專案
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              使用者帳號
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "bookings"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              全域預約稽核
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">載入資料中...</div>
      ) : (
        <>
          {/* 1. 總覽儀表板 */}
          {activeTab === "overview" && statsData?.stats && (
            <div className="space-y-6">
              {/* 關鍵指標卡片 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">公務車輛總數</span>
                    <Car className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                      {statsData.stats.totalVehicles}
                    </span>
                    <span className="text-xs text-emerald-400">
                      ({statsData.stats.activeVehicles} 輛服役中)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">今日出車預約</span>
                    <Calendar className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                      {statsData.stats.todayBookings}
                    </span>
                    <span className="text-xs text-slate-400">筆排程</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">待結算里程</span>
                    <Gauge className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
                      {statsData.stats.pendingMileageCount}
                    </span>
                    <span className="text-xs text-slate-400">筆待填寫</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">系統註冊用戶</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                      {statsData.stats.totalUsers}
                    </span>
                    <span className="text-xs text-slate-400">位使用者</span>
                  </div>
                </div>
              </div>

              {/* 近期預約與里程即時動態 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 最新預約 */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>最新用車預約動態</span>
                  </h3>
                  <div className="space-y-3">
                    {statsData.recentBookings?.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">
                            {b.reason} ({b.user.name})
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            {b.startDate.split("T")[0]} · {b.vehicle.plateNumber}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {b.timeSlot === "MORNING" ? "上午" : b.timeSlot === "AFTERNOON" ? "下午" : "全天"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 最新里程回報 */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>最新里程結算紀錄</span>
                  </h3>
                  <div className="space-y-3">
                    {statsData.recentMileageLogs?.map((m: any) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">
                            {m.vehicle.plateNumber} · {m.user.name}
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            {m.startMileage} km → {m.endMileage ?? "?"} km
                          </div>
                        </div>
                        {m.distance !== null && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono">
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white">公務車輛維護名冊</h2>
                  <p className="text-xs text-slate-400">新增、編輯車牌號碼或切換啟用與保養停用狀態</p>
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
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增車輛</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">車牌號碼</th>
                      <th className="p-3">車輛廠牌型號</th>
                      <th className="p-3">乘載人數</th>
                      <th className="p-3">目前狀態</th>
                      <th className="p-3 text-right">管理操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-white">{v.plateNumber}</td>
                        <td className="p-3">{v.model}</td>
                        <td className="p-3">{v.capacity} 人座</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              v.isActive
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {v.isActive ? "服役中 (可借用)" : "停用 / 保養中"}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem(v);
                              setVPlate(v.plateNumber);
                              setVModel(v.model);
                              setVCapacity(String(v.capacity));
                              setVActive(v.isActive);
                              setModalType("vehicle");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="編輯"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("vehicles", v.id, v.plateNumber)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
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

          {/* 3. 人員與專案管理 */}
          {activeTab === "resources" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 人員名冊維護 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">同行人員庫</h2>
                    <p className="text-xs text-slate-400">供預約時快速勾選同行同仁名單</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setPsName("");
                      setPsDept("");
                      setModalType("person");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md shadow-blue-600/30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增人員</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {personnel.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{p.name}</span>
                        {p.department && (
                          <span className="text-slate-400 ml-2">({p.department})</span>
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
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete("personnel", p.id, p.name)}
                          className="p-1 rounded text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 專案代號庫維護 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">專案案件清單</h2>
                    <p className="text-xs text-slate-400">維護計畫案代號以供預約關聯歸檔</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setPjName("");
                      setPjCode("");
                      setModalType("project");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md shadow-blue-600/30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增專案</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {projects.map((pj) => (
                    <div
                      key={pj.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{pj.name}</span>
                        {pj.code && (
                          <span className="text-slate-400 ml-2 font-mono">[{pj.code}]</span>
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
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete("projects", pj.id, pj.name)}
                          className="p-1 rounded text-slate-400 hover:text-red-400"
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white">使用者與管理員權限</h2>
                  <p className="text-xs text-slate-400">建立系統使用者、修改密碼或升降管理員權限</p>
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
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增使用者</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">帳號</th>
                      <th className="p-3">姓名</th>
                      <th className="p-3">權限角色</th>
                      <th className="p-3">所屬部門</th>
                      <th className="p-3">聯絡電話</th>
                      <th className="p-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-white">{u.username}</td>
                        <td className="p-3 font-semibold text-slate-200">{u.name}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              u.role === "ADMIN"
                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {u.role === "ADMIN" ? "管理員" : "一般同仁"}
                          </span>
                        </td>
                        <td className="p-3">{u.department || "-"}</td>
                        <td className="p-3">{u.phone || "-"}</td>
                        <td className="p-3 text-right space-x-2">
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="編輯"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("users", u.id, u.username)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="mb-5">
                <h2 className="text-base font-bold text-white">全域預約與調度歷史紀錄</h2>
                <p className="text-xs text-slate-400">管理員可直接檢視並管理全體同仁之歷史約車紀錄</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">日期 / 時段</th>
                      <th className="p-3">車輛</th>
                      <th className="p-3">借用人</th>
                      <th className="p-3">行程事由</th>
                      <th className="p-3">同行人員</th>
                      <th className="p-3">里程狀態</th>
                      <th className="p-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {allBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3">
                          <div className="font-bold text-white">{b.startDate.split("T")[0]}</div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {b.timeSlot === "MORNING" ? "上午" : b.timeSlot === "AFTERNOON" ? "下午" : "全天"}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-200">{b.vehicle.plateNumber}</td>
                        <td className="p-3">{b.user.name}</td>
                        <td className="p-3 font-medium text-slate-200">{b.reason}</td>
                        <td className="p-3">
                          {b.companions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {b.companions.map((c: any) => (
                                <span
                                  key={c.id}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300"
                                >
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500">無</span>
                          )}
                        </td>
                        <td className="p-3">
                          {b.mileageLog?.distance !== null && b.mileageLog?.distance !== undefined ? (
                            <span className="text-emerald-400 font-mono font-bold">
                              {b.mileageLog.distance} km
                            </span>
                          ) : (
                            <span className="text-amber-400 text-[11px]">未結算</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDelete("bookings", b.id, `預約 #${b.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            title="強制取消預約"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? "編輯車輛資訊" : "新增公務車輛"}
            </h3>
            <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">車牌號碼</label>
                <input
                  type="text"
                  required
                  value={vPlate}
                  onChange={(e) => setVPlate(e.target.value)}
                  placeholder="例：ABC-1234"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white uppercase focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">車輛型號規格</label>
                <input
                  type="text"
                  required
                  value={vModel}
                  onChange={(e) => setVModel(e.target.value)}
                  placeholder="例：Toyota Corolla Cross"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">乘載人數</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={vCapacity}
                  onChange={(e) => setVCapacity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="vActiveCheck"
                  checked={vActive}
                  onChange={(e) => setVActive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="vActiveCheck" className="text-slate-300 font-semibold cursor-pointer">
                  啟用此車輛（允許借用）
                </label>
              </div>
              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 彈窗：人員新增/編輯 */}
      {modalType === "person" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? "編輯同行人員" : "新增同行人員"}
            </h3>
            <form onSubmit={handleSavePerson} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">人員姓名</label>
                <input
                  type="text"
                  required
                  value={psName}
                  onChange={(e) => setPsName(e.target.value)}
                  placeholder="例：王小明"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">所屬部門</label>
                <input
                  type="text"
                  value={psDept}
                  onChange={(e) => setPsDept(e.target.value)}
                  placeholder="例：工務組"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 彈窗：專案新增/編輯 */}
      {modalType === "project" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? "編輯專案代號" : "新增專案代號"}
            </h3>
            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">專案名稱</label>
                <input
                  type="text"
                  required
                  value={pjName}
                  onChange={(e) => setPjName(e.target.value)}
                  placeholder="例：市區巡檢計畫"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">專案代碼 (選填)</label>
                <input
                  type="text"
                  value={pjCode}
                  onChange={(e) => setPjCode(e.target.value)}
                  placeholder="例：PRJ-2026-001"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 彈窗：使用者新增/編輯 */}
      {modalType === "user" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? "編輯使用者資訊" : "建立新使用者帳號"}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              {!editingItem && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">登入帳號</label>
                  <input
                    type="text"
                    required
                    value={uUsername}
                    onChange={(e) => setUUsername(e.target.value)}
                    placeholder="例：user3"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {editingItem ? "重設密碼 (留空則不修改)" : "登入密碼"}
                </label>
                <input
                  type="password"
                  required={!editingItem}
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  placeholder={editingItem ? "若不變更請留空" : "請輸入密碼"}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">真實姓名</label>
                <input
                  type="text"
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="例：陳大文"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">權限角色</label>
                <select
                  value={uRole}
                  onChange={(e) => setURole(e.target.value as "USER" | "ADMIN")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="USER">一般同仁 (USER)</option>
                  <option value="ADMIN">系統管理員 (ADMIN)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">部門 (選填)</label>
                  <input
                    type="text"
                    value={uDept}
                    onChange={(e) => setUDept(e.target.value)}
                    placeholder="例：業務組"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">電話 (選填)</label>
                  <input
                    type="text"
                    value={uPhone}
                    onChange={(e) => setUPhone(e.target.value)}
                    placeholder="例：0912-345-678"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
