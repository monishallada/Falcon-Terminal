"use client";
import { Logo } from "../Logo";

export function Footer() {
  return (
    <footer className="relative pt-20 pb-16 px-6 sm:px-10">
      <div className="celestial-rule mb-20 mx-auto max-w-7xl" />
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-14">
        <div className="md:col-span-2">
          <Logo size="sm" />
          <div className="mt-8 text-white/60 text-[14px] leading-[1.85] max-w-md font-light">
            A new operating system for retail investors. Real-time data, AI research, and a
            modular workspace — built for traders who&apos;ve outgrown their broker&apos;s app.
          </div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.36em] text-white/45 mb-5">Product</div>
          <ul className="space-y-3 text-[13.5px]">
            <li><a href="#features" className="text-white/82 hover:text-white transition-colors">Features</a></li>
            <li><a href="#pricing" className="text-white/82 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="/terminal" className="text-white/82 hover:text-white transition-colors">Terminal</a></li>
            <li><a href="#" className="text-white/40">Changelog</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.36em] text-white/45 mb-5">Company</div>
          <ul className="space-y-3 text-[13.5px]">
            <li><a href="#about" className="text-white/82 hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="text-white/40">Careers</a></li>
            <li><a href="#" className="text-white/40">Contact</a></li>
            <li><a href="#" className="text-white/40">Press</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/8 flex items-center justify-between text-[10.5px] uppercase tracking-[0.36em] text-white/30">
        <span>© {new Date().getFullYear()} Falcon Markets, Inc.</span>
        <span>Built among the stars · v1.0</span>
      </div>
    </footer>
  );
}
