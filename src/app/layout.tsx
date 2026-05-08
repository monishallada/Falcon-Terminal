import type { Metadata } from "next";
import { Outfit, Space_Mono, Inter } from "next/font/google";
import "./globals.css";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap"
});

const mono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-display-mono",
  weight: ["400", "700"],
  display: "swap"
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Falcon — A new terminal for retail investors",
  description:
    "Falcon is a Bloomberg-class terminal built for the next generation of retail investors. Real-time data, AI research, modular workspaces.",
  icons: {
    icon:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='10' fill='%23000000'/><path d='M14 46 L32 14 L50 46 L42 46 L32 28 L22 46 Z' fill='%23f0c14b'/></svg>"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${mono.variable} ${sans.variable}`}
    >
      <body className="antialiased font-sans bg-black text-ink overflow-x-hidden">{children}</body>
    </html>
  );
}
