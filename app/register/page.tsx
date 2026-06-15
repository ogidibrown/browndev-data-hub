"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wifi, Shield, Zap, Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import clsx from "clsx";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/invalid-email": "Enter a valid email address",
  "auth/network-request-failed": "Network error. Check your connection",
  "auth/operation-not-allowed": "Email/Password sign-in is not enabled — enable it in Firebase Console → Authentication → Sign-in method",
  "auth/invalid-api-key": "Firebase API key is invalid — check your .env.local file",
  "auth/configuration-not-found": "Firebase project not configured — check your .env.local file",
};

const FEATURES = [
  { emoji: "⚡", label: "Instant Data Delivery", desc: "Bundles land on any number in seconds" },
  { emoji: "📋", label: "Track Your Orders", desc: "Full history of every purchase" },
  { emoji: "🔒", label: "Secure Wallet", desc: "Top up and manage your balance safely" },
];

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"];
  const textColors = ["", "text-red-500", "text-amber-500", "text-blue-600", "text-green-600"];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={clsx(
              "h-1 flex-1 rounded-full transition-colors duration-200",
              i <= strength ? colors[strength] : "bg-slate-200"
            )}
          />
        ))}
      </div>
      <p className={clsx("text-xs font-semibold", textColors[strength])}>{labels[strength]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const { user, loading: authLoading, register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string; email?: string; password?: string; confirm?: string;
  }>({});

  useEffect(() => {
    if (!authLoading && user) router.push("/");
  }, [user, authLoading, router]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim() || name.trim().length < 2)
      e.name = "Enter your full name";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address";
    if (!password || password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (password !== confirm)
      e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email, password);
      toast.success("Account created! Welcome to BrownDev Data Hub 🎉");
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      console.error("[Register error]", err);
      toast.error(FIREBASE_ERRORS[code] ?? `Registration failed (${code || "unknown error"})`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen lg:flex">

      {/* ── LEFT PANEL (desktop) ── */}
      <aside className="hidden lg:flex w-[400px] xl:w-[460px] flex-shrink-0 flex-col bg-[#2B4EC8] sticky top-0 h-screen overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-black/[0.08] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-40 h-40 rounded-full bg-white/[0.04] pointer-events-none translate-x-1/2 -translate-y-1/2" />

        <div className="relative flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-14 w-fit">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Wifi className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-black text-white text-xl leading-none tracking-tight">BrownDev</span>
              <span className="block text-[10px] text-blue-200 font-bold tracking-[0.25em] uppercase">Data Hub</span>
            </div>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-bold px-3 py-1.5 rounded-full mb-5 w-fit tracking-wide uppercase">
              <Zap className="h-3 w-3 text-[#FFBB00]" />
              Join for free
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-4 tracking-tight">
              Create your<br />account.<br />
              <span className="text-[#FFBB00]">It&apos;s free.</span>
            </h1>
            <p className="text-blue-200 text-sm xl:text-base leading-relaxed mb-10 max-w-xs">
              Join thousands of Ghanaians buying data bundles instantly — any time, any network.
            </p>

            <div className="space-y-5">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-lg leading-none">
                    {f.emoji}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{f.label}</p>
                    <p className="text-blue-300 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex items-center gap-2 text-blue-300 text-xs font-medium">
            <Shield className="h-3.5 w-3.5 text-green-300 flex-shrink-0" />
            Secured by Paystack · SSL Encrypted
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#EEF2FF]">

        {/* Mobile header */}
        <header className="lg:hidden bg-[#2B4EC8] px-4 py-4 sm:px-6 flex items-center justify-between shadow-lg">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Wifi className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-black text-white text-lg leading-none tracking-tight">BrownDev</span>
              <span className="block text-[10px] text-blue-200 font-semibold tracking-[0.2em] uppercase">Data Hub</span>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-green-300" />
            <span className="text-xs text-white/80 font-semibold">Secured</span>
          </div>
        </header>

        {/* Form area */}
        <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 xl:px-16 py-10 w-full max-w-md lg:max-w-lg mx-auto">

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">Create account</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-[#2B4EC8] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Kwame Mensah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={clsx(
                    "w-full bg-white border-2 rounded-xl pl-10 pr-4 py-3 text-[#1E293B] placeholder-slate-300 outline-none transition-colors text-sm font-semibold",
                    errors.name
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-[#2B4EC8]"
                  )}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={clsx(
                    "w-full bg-white border-2 rounded-xl pl-10 pr-4 py-3 text-[#1E293B] placeholder-slate-300 outline-none transition-colors text-sm font-semibold",
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-[#2B4EC8]"
                  )}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={clsx(
                    "w-full bg-white border-2 rounded-xl pl-10 pr-11 py-3 text-[#1E293B] placeholder-slate-300 outline-none transition-colors text-sm font-semibold",
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-[#2B4EC8]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={clsx(
                    "w-full bg-white border-2 rounded-xl pl-10 pr-11 py-3 text-[#1E293B] placeholder-slate-300 outline-none transition-colors text-sm font-semibold",
                    errors.confirm
                      ? "border-red-400 focus:border-red-500"
                      : confirm && confirm === password
                        ? "border-green-400 focus:border-green-500"
                        : "border-slate-200 focus:border-[#2B4EC8]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.confirm}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2B4EC8] hover:bg-[#1D40B0] active:bg-[#1638A0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-xl py-4 transition-colors text-sm shadow-lg shadow-blue-500/30 mt-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 bg-white hover:bg-slate-50 text-[#1E293B] font-bold rounded-xl py-3.5 transition-colors text-sm"
          >
            Sign in to existing account
          </Link>
        </main>

        <footer className="text-center py-6 text-xs text-slate-400 font-medium border-t border-slate-200">
          © {new Date().getFullYear()} BrownDev Data Hub · All rights reserved
        </footer>
      </div>
    </div>
  );
}
