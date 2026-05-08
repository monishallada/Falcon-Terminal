"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { loadUserWorkspace } from "@/store/workspace";
import { Loader2 } from "lucide-react";
import { Logo } from "../Logo";

interface Props {
  children: React.ReactNode;
}

/**
 * Client-side route guard. While we hydrate from localStorage, show a small
 * loader. If there's no signed-in user, redirect to /login. Otherwise, point
 * the workspace store at this user's namespaced storage key and render.
 */
export function AuthGate({ children }: Props) {
  const router = useRouter();
  const userId = useAuth((s) => s.currentUserId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function go() {
      // Hydrate the auth store first (Zustand persist runs synchronously, but
      // we also want to pre-load the workspace store under the right key)
      if (!userId) {
        router.replace("/login");
        return;
      }
      await loadUserWorkspace(userId);
      if (!cancelled) setReady(true);
    }
    go();
    return () => {
      cancelled = true;
    };
  }, [userId, router]);

  if (!ready) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="sm" />
          <div className="text-falcon-gold/70 spaced-display text-[10.5px] uppercase flex items-center gap-2">
            <Loader2 size={12} className="animate-spin" />
            Loading your terminal
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
