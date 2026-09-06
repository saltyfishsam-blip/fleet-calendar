"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Car, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/calendar";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setErrorMsg(data.error || "登入失敗，請確認帳號密碼");
        setLoading(false);
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch {
      setErrorMsg("連線伺服器異常，請稍後再試");
      setLoading(false);
    }
  };

  const handleFillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg("");
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            使用者帳號
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入帳號（例如 admin）"
              className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            登入密碼
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <span>{loading ? "驗證中..." : "登入系統"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* 快速填入測試帳號 */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <span className="text-xs font-semibold text-slate-400 block mb-3 text-center">
          測試帳號快捷填入
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleFillDemo("admin", "admin123")}
            className="px-3 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-200 text-center transition hover:border-slate-600"
          >
            管理員 (admin)
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo("user1", "user123")}
            className="px-3 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-200 text-center transition hover:border-slate-600"
          >
            一般同仁 (user1)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        {/* Logo 與標題 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/20">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            公務車輛預約系統
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            請登入您的企業帳號以進行約車調度與里程回報
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-slate-500">載入中...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
