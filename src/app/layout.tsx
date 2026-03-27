import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

/* ── Primary modern, stylish font: Outfit ── */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HealthConnect | Doctors Near You",
  description: "Find nearby doctors, contact clinics, and connect to emergency services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased dark`}
    >
      <body className={`${outfit.className} min-h-full flex flex-col bg-transparent selection:bg-violet-500/50`}>
        {children}
      </body>
    </html>
  );
}
