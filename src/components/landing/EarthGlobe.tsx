"use client";
import { useEffect, useRef } from "react";

/**
 * A real, slowly rotating 3D Earth — rendered in pure Canvas 2D with no
 * external dependencies. Every frame, each pixel of a circular mask is
 * projected back from the screen onto a sphere, sampled against an
 * equirectangular procedural Earth texture, and shaded by a directional
 * "sun" light to produce the day/night terminator. An additive cyan rim
 * is drawn on top for the atmosphere.
 *
 * Why pure 2D instead of WebGL/Three.js?  Self-contained (no texture asset,
 * no library), trivially SSR-safe (gated by useEffect), runs at 60 fps on
 * any device that can run Falcon's other widgets.
 *
 * Design knobs you might tune:
 *   • renderRadius (px)   — size of the rendered globe
 *   • secondsPerRotation  — speed of rotation (default ~80s, meditative)
 *   • lightDir            — direction of the sun in view space
 *   • atmosphereColor     — rim halo
 */
export default function EarthGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let cancelled = false;

    // ---- Texture (built once) ----
    const TEX_W = 1024;
    const TEX_H = 512;
    const tex = buildEarthTexture(TEX_W, TEX_H);

    // ---- Render canvas ----
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%;pointer-events:none;";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: true })!;

    // Render at a fixed pixel size that scales with container — capped
    // so we don't melt mobile GPUs. The CSS will upscale this canvas.
    let lastW = 0;
    let lastH = 0;
    let renderRadius = 0;
    let cx = 0;
    let cy = 0;
    let mask: Uint16Array = new Uint16Array(0);   // packed pixel offsets inside circle
    let baseLon: Float32Array = new Float32Array(0); // base longitude per masked pixel
    let texY: Uint16Array = new Uint16Array(0);   // texture v row per masked pixel
    let shade: Float32Array = new Float32Array(0); // light intensity per masked pixel
    let imageData: ImageData;

    // Sun direction in eye space (x right, y up, z out of screen toward viewer)
    const lightDir = normalize3(-0.55, 0.45, 0.7);

    function setupSphereMask() {
      const w = canvas.width;
      const h = canvas.height;
      // The container is sized to roughly the bottom 60% of the hero, so we
      // pose the sphere with its center near the bottom edge and the bottom
      // half cropped — exactly the "Earth from low orbit" arc in the brand
      // banner. The radius is generous so the curve is visible across the
      // full width, but we cap by width so the limb stays inside the frame
      // on narrow viewports.
      renderRadius = Math.min(h * 0.7, w * 0.65);
      cx = w / 2;
      cy = h * 0.95;

      const masked: number[] = [];
      const lons: number[] = [];
      const ys: number[] = [];
      const intensities: number[] = [];
      const r2 = renderRadius * renderRadius;
      for (let py = 0; py < h; py++) {
        const dy = py - cy;
        const dy2 = dy * dy;
        for (let px = 0; px < w; px++) {
          const dx = px - cx;
          const d2 = dx * dx + dy2;
          if (d2 > r2) continue;
          // Project to sphere surface (front hemisphere)
          const nx = dx / renderRadius;
          const ny = dy / renderRadius;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          // Latitude (north positive). Note canvas y is down → flip sign.
          const lat = Math.asin(-ny); // [-π/2, π/2]
          // Base longitude (will be offset by global rotation each frame)
          const lon = Math.atan2(nx, nz); // [-π, π]
          // Lambert shading
          let dot = nx * lightDir.x + (-ny) * lightDir.y + nz * lightDir.z;
          // Soft ambient floor so the night side doesn't go pure black —
          // the ocean-deep blue still reads.
          dot = Math.max(0.08, dot);
          // Slight rim brightening at the limb
          const limb = 1 - Math.sqrt(1 - nz * nz); // 0 at center → 1 at limb
          dot = Math.min(1, dot + limb * 0.06);

          const yIdx = Math.min(TEX_H - 1, Math.max(0, Math.round(((lat + Math.PI / 2) / Math.PI) * (TEX_H - 1))));

          masked.push(py * w + px);
          lons.push(lon);
          ys.push(yIdx);
          intensities.push(dot);
        }
      }
      mask = new Uint16Array(masked.length * 2);
      // pack (px, py) into pairs of 16-bit ints — but because canvas may exceed
      // 16-bit, store linear offset in two halves
      const flatOffsets = new Uint32Array(masked.length);
      for (let i = 0; i < masked.length; i++) flatOffsets[i] = masked[i];
      // We'll just use Uint32Array; rename the storage:
      maskOffsets = flatOffsets;

      baseLon = new Float32Array(lons);
      texY = new Uint16Array(ys);
      shade = new Float32Array(intensities);
      imageData = ctx.createImageData(w, h);
    }
    let maskOffsets = new Uint32Array(0);

    function resize() {
      if (!container) return;
      // Cap pixel density to keep this affordable on phones
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const W = Math.round(container.clientWidth * dpr);
      const H = Math.round(container.clientHeight * dpr);
      if (W === lastW && H === lastH) return;
      lastW = W;
      lastH = H;
      canvas.width = W;
      canvas.height = H;
      setupSphereMask();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ---- Animation loop ----
    let rotation = 0;
    const secondsPerRotation = 80; // slow & cinematic
    let last = performance.now();

    const tex32 = new Uint32Array(tex.buffer);

    function frame(now: number) {
      if (cancelled) return;
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;
      rotation += (Math.PI * 2 * dt) / secondsPerRotation;

      // Re-render
      const out = imageData.data;
      const out32 = new Uint32Array(out.buffer);
      // Clear to transparent
      out32.fill(0);

      const W = canvas.width;
      const N = maskOffsets.length;
      const TWO_PI = Math.PI * 2;
      for (let i = 0; i < N; i++) {
        const off = maskOffsets[i];
        // Compute texture u (longitude wrapped)
        let lon = baseLon[i] + rotation;
        // Wrap into [0, 2π)
        lon = lon - Math.floor(lon / TWO_PI) * TWO_PI;
        const u = (lon / TWO_PI) * (TEX_W - 1);
        const xIdx = u | 0;
        const yIdx = texY[i];
        const texIdx = yIdx * TEX_W + xIdx;
        const px = tex32[texIdx];
        const r = px & 0xff;
        const g = (px >>> 8) & 0xff;
        const b = (px >>> 16) & 0xff;
        const sh = shade[i];
        const rr = (r * sh) | 0;
        const gg = (g * sh) | 0;
        const bb = (b * sh) | 0;
        // Premultiplied alpha for crisp edge
        out32[off] = (255 << 24) | (bb << 16) | (gg << 8) | rr;
      }

      ctx.putImageData(imageData, 0, 0);

      // Atmospheric rim — additive radial gradient outside the sphere
      const rimR = renderRadius;
      const grad = ctx.createRadialGradient(cx, cy, rimR * 0.96, cx, cy, rimR * 1.16);
      grad.addColorStop(0, "rgba(110,180,255,0.0)");
      grad.addColorStop(0.18, "rgba(110,180,255,0.18)");
      grad.addColorStop(0.55, "rgba(80,150,240,0.10)");
      grad.addColorStop(1, "rgba(80,140,240,0.0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // A second, tighter rim right against the limb for that bright halo
      const rim2 = ctx.createRadialGradient(cx, cy, rimR * 0.992, cx, cy, rimR * 1.04);
      rim2.addColorStop(0, "rgba(150,210,255,0.0)");
      rim2.addColorStop(0.5, "rgba(160,220,255,0.32)");
      rim2.addColorStop(1, "rgba(160,220,255,0.0)");
      ctx.fillStyle = rim2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden
      style={{ contain: "strict", transform: "translateZ(0)" }}
    />
  );
}

// ============================================================================
// Texture builder — equirectangular Earth, procedural value noise. ~6ms once.
// ============================================================================

/** Returns a Uint8ClampedArray of RGBA bytes, length W*H*4. */
function buildEarthTexture(W: number, H: number): Uint8ClampedArray {
  const px = new Uint8ClampedArray(W * H * 4);
  const noise = makeValueNoise(64, 32, 0xfa1c5a17);
  const noise2 = makeValueNoise(180, 90, 0x2cf99021);

  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);
    const polePinch = Math.sin(Math.PI * v); // 0 at poles, 1 at equator
    const absLat = Math.abs(v - 0.5) * 2;    // 0 equator → 1 pole
    const tundraMix = Math.max(0, absLat - 0.62) / 0.38;
    const desertBand =
      (absLat > 0.16 && absLat < 0.32) || (absLat > 0.36 && absLat < 0.42);

    // Vertical gradient ocean colour (deeper at equator, paler at sub-tropics)
    const oR = lerp(10, 19, polePinch);
    const oG = lerp(29, 54, polePinch);
    const oB = lerp(58, 110, polePinch);

    for (let x = 0; x < W; x++) {
      const u = x / (W - 1);
      const n1 = noise(u * 6.0, v * 3.0);
      const n2 = noise2(u * 16.0 + 0.3, v * 8.0 + 0.7);
      const noiseSum = n1 * 0.7 + n2 * 0.3;
      const isLand = noiseSum * Math.pow(polePinch, 0.55) > 0.18;
      const i = (y * W + x) * 4;

      let r: number, g: number, b: number;
      if (isLand) {
        const elevation = (n2 + 1) * 0.5;
        if (tundraMix > 0.5) {
          r = 220 - elevation * 40;
          g = 222 - elevation * 30;
          b = 230 - elevation * 10;
        } else if (desertBand && noiseSum > 0.25) {
          r = 188 - elevation * 28;
          g = 156 - elevation * 30;
          b = 110 - elevation * 30;
        } else {
          r = 56 + elevation * 32;
          g = 92 + elevation * 60;
          b = 56 + elevation * 28;
        }
        if (elevation > 0.78) {
          const t = (elevation - 0.78) / 0.22;
          r = lerp(r, 110, t);
          g = lerp(g, 95, t);
          b = lerp(b, 80, t);
        }
      } else {
        // Vary ocean depth using noise so it's not flat
        const deep = (n2 + 1) * 0.5;
        const t = deep * 0.32;
        r = lerp(oR, 38, t);
        g = lerp(oG, 102, t);
        b = lerp(oB, 168, t);
      }

      // Polar caps wash
      const distFromPole = Math.min(v, 1 - v);
      if (distFromPole < 0.13) {
        const a = (0.13 - distFromPole) / 0.13;
        r = lerp(r, 245, a * 0.85);
        g = lerp(g, 248, a * 0.85);
        b = lerp(b, 252, a * 0.85);
      }

      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = 255;
    }
  }

  // Cloud layer — additive
  const cloud = makeValueNoise(120, 40, 0x55a1cf00);
  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);
    const lat = Math.sin(Math.PI * v);
    for (let x = 0; x < W; x++) {
      const u = x / (W - 1);
      const c1 = cloud(u * 18, v * 4 + 0.2);
      const c2 = cloud(u * 7 + 0.5, v * 10);
      const m = Math.max(0, c1 * 0.6 + c2 * 0.4 - 0.45) * lat;
      if (m > 0) {
        const i = (y * W + x) * 4;
        const blend = Math.min(1, m * 0.85);
        px[i]     = lerp(px[i],     255, blend);
        px[i + 1] = lerp(px[i + 1], 255, blend);
        px[i + 2] = lerp(px[i + 2], 255, blend);
      }
    }
  }

  return px;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makeValueNoise(cols: number, rows: number, seed: number) {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const grid = new Float32Array((rows + 1) * (cols + 1));
  for (let i = 0; i < grid.length; i++) grid[i] = rnd() * 2 - 1;
  return (x: number, y: number) => {
    const fx = ((x % 1) + 1) % 1;
    const fy = Math.max(0, Math.min(0.9999, ((y % 1) + 1) % 1));
    const gx = fx * cols;
    const gy = fy * rows;
    const x0 = Math.floor(gx) % cols;
    const y0 = Math.floor(gy);
    const x1 = (x0 + 1) % cols;
    const y1 = Math.min(rows, y0 + 1);
    const tx = gx - Math.floor(gx);
    const ty = gy - Math.floor(gy);
    const a = grid[y0 * (cols + 1) + x0];
    const b = grid[y0 * (cols + 1) + x1];
    const c = grid[y1 * (cols + 1) + x0];
    const d = grid[y1 * (cols + 1) + x1];
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    return lerp(lerp(a, b, sx), lerp(c, d, sx), sy);
  };
}

function normalize3(x: number, y: number, z: number) {
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  return { x: x / len, y: y / len, z: z / len };
}
