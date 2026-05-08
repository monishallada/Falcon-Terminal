// Password hashing for the demo auth layer.
//
// IMPORTANT: this is a CLIENT-SIDE-ONLY hash, intended for demo / portfolio
// use. In production, replace with Auth0 / Clerk per the Falcon spec — server-
// side bcrypt/argon2/scrypt, password reset, MFA, rate-limiting, etc. Anyone
// with browser access can read these hashes; treat them as opaque identifiers
// for matching, not as security. SHA-256 + per-user random salt is enough to
// prevent trivial dictionary lookups against accidental localStorage exports.

function bytesToHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function genSalt(bytes = 16): string {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    return Math.random().toString(36).slice(2);
  }
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return bytesToHex(arr.buffer);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    // Fallback (very weak) for environments without subtle crypto
    let h = 0;
    const s = salt + ":" + password;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return "fallback-" + h.toString(16);
  }
  // Iterate the digest a handful of times to slow brute force a tiny bit
  let data = new TextEncoder().encode(salt + ":" + password);
  for (let i = 0; i < 1000; i++) {
    data = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  }
  return bytesToHex(data.buffer as ArrayBuffer);
}

export function genToken(bytes = 24): string {
  return genSalt(bytes);
}
