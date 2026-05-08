"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { genSalt, genToken, hashPassword } from "@/lib/password";

export interface AuthAccount {
  id: string;
  email: string;            // primary credential — case-insensitive
  username: string;         // display
  passwordHash: string;
  salt: string;
  createdAt: number;
  // optional profile bits
  fullName?: string;
}

export type AuthError =
  | "username_taken"
  | "email_taken"
  | "invalid_credentials"
  | "weak_password"
  | "missing_field"
  | "invalid_email";

export interface AuthState {
  accounts: Record<string, AuthAccount>;       // keyed by id
  byEmail: Record<string, string>;             // emailLower → id
  byUsername: Record<string, string>;          // usernameLower → id
  currentUserId: string | null;
  token: string | null;

  signUp(input: { email: string; username: string; password: string; fullName?: string }): Promise<{ ok: true } | { ok: false; error: AuthError; message: string }>;
  signIn(input: { identifier: string; password: string }): Promise<{ ok: true } | { ok: false; error: AuthError; message: string }>;
  signOut(): void;
  current(): AuthAccount | null;
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accounts: {},
      byEmail: {},
      byUsername: {},
      currentUserId: null,
      token: null,

      async signUp({ email, username, password, fullName }) {
        if (!email || !username || !password) {
          return { ok: false, error: "missing_field", message: "All fields are required." };
        }
        if (!isEmail(email)) {
          return { ok: false, error: "invalid_email", message: "Enter a valid email address." };
        }
        if (password.length < 8) {
          return { ok: false, error: "weak_password", message: "Password must be at least 8 characters." };
        }
        const emailLower = email.toLowerCase().trim();
        const usernameLower = username.toLowerCase().trim();
        if (get().byEmail[emailLower]) {
          return { ok: false, error: "email_taken", message: "An account with this email already exists." };
        }
        if (get().byUsername[usernameLower]) {
          return { ok: false, error: "username_taken", message: "That username is taken. Try another." };
        }
        const salt = genSalt(16);
        const passwordHash = await hashPassword(password, salt);
        const id = "u_" + genSalt(8);
        const account: AuthAccount = {
          id,
          email: emailLower,
          username: username.trim(),
          passwordHash,
          salt,
          createdAt: Date.now(),
          fullName: fullName?.trim()
        };
        set({
          accounts: { ...get().accounts, [id]: account },
          byEmail: { ...get().byEmail, [emailLower]: id },
          byUsername: { ...get().byUsername, [usernameLower]: id },
          currentUserId: id,
          token: genToken()
        });
        return { ok: true };
      },

      async signIn({ identifier, password }) {
        if (!identifier || !password) {
          return { ok: false, error: "missing_field", message: "Enter your email and password." };
        }
        const idLower = identifier.toLowerCase().trim();
        const id = get().byEmail[idLower] ?? get().byUsername[idLower];
        if (!id) {
          return { ok: false, error: "invalid_credentials", message: "Account not found. Try creating one." };
        }
        const acct = get().accounts[id];
        const hash = await hashPassword(password, acct.salt);
        if (hash !== acct.passwordHash) {
          return { ok: false, error: "invalid_credentials", message: "Wrong password. Please try again." };
        }
        set({ currentUserId: id, token: genToken() });
        return { ok: true };
      },

      signOut() {
        set({ currentUserId: null, token: null });
      },

      current() {
        const id = get().currentUserId;
        return id ? get().accounts[id] ?? null : null;
      }
    }),
    {
      name: "falcon-auth-v1",
      storage: createJSONStorage(() => (typeof window === "undefined" ? (undefined as unknown as Storage) : localStorage))
    }
  )
);

// Subscribe + helpers used by the workspace store
export function activeUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("falcon-auth-v1");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.state?.currentUserId ?? null;
  } catch {
    return null;
  }
}
