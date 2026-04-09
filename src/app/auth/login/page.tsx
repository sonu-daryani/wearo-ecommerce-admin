import { auth } from "@/auth";
import { isGoogleAuthEnabled } from "@/lib/google-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  const callbackUrl = searchParams?.callbackUrl || "/admin";
  /** Don’t skip the login page while OAuth returned an error — user must see the message. */
  const oauthError = searchParams?.error;
  if (session?.user?.id && !oauthError) {
    redirect(callbackUrl);
  }

  const googleAuthEnabled = isGoogleAuthEnabled();

  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LoginForm googleAuthEnabled={googleAuthEnabled} />
    </Suspense>
  );
}
