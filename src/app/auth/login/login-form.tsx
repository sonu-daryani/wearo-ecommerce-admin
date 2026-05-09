"use client";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { getAuthPageErrorMessage } from "@/lib/auth/auth-error-messages";
import { cn } from "@/lib/utils";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-config";
import { Eye, EyeOff, Info, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useId, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  googleAuthEnabled: boolean;
  callbackUrl: string;
  oauthError?: string;
};

/** Shown on the login card; override with NEXT_PUBLIC_DEMO_LOGIN_*; set NEXT_PUBLIC_HIDE_LOGIN_DEMO=true to hide. */
const DEMO_LOGIN_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_LOGIN_EMAIL ?? "demo@wearo.in";
const DEMO_LOGIN_PASSWORD =
  process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD ?? "admin123+";
const HIDE_DEMO_CALLOUT = process.env.NEXT_PUBLIC_HIDE_LOGIN_DEMO === "true";

export function LoginForm({ googleAuthEnabled, callbackUrl, oauthError }: Props) {
  const router = useRouter();
  const oauthErrorMessage = getAuthPageErrorMessage(oauthError);
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (oauthErrorMessage) {
      toast.error(oauthErrorMessage);
    }
  }, [oauthErrorMessage]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        const msg = "Invalid email or password.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      toast.success("Signed in");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-background to-sky-50 dark:from-slate-950 dark:via-background dark:to-slate-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(at 0% 0%, hsl(var(--primary) / 0.12) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsl(199 89% 48% / 0.1) 0px, transparent 45%)`,
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.45)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.45)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_45%,transparent)] dark:opacity-40" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-14 sm:py-16">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="rounded-2xl border border-border/70 bg-card/95 p-8 shadow-xl shadow-slate-900/[0.06] backdrop-blur-sm dark:border-border/60 dark:bg-card/90 dark:shadow-black/30 sm:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/20">
                <ShieldCheck className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3 w-3" aria-hidden />
                Staff access
              </p>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
                Sign in to admin
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {SITE_NAME} · {SITE_DOMAIN} — catalog, orders, and storefront settings.
              </p>
            </div>

            {!HIDE_DEMO_CALLOUT && (
              <div
                className="mb-6 flex gap-3 rounded-xl border border-sky-200/90 bg-sky-50/95 px-4 py-3 text-left dark:border-sky-900/50 dark:bg-sky-950/35"
                role="note"
              >
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400"
                  aria-hidden
                />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-sky-950 dark:text-sky-100">
                    Public CRM demo (CONTRIBUTOR)
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-sky-900/85 dark:text-sky-200/90">
                    Email{" "}
                    <span className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[13px] text-foreground dark:bg-sky-900/80">
                      {DEMO_LOGIN_EMAIL}
                    </span>
                    <span className="mx-1 text-sky-700/80 dark:text-sky-400/80">·</span>
                    Password{" "}
                    <span className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[13px] text-foreground dark:bg-sky-900/80">
                      {DEMO_LOGIN_PASSWORD}
                    </span>
                  </p>
                  <p className="mt-2 text-[11px] leading-snug text-sky-800/75 dark:text-sky-300/75">
                    Create-only access — new CMS and products only; cannot edit or delete existing
                    records.
                  </p>
                </div>
              </div>
            )}

            {oauthErrorMessage && (
              <div
                className="mb-7 rounded-xl border border-destructive/35 bg-destructive/5 px-4 py-3.5 text-sm text-destructive"
                role="alert"
              >
                <p className="font-semibold text-destructive">Sign-in could not complete</p>
                <p className="mt-2 leading-relaxed text-destructive/95">{oauthErrorMessage}</p>
                {oauthError && (
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Code: <span className="font-mono">{oauthError}</span>
                  </p>
                )}
              </div>
            )}

            {googleAuthEnabled && (
              <>
                <div className="space-y-3">
                  <GoogleSignInButton callbackUrl={callbackUrl} />
                </div>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[11px] font-medium uppercase tracking-widest">
                    <span className="bg-card px-3 text-muted-foreground">Or email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor={emailId} className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={passwordId} className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id={passwordId}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(inputClass, "pr-12")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="h-12 w-full rounded-full text-base font-semibold shadow-md shadow-primary/20"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs leading-relaxed text-muted-foreground/90">
            This panel is restricted to authorized team members. Need access? Contact your
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
