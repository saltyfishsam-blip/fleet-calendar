"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Gauge, Shield } from "lucide-react";

interface CurrentUser {
  role: "USER" | "ADMIN";
}

export default function MobileNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  if (pathname === "/login") return null;

  return (
    <div className="md:hidden fixed bottom-3 inset-x-4 z-50 pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto backdrop-blur-2xl bg-slate-950/85 border border-white/[0.12] rounded-2xl p-1.5 shadow-2xl shadow-black/80 flex items-center justify-around ring-1 ring-white/5">
        <Link
          href="/calendar"
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-150 ${
            pathname.startsWith("/calendar")
              ? "bg-blue-600/25 text-blue-400 font-bold border border-blue-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4 mb-1" />
          <span className="text-[11px] font-medium">約車行事曆</span>
        </Link>

        <Link
          href="/mileage"
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-150 ${
            pathname.startsWith("/mileage")
              ? "bg-blue-600/25 text-blue-400 font-bold border border-blue-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Gauge className="w-4 h-4 mb-1" />
          <span className="text-[11px] font-medium">里程回報</span>
        </Link>

        {currentUser?.role === "ADMIN" && (
          <Link
            href="/admin"
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-150 ${
              pathname.startsWith("/admin")
                ? "bg-purple-600/25 text-purple-400 font-bold border border-purple-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4 mb-1 text-amber-400" />
            <span className="text-[11px] font-medium">後台控管</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
