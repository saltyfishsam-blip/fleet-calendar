"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Gauge, Shield, LogOut, User, Car } from "lucide-react";

interface CurrentUser {
  userId: number;
  username: string;
  name: string;
  role: "USER" | "ADMIN";
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
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 系統標題與標誌 */}
        <div className="flex items-center space-x-3">
          <Link href="/calendar" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white block">
                公務車輛預約系統
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                Fleet Scheduling & Mileage Management
              </span>
            </div>
          </Link>
        </div>

        {/* 桌機端主導覽選單 */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/calendar"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${
              pathname.startsWith("/calendar")
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>約車行事曆</span>
          </Link>

          <Link
            href="/mileage"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${
              pathname.startsWith("/mileage")
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>里程回報</span>
          </Link>

          {currentUser?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${
                pathname.startsWith("/admin")
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>後台控管</span>
            </Link>
          )}
        </nav>

        {/* 使用者資訊與登出按鈕 */}
        <div className="flex items-center space-x-3">
          {!loading && currentUser && (
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-100">{currentUser.name}</span>
                <span className="text-xs text-slate-400">
                  {currentUser.role === "ADMIN" ? "系統管理員" : "一般使用者"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
              <button
                onClick={handleLogout}
                title="登出系統"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
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
