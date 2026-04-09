/**
 * NextAuth / Auth.js redirect errors are sent to `pages.signIn` as `?error=…`.
 * @see https://authjs.dev/guides/pages/built-in-pages
 */
export function getAuthPageErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;

  const messages: Record<string, string> = {
    OAuthAccountNotLinked:
      "This Google account cannot be linked automatically. You may already have an admin user with the same email that was created with email & password—sign in with email and password here once, or use the exact Google profile that matches that address. If you need Google-only access, ask a superadmin to verify your account is set up correctly in the database.",
    OAuthSignin: "We could not start Google sign-in. Try again in a moment.",
    OAuthCallback:
      "Google sign-in did not complete (redirect or consent failed). Close extra tabs, try again, and make sure this site’s URL is allowed in your Google OAuth client.",
    OAuthCreateAccount: "We could not create an account from Google. Contact support.",
    EmailCreateAccount: "We could not create an account with this email.",
    Callback: "Something went wrong after returning from Google. Try signing in again.",
    AccessDenied: "You do not have permission to sign in to the admin panel.",
    Verification: "The sign-in link is invalid or has expired.",
    Configuration:
      "Sign-in is misconfigured on the server (check AUTH_SECRET, AUTH_URL, and Google OAuth credentials).",
    CredentialsSignin: "Invalid email or password.",
    SessionRequired: "You need to sign in to continue.",
  };

  return messages[code] ?? `Sign-in failed (${code}). Please try again or use email and password.`;
}
