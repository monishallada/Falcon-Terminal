"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/auth";
import { loadUserWorkspace } from "@/store/workspace";
import { StarField } from "../landing/StarField";
import { Logo } from "../Logo";
import { ArrowRight, Loader2 } from "lucide-react";
import clsx from "clsx";

type Mode = "signin" | "signup";

export function AuthScreen() {
  const router = useRouter();
  const search = useSearchParams();
  const auth = useAuth();
  const initialMode: Mode = search.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // If already signed in, send them straight to /terminal — Robinhood style.
  useEffect(() => {
    if (auth.currentUserId) {
      setRedirecting(true);
      // Make sure the workspace store points at this user before navigating.
      loadUserWorkspace(auth.currentUserId).finally(() => {
        router.replace("/terminal");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let result: { ok: true } | { ok: false; error: string; message: string };
      if (mode === "signin") {
        result = await auth.signIn({ identifier, password });
      } else {
        result = await auth.signUp({ email, username, password, fullName });
      }
      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }
      const userId = useAuth.getState().currentUserId;
      await loadUserWorkspace(userId);
      router.replace("/terminal");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (redirecting) {
    return (
      <div className="relative min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-falcon-gold/80 spaced-display text-[11px] uppercase flex items-center gap-3">
          <Loader2 size={14} className="animate-spin" /> Loading your terminal…
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-black flex flex-col text-ink overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#02030a] to-black" />
      <StarField density={260} />
      <div className="cosmic-grain" />
      <div
        className="pointer-events-none absolute -top-1/2 left-1/2 -translate-x-1/2 w-[140vw] h-[140vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(240,193,75,0.12) 0%, rgba(240,193,75,0.04) 14%, rgba(0,0,0,0) 32%)"
        }}
        aria-hidden
      />

      <header className="relative z-10 px-6 sm:px-10 h-16 flex items-center">
        <Link href="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <Link href="/" className="ml-auto text-[12px] uppercase tracking-[0.18em] text-white/55 hover:text-white">
          ← Back to site
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-10">
            <div className="spaced-display text-[10.5px] uppercase tracking-[0.4em] text-falcon-gold/80 mb-5">
              {mode === "signin" ? "Sign in to terminal" : "Create your account"}
            </div>
            <h1 className="font-display font-extralight text-white text-[clamp(34px,4.6vw,48px)] leading-[1.05]">
              {mode === "signin" ? (
                <>
                  Welcome <span className="brand-gradient">back.</span>
                </>
              ) : (
                <>
                  Begin your <span className="brand-gradient">orbit.</span>
                </>
              )}
            </h1>
            <p className="mt-4 text-white/50 text-[13.5px] leading-relaxed font-light">
              {mode === "signin"
                ? "Your workspace, watchlists, and portfolio — exactly where you left them."
                : "Set up an account in seconds. Your data is stored locally on this device."}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex p-1 rounded-full border border-white/8 bg-white/[0.02] mb-7">
            <ModeBtn label="Sign In" active={mode === "signin"} onClick={() => { setMode("signin"); setError(null); }} />
            <ModeBtn label="Create Account" active={mode === "signup"} onClick={() => { setMode("signup"); setError(null); }} />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && (
              <Field
                label="Full name"
                value={fullName}
                onChange={setFullName}
                placeholder="Jane Trader"
                autoComplete="name"
              />
            )}
            {mode === "signup" ? (
              <>
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <Field
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  placeholder="jane_t"
                  autoComplete="username"
                  required
                />
              </>
            ) : (
              <Field
                label="Email or username"
                value={identifier}
                onChange={setIdentifier}
                placeholder="you@example.com"
                autoComplete="username"
                required
              />
            )}
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
            />

            {error && (
              <div className="rounded-md border border-bear/40 bg-bear/10 text-bear text-[12.5px] px-3 py-2 leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full inline-flex items-center justify-center gap-2 h-12 rounded-full text-[12.5px] uppercase mt-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign In" : "Create Account"} <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center text-[12px] text-white/40 mt-4">
              {mode === "signin" ? (
                <>
                  No account yet?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setError(null); }}
                    className="text-falcon-gold hover:underline"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signin"); setError(null); }}
                    className="text-falcon-gold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </form>

          <div className="mt-10 text-center text-[10.5px] uppercase tracking-[0.32em] text-white/25">
            Demo mode · accounts stored on this device
          </div>
        </div>
      </div>
    </main>
  );
}

function ModeBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex-1 h-9 rounded-full text-[11.5px] uppercase tracking-[0.18em] font-medium transition-colors",
        active ? "bg-falcon-gold/15 text-falcon-gold" : "text-white/55 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}
function Field({ label, value, onChange, type = "text", placeholder, autoComplete, required }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-[10.5px] uppercase tracking-[0.28em] text-white/45 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="gold-input w-full h-11 rounded-md px-3.5 text-[13.5px]"
      />
    </label>
  );
}
