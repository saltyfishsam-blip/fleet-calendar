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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 系統標誌與名稱 */}
        <div className="flex items-center space-x-3">
          <Link href="/calendar" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-white/40 group-hover:scale-105 transition duration-200">
                <Car className="w-5 h-5 drop-shadow" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                  公務車輛預約系統
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide hidden sm:block">
                Fleet Scheduling & Mileage Operations
              </span>
            </div>
          </Link>
        </div>

        {/* 桌機端主導覽選單（淺色膠囊風格） */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-inner">
          <Link
            href="/calendar"
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center space-x-2 ${
              pathname.startsWith("/calendar")
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>約車行事曆</span>
          </Link>

          <Link
            href="/mileage"
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center space-x-2 ${
              pathname.startsWith("/mileage")
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
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
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>後台控管</span>
            </Link>
          )}
        </nav>

        {/* 使用者資訊與登出 */}
        <div className="flex items-center space-x-3">
          {!loading && currentUser && (
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {currentUser.department ? `${currentUser.department} · ` : ""}
                  {currentUser.role === "ADMIN" ? "系統管理員" : "同仁"}
                </span>
              </div>
              
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                <User className="w-4 h-4 text-blue-600" />
              </div>

              <button
                onClick={handleLogout}
                title="登出系統"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition duration-150 cursor-pointer"
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
