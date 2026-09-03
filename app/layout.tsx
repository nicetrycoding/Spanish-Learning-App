import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { Toaster } from "sonner";
import { ServiceWorkerRegistration } from "@/components/shared/service-worker-registration";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Sendero — Learn Spanish, adaptively",
    template: "%s · Sendero",
  },
  description:
    "An adaptive Spanish learning platform that diagnoses what you know, teaches what you don't, and keeps every skill sharp — from absolute zero to fluent, native-level Spanish.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#16140f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
