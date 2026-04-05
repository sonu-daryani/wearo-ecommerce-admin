import type { Metadata } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import Providers from "./providers";
import { SITE_NAME, getMetadataBase } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: `Admin · ${SITE_NAME}`,
    template: `%s · Admin · ${SITE_NAME}`,
  },
  description: "CMS, catalog, and staff tools.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body className={satoshi.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
