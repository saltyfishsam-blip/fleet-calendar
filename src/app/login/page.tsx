"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Car,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CalendarCheck,
  CloudSun,
  Gauge,
  Sparkles,
} from "lucide-react";
import { SYSTEM_BACKGROUNDS } from "@/lib/vehicleImages";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/calendar";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("請輸入使用者帳號與密碼");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "帳號或密碼錯誤，請重新確認");
        setLoading(false);
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch {
      setErrorMsg("伺服器連線異常，請稍後再試");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
      {/* 標題與引導 */}
      <div className="mb-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>企業級公務車輛調度平台</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          同仁登入
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal">
          請輸入您的企業帳號與密碼以進行出車排程與紀錄查詢
        </p>
      </div>

      {/* 錯誤訊息提示 */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-700 text-xs font-semibold animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 登入表單 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide">
            使用者帳號
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入系統帳號"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm font-medium"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide">
            登入密碼
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入登入密碼"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm font-medium"
              disabled={loading}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 border border-blue-700/30 flex items-center justify-center space-x-2 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>身分驗證中...</span>
            </>
          ) : (
            <>
              <span>登入系統</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* 底部企業安全驗證標記 */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>SSL 加密安全通道傳輸</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">v1.2.0</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* 左側：商務出行視覺背景與價值展示（桌面端沉浸展示） */}
      <div className="relative hidden lg:flex lg:w-3/5 xl:w-2/3 flex-col justify-between p-12 overflow-hidden border-r border-slate-200">
        {/* 背景圖片 */}
        <div className="absolute inset-0 z-0">
          <Image
            src={SYSTEM_BACKGROUNDS.loginHero}
            alt="公務車隊商務出行"
            fill
            priority
            className="object-cover object-center scale-105 transition-transform duration-1000"
            sizes="(max-width: 1200px) 60vw, 66vw"
          />
          {/* 溫潤高雅的漸層遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/30 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 z-10" />
        </div>

        {/* 頂部品牌商標 */}
        <div className="relative z-20 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 border border-white/20">
            <Car className="w-6 h-6 drop-shadow" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              公務車輛預約系統
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Fleet Scheduling & Mileage Operations
            </p>
          </div>
        </div>

        {/* 中下部：核心價值與亮點 */}
        <div className="relative z-20 max-w-2xl mb-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-semibold mb-4">
            <span>智慧出勤管理解決方案</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            智慧調度・精準出勤・里程閉環
          </h2>
          <p className="text-sm text-slate-200 mt-3 leading-relaxed font-normal">
            整合視覺化行事曆排程、出勤區域即時氣象連動與數位化行車里程結算，全方位強化企業車輛運行效率與安全控管。
          </p>

          {/* 3 項核心特點卡片 */}
          <div className="grid grid-cols-3 gap-3.5 mt-8">
            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg text-slate-900">
              <CalendarCheck className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-xs font-bold text-slate-900">排程防衝突</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                時段排他校驗引擎，杜絕重複預約
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg text-slate-900">
              <CloudSun className="w-5 h-5 text-amber-500 mb-2" />
              <div className="text-xs font-bold text-slate-900">即時出勤氣候</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                全台 22 縣市即時氣候與降雨預警
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg text-slate-900">
              <Gauge className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="text-xs font-bold text-slate-900">里程閉環回報</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                自動串接出發里程，精算行駛數據
              </div>
            </div>
          </div>
        </div>

        {/* 底部版權聲明 */}
        <div className="relative z-20 text-xs text-slate-300 font-medium">
          © 2026 Fleet Operations System. All rights reserved.
        </div>
      </div>

      {/* 右側：簡潔純白登入操作區（支援手機自適應） */}
      <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col justify-center px-6 sm:px-12 py-12 relative bg-slate-50">
        {/* 手機端頂部微視覺橫幅 */}
        <div className="lg:hidden mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-xl shadow-blue-500/20 border border-white/40 mb-3">
            <Car className="w-7 h-7 text-white drop-shadow" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            公務車輛預約系統
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            行動端企業出勤排程中心
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-12 text-center text-slate-500 text-xs font-medium">
              系統載入中...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
