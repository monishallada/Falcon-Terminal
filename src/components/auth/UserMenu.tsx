"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const acct = useAuth((s) => (s.currentUserId ? s.accounts[s.currentUserId] : null));
  const signOut = useAuth((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!acct) return null;
  const initials = (acct.fullName || acct.username).slice(0, 1).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-7 px-1.5 rounded border border-line-soft hover:border-line text-ink-mute hover:text-ink flex items-center gap-1.5 text-[11px]"
      >
        <span className="w-5 h-5 rounded-full bg-falcon-gold/20 border border-falcon-gold/40 text-falcon-gold flex items-center justify-center text-[10px] font-semibold uppercase">
          {initials}
        </span>
        <span className="font-mono uppercase tracking-wider">{acct.username}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-60 bg-bg-2 border border-line rounded-md shadow-2xl overflow-hidden z-50">
          <div className="px-3 py-3 border-b border-line-soft">
            <div className="text-[12.5px] text-ink font-medium">{acct.fullName || acct.username}</div>
            <div className="text-[10.5px] text-ink-mute font-mono mt-0.5 truncate">{acct.email}</div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full text-left px-3 py-2 text-[12px] text-ink-dim hover:bg-bg-3 hover:text-ink flex items-center gap-2"
          >
            <UserIcon size={12} /> Visit website
          </button>
          <button
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
            className="w-full text-left px-3 py-2 text-[12px] text-ink-dim hover:bg-bear/10 hover:text-bear flex items-center gap-2 border-t border-line-soft"
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
