"use client";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { getAuthPageErrorMessage } from "@/lib/auth/auth-error-messages";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  googleAuthEnabled: boolean;
  callbackUrl: string;
  oauthError?: string;
};

export function LoginForm({ googleAuthEnabled, callbackUrl, oauthError }: Props) {
  const router = useRouter();
  const oauthErrorMessage = getAuthPageErrorMessage(oauthError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <h1 className="text-3xl font-bold text-foreground mb-2">Sign in</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Welcome back to Wearo.in
      </p>

      {oauthErrorMessage && (
        <div
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-medium text-destructive">Sign-in could not complete</p>
          <p className="mt-1.5 text-destructive/90 leading-relaxed">{oauthErrorMessage}</p>
          {oauthError && (
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Code: <span className="font-mono">{oauthError}</span>
            </p>
          )}
        </div>
      )}

      {googleAuthEnabled && (
        <>
          <div className="space-y-3 mb-8">
            <GoogleSignInButton callbackUrl={callbackUrl} />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or use email
              </span>
            </div>
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus-visible:ring-2"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus-visible:ring-2"
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full rounded-full h-12" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
