"use client";
import { Logo } from "../Logo";

export function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/5 py-14 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Logo size="sm" />
          <div className="mt-6 text-white/40 text-[13px] leading-relaxed max-w-md font-light">
            A new operating system for retail investors. Real-time data, AI research, and a
            modular workspace — built for traders who&apos;ve outgrown their broker&apos;s app.
          </div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.32em] text-white/40 mb-4">Product</div>
          <ul className="space-y-2 text-[13px]">
            <li><a href="#features" className="text-white/70 hover:text-white">Features</a></li>
            <li><a href="#pricing" className="text-white/70 hover:text-white">Pricing</a></li>
            <li><a href="/terminal" className="text-white/70 hover:text-white">Terminal</a></li>
            <li><a href="#" className="text-white/40">Changelog</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.32em] text-white/40 mb-4">Company</div>
          <ul className="space-y-2 text-[13px]">
            <li><a href="#about" className="text-white/70 hover:text-white">About</a></li>
            <li><a href="#" className="text-white/40">Careers</a></li>
            <li><a href="#" className="text-white/40">Contact</a></li>
            <li><a href="#" className="text-white/40">Press</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-white/5 flex items-center justify-between text-[10.5px] uppercase tracking-[0.32em] text-white/30">
        <span>© {new Date().getFullYear()} Falcon Markets, Inc.</span>
        <span>Built among the stars · v1.0</span>
      </div>
    </footer>
  );
}
