"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Network, DataPackage } from "@/types";
import NetworkSelector from "@/components/NetworkSelector";
import PackagePicker from "@/components/PackagePicker";
import CheckoutForm from "@/components/CheckoutForm";
import StepIndicator from "@/components/StepIndicator";
import SiteFooter from "@/components/SiteFooter";
import toast from "react-hot-toast";
import { ChevronLeft, Wifi, Shield, Zap, Menu, Lock, LogOut, Star } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { useAuth } from "@/contexts/AuthContext";

const REVIEWS = [
  {
    name: "Kwame A.",
    network: "MTN",
    rating: 5,
    text: "Ordered a 5GB MTN bundle and it arrived before I even left the payment page. Incredibly fast!",
  },
  {
    name: "Abena M.",
    network: "Telecel",
    rating: 5,
    text: "I was skeptical at first but it worked perfectly. Got 20GB Telecel data in seconds. Will definitely use again.",
  },
  {
    name: "Kofi B.",
    network: "AirtelTigo",
    rating: 5,
    text: "Best prices I have found for AirtelTigo bundles. Payment was smooth and data came through instantly.",
  },
  {
    name: "Ama D.",
    network: "MTN",
    rating: 5,
    text: "I buy data for my whole family here. So easy to top up any number. Saves me a lot of time.",
  },
];

type Step = 0 | 1 | 2;

const NETWORK_LABELS: Record<Network, string> = {
  mtn: "MTN",
  telecel: "Telecel",
  airteltigo: "AirtelTigo",
};

const STEP_META = [
  { title: "Choose your network", sub: "Select a network to see available data bundles" },
  { title: "Pick a bundle", sub: "Choose the data size that works for you" },
  { title: "Payment details", sub: "Enter your details to complete the purchase" },
];

const FEATURES = [
  { emoji: "⚡", label: "Instant Delivery", desc: "Data delivered within seconds" },
  { emoji: "🔒", label: "Secured by Paystack", desc: "PCI-DSS compliant checkout" },
  { emoji: "📱", label: "Any Number", desc: "Top up yours or someone else's" },
  { emoji: "🇬🇭", label: "Ghana Only", desc: "MTN · Telecel · AirtelTigo" },
];

export default function Home() {
  const [step, setStep] = useState<Step>(0);
  const [network, setNetwork] = useState<Network | null>(null);
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<DataPackage | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  const loadPackages = useCallback(async (net: Network) => {
    setLoadingPkgs(true);
    setPackages([]);
    try {
      const res = await fetch(`/api/packages?network=${net}`);
      const data = await res.json();
      if (data.packages) {
        setPackages(data.packages);
      } else {
        toast.error("Could not load packages. Try again.");
      }
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setLoadingPkgs(false);
    }
  }, []);

  const handleNetworkSelect = (net: Network) => {
    if (!user) {
      toast.error("Sign in to buy data");
      router.push("/login");
      return;
    }
    setNetwork(net);
    setSelectedPkg(null);
    setStep(1);
    loadPackages(net);
  };

  const handlePackageSelect = (pkg: DataPackage) => {
    setSelectedPkg(pkg);
    setStep(2);
  };

  const handleCheckout = async (phone: string, email: string) => {
    if (!network || !selectedPkg) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundleId: selectedPkg.id,
          phoneNumber: phone,
          email,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Payment initialization failed");
        return;
      }
      window.location.href = data.authorization_url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 1) { setStep(0); setNetwork(null); }
  };

  return (
    <div className="min-h-screen lg:flex">

      {/* ── LEFT PANEL (desktop only) ── */}
      <aside className="hidden lg:flex w-[400px] xl:w-[460px] flex-shrink-0 flex-col bg-[#2B4EC8] sticky top-0 h-screen overflow-hidden relative">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-black/[0.08] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-40 h-40 rounded-full bg-white/[0.04] pointer-events-none translate-x-1/2 -translate-y-1/2" />

        <div className="relative flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Wifi className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-black text-white text-xl leading-none tracking-tight">BrownDev</span>
              <span className="block text-[10px] text-blue-200 font-bold tracking-[0.25em] uppercase">Data Hub</span>
            </div>
          </div>

          {/* Hero */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wide uppercase">
              <Zap className="h-3 w-3 text-[#FFBB00]" />
              Instant · Secure · Reliable
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
              Buy Data<br />Bundles<br />
              <span className="text-[#FFBB00]">in Seconds.</span>
            </h1>
            <p className="text-blue-200 text-sm xl:text-base leading-relaxed mb-10 max-w-xs">
              Top up any MTN, Telecel, or AirtelTigo number instantly — no hassle, any time of day.
            </p>

            {/* Features */}
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

          {/* Auth controls + trust strip */}
          <div className="mt-10 pt-6 border-t border-white/10 space-y-4">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">Signed in as</p>
                  <p className="text-white font-black text-sm truncate">
                    {user.displayName || user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white font-bold transition-colors flex-shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 text-center bg-white text-[#2B4EC8] font-black text-xs py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center bg-white/15 border border-white/25 text-white font-black text-xs py-2.5 rounded-xl hover:bg-white/25 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
            <div className="flex items-center gap-2 text-blue-300 text-xs font-medium">
              <Shield className="h-3.5 w-3.5 text-green-300 flex-shrink-0" />
              Secured by Paystack · SSL Encrypted
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#EEF2FF]">

        {/* Mobile slide-in menu */}
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* Mobile header */}
        <header className="lg:hidden bg-[#2B4EC8] px-4 py-4 sm:px-6 flex items-center justify-between shadow-lg sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
            <div>
              <span className="font-black text-white text-lg leading-none tracking-tight">BrownDev</span>
              <span className="block text-[10px] text-blue-200 font-semibold tracking-[0.2em] uppercase">Data Hub</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-green-300" />
            <span className="text-xs text-white/80 font-semibold">Secured</span>
          </div>
        </header>

        <main className="flex-1 w-full max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-6 lg:py-10">

          {/* Mobile hero — step 0 only */}
          {step === 0 && (
            <div className="lg:hidden mb-7">
              <div className="inline-flex items-center gap-1.5 bg-blue-100 text-[#2B4EC8] text-xs font-bold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
                <Zap className="h-3 w-3" />
                Instant Delivery · Ghana Only 🇬🇭
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#1E293B] leading-tight mb-2.5 tracking-tight">
                Buy Data Bundles<br />
                <span className="text-[#2B4EC8]">in Seconds.</span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-base font-medium">
                MTN · Telecel · AirtelTigo — delivered straight to any number.
              </p>
            </div>
          )}

          {/* Desktop step heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl xl:text-3xl font-black text-[#1E293B] tracking-tight">
              {STEP_META[step].title}
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {STEP_META[step].sub}
            </p>
          </div>

          {/* Back button (steps > 0) */}
          {step > 0 && (
            <div className="flex items-center gap-3 mb-5 lg:mb-6">
              <button
                onClick={goBack}
                className="h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="lg:hidden">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  {step === 1 ? "Step 2 of 3" : "Step 3 of 3"}
                </p>
                <p className="text-sm font-black text-[#1E293B]">
                  {step === 1
                    ? `${network ? NETWORK_LABELS[network] : ""} Bundles`
                    : "Payment Details"}
                </p>
              </div>
            </div>
          )}

          {/* Step progress */}
          <StepIndicator current={step} />

          {/* Step 0: Network picker */}
          {step === 0 && (
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3 lg:hidden">
                Choose your network
              </p>
              <NetworkSelector selected={network} onSelect={handleNetworkSelect} />

              {/* Auth prompt — only shown to guests */}
              {!user && (
                <div className="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <Lock className="h-4 w-4 text-[#2B4EC8] flex-shrink-0" />
                  <p className="text-sm text-[#1E293B] font-medium">
                    <Link href="/login" className="text-[#2B4EC8] font-black hover:underline">Sign in</Link>
                    {" "}or{" "}
                    <Link href="/register" className="text-[#2B4EC8] font-black hover:underline">create an account</Link>
                    {" "}to buy data
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Package picker */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 lg:p-6">
              <PackagePicker
                packages={packages}
                selected={selectedPkg}
                onSelect={handlePackageSelect}
                loading={loadingPkgs}
              />
            </div>
          )}

          {/* Step 2: Checkout */}
          {step === 2 && network && selectedPkg && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 lg:p-8">
              <CheckoutForm
                network={network}
                pkg={selectedPkg}
                onSubmit={handleCheckout}
                loading={checkingOut}
              />
            </div>
          )}

          {/* Mobile trust strip */}
          {step === 0 && (
            <div className="flex items-center justify-center gap-5 mt-8 text-xs text-slate-400 font-semibold lg:hidden">
              <span>⚡ Instant</span>
              <span className="h-3 w-px bg-slate-300" />
              <span>🔒 Secure</span>
              <span className="h-3 w-px bg-slate-300" />
              <span>✅ Reliable</span>
            </div>
          )}

          {/* Customer reviews — shown only on step 0 */}
          {step === 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#FFBB00] fill-[#FFBB00]" />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-bold">Trusted by customers across Ghana</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {REVIEWS.map((r) => (
                  <div key={r.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-[#2B4EC8] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                        {r.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#1E293B]">{r.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{r.network} customer</p>
                      </div>
                      <div className="ml-auto flex">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-[#FFBB00] fill-[#FFBB00]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
