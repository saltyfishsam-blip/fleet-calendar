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
      <nav className="pointer-events-auto max-w-md mx-auto backdrop-blur-2xl bg-white/95 border border-slate-200/90 rounded-2xl p-1.5 shadow-xl shadow-slate-900/10 flex items-center justify-around ring-1 ring-slate-100">
        <Link
          href="/calendar"
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-150 ${
            pathname.startsWith("/calendar")
              ? "bg-blue-50 text-blue-600 font-bold border border-blue-200"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4 mb-1" />
          <span className="text-[11px] font-medium">約車行事曆</span>
        </Link>

        <Link
          href="/mileage"
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-150 ${
            pathname.startsWith("/mileage")
              ? "bg-blue-50 text-blue-600 font-bold border border-blue-200"
              : "text-slate-500 hover:text-slate-900"
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
                ? "bg-purple-50 text-purple-600 font-bold border border-purple-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Shield className="w-4 h-4 mb-1 text-amber-500" />
            <span className="text-[11px] font-medium">後台控管</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
