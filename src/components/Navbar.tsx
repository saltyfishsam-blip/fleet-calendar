"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Gauge, Shield, LogOut, User, Car, Sparkles } from "lucide-react";

interface CurrentUser {
  userId: number;
  username: string;
  name: string;
  role: "USER" | "ADMIN";
  department?: string | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/75 border-b border-white/[0.08] shadow-2xl shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 系統標誌與名稱 */}
        <div className="flex items-center space-x-3">
          <Link href="/calendar" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/20 group-hover:scale-105 transition duration-200">
                <Car className="w-5 h-5 drop-shadow" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition">
                  公務車輛預約系統
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Fleet Scheduling & Mileage Operations
              </span>
            </div>
          </Link>
        </div>

        {/* 桌機端主導覽選單（膠囊風格） */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/[0.06] shadow-inner">
          <Link
            href="/calendar"
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center space-x-2 ${
              pathname.startsWith("/calendar")
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border border-white/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>約車行事曆</span>
          </Link>

          <Link
            href="/mileage"
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center space-x-2 ${
              pathname.startsWith("/mileage")
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border border-white/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>里程回報</span>
          </Link>

          {currentUser?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center space-x-2 ${
                pathname.startsWith("/admin")
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border border-white/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>後台控管</span>
            </Link>
          )}
        </nav>

        {/* 使用者資訊與登出 */}
        <div className="flex items-center space-x-3">
          {!loading && currentUser && (
            <div className="flex items-center space-x-3 pl-3 border-l border-white/[0.08]">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-100">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {currentUser.department ? `${currentUser.department} · ` : ""}
                  {currentUser.role === "ADMIN" ? "系統管理員" : "同仁"}
                </span>
              </div>
              
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-slate-200 shadow-sm">
                <User className="w-4 h-4 text-blue-400" />
              </div>

              <button
                onClick={handleLogout}
                title="登出系統"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition duration-150 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
