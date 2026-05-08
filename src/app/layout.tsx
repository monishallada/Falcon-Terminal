import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Falcon Terminal",
  description: "Next-generation retail investment terminal — modular, real-time, AI-native.",
  icons: {
    icon:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='10' fill='%2306080c'/><path d='M14 46 L32 14 L50 46 L42 46 L32 28 L22 46 Z' fill='%23ffb020'/></svg>"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans bg-bg-0 text-ink overflow-hidden">{children}</body>
    </html>
  );
}
