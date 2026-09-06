"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Gauge, Shield, User } from "lucide-react";

interface CurrentUser {
  userId: number;
  username: string;
  name: string;
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2">
      <nav className="flex items-center justify-around">
        <Link
          href="/calendar"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition ${
            pathname.startsWith("/calendar")
              ? "text-blue-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span>約車表</span>
        </Link>

        <Link
          href="/mileage"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition ${
            pathname.startsWith("/mileage")
              ? "text-blue-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Gauge className="w-5 h-5 mb-1" />
          <span>里程登記</span>
        </Link>

        {currentUser?.role === "ADMIN" && (
          <Link
            href="/admin"
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition ${
              pathname.startsWith("/admin")
                ? "text-indigo-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-5 h-5 mb-1" />
            <span>後台管理</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
