import { auth } from "@/auth";
import { isGoogleAuthEnabled } from "@/lib/google-auth";
import { redirect } from "next/navigation";
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
    <LoginForm
      googleAuthEnabled={googleAuthEnabled}
      callbackUrl={callbackUrl}
      oauthError={oauthError}
    />
  );
}
