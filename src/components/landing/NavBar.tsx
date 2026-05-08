"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { Logo } from "../Logo";
import clsx from "clsx";

export function NavBar() {
  const acct = useAuth((s) => s.currentUserId);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-[backdrop-filter,background,border] duration-300",
        scrolled
          ? "backdrop-blur-md bg-black/60 border-b border-white/5"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center">
        <Link href="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <div className="hidden md:flex items-center gap-9 ml-14 text-[12.5px] font-medium tracking-[0.18em] uppercase text-white/75">
          <a href="#product" className="hover:text-white transition-colors">Product</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {mounted && acct ? (
            <Link
              href="/terminal"
              className="btn-gold inline-flex items-center justify-center px-5 h-9 rounded-full text-[12px] uppercase"
            >
              Open Terminal
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center text-[12.5px] font-medium tracking-[0.18em] uppercase text-white/85 hover:text-white px-3 h-9"
              >
                Sign In
              </Link>
              <Link
                href="/login?mode=signup"
                className="btn-gold inline-flex items-center justify-center px-5 h-9 rounded-full text-[12px] uppercase"
              >
                Get Access
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
