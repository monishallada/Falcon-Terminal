import { Bar } from "./types";

type Point = { time: number; value: number };

export function sma(bars: Bar[], period: number): Point[] {
  const out: Point[] = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close;
    if (i >= period) sum -= bars[i - period].close;
    if (i >= period - 1) out.push({ time: bars[i].time, value: sum / period });
  }
  return out;
}

export function ema(bars: Bar[], period: number): Point[] {
  const out: Point[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < bars.length; i++) {
    const c = bars[i].close;
    if (prev == null) {
      if (i >= period - 1) {
        let s = 0;
        for (let j = i - period + 1; j <= i; j++) s += bars[j].close;
        prev = s / period;
        out.push({ time: bars[i].time, value: prev });
      }
    } else {
      prev = c * k + prev * (1 - k);
      out.push({ time: bars[i].time, value: prev });
    }
  }
  return out;
}

function emaOfArray(values: number[], period: number): number[] {
  const out: number[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    if (prev == null) {
      if (i >= period - 1) {
        let s = 0;
        for (let j = i - period + 1; j <= i; j++) s += values[j];
        prev = s / period;
        out.push(prev);
      } else {
        out.push(NaN);
      }
    } else {
      prev = values[i] * k + prev * (1 - k);
      out.push(prev);
    }
  }
  return out;
}

export function rsi(bars: Bar[], period = 14): Point[] {
  const out: Point[] = [];
  let gain = 0, loss = 0;
  for (let i = 1; i < bars.length; i++) {
    const diff = bars[i].close - bars[i - 1].close;
    if (i <= period) {
      if (diff > 0) gain += diff; else loss += -diff;
      if (i === period) {
        gain /= period; loss /= period;
        const rs = loss === 0 ? 100 : gain / loss;
        out.push({ time: bars[i].time, value: 100 - 100 / (1 + rs) });
      }
    } else {
      gain = (gain * (period - 1) + (diff > 0 ? diff : 0)) / period;
      loss = (loss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
      const rs = loss === 0 ? 100 : gain / loss;
      out.push({ time: bars[i].time, value: 100 - 100 / (1 + rs) });
    }
  }
  return out;
}

export function bollinger(bars: Bar[], period = 20, stddev = 2) {
  const upper: Point[] = [];
  const lower: Point[] = [];
  const middle = sma(bars, period);
  for (let i = 0; i < middle.length; i++) {
    const idx = i + period - 1;
    let s = 0;
    for (let j = idx - period + 1; j <= idx; j++) {
      const d = bars[j].close - middle[i].value;
      s += d * d;
    }
    const sd = Math.sqrt(s / period);
    upper.push({ time: middle[i].time, value: middle[i].value + stddev * sd });
    lower.push({ time: middle[i].time, value: middle[i].value - stddev * sd });
  }
  return { upper, middle, lower };
}

export function macd(bars: Bar[], fast = 12, slow = 26, signal = 9) {
  const e1 = ema(bars, fast);
  const e2 = ema(bars, slow);
  const map1 = new Map(e1.map((p) => [p.time, p.value]));
  const macdLine = e2
    .map((p) => ({ time: p.time, value: (map1.get(p.time) ?? 0) - p.value }))
    .filter((p) => map1.has(p.time));

  const out: { time: number; macd: number; signal: number; hist: number }[] = [];
  const k = 2 / (signal + 1);
  let prev: number | null = null;
  for (let i = 0; i < macdLine.length; i++) {
    const m = macdLine[i].value;
    if (prev == null) {
      if (i >= signal - 1) {
        let s = 0;
        for (let j = i - signal + 1; j <= i; j++) s += macdLine[j].value;
        prev = s / signal;
        out.push({ time: macdLine[i].time, macd: m, signal: prev, hist: m - prev });
      }
    } else {
      prev = m * k + prev * (1 - k);
      out.push({ time: macdLine[i].time, macd: m, signal: prev, hist: m - prev });
    }
  }
  return out;
}

export function vwap(bars: Bar[]): Point[] {
  const out: Point[] = [];
  let pv = 0, v = 0;
  for (const b of bars) {
    const tp = (b.high + b.low + b.close) / 3;
    pv += tp * b.volume;
    v += b.volume;
    if (v > 0) out.push({ time: b.time, value: pv / v });
  }
  return out;
}

export function atr(bars: Bar[], period = 14): Point[] {
  const out: Point[] = [];
  let prevClose = bars[0]?.close ?? 0;
  let trSum = 0;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const tr = Math.max(b.high - b.low, Math.abs(b.high - prevClose), Math.abs(b.low - prevClose));
    if (i < period) {
      trSum += tr;
      if (i === period - 1) out.push({ time: b.time, value: trSum / period });
    } else {
      const last = out[out.length - 1].value;
      const next = (last * (period - 1) + tr) / period;
      out.push({ time: b.time, value: next });
    }
    prevClose = b.close;
  }
  return out;
}

export function stochastic(bars: Bar[], period = 14, smoothK = 3, smoothD = 3) {
  const k: Point[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let hh = -Infinity, ll = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      if (bars[j].high > hh) hh = bars[j].high;
      if (bars[j].low < ll) ll = bars[j].low;
    }
    const range = hh - ll;
    k.push({ time: bars[i].time, value: range === 0 ? 50 : ((bars[i].close - ll) / range) * 100 });
  }
  const kSmoothed = smoothLine(k, smoothK);
  const d = smoothLine(kSmoothed, smoothD);
  return { k: kSmoothed, d };
}

function smoothLine(line: Point[], period: number): Point[] {
  const out: Point[] = [];
  let sum = 0;
  for (let i = 0; i < line.length; i++) {
    sum += line[i].value;
    if (i >= period) sum -= line[i - period].value;
    if (i >= period - 1) out.push({ time: line[i].time, value: sum / period });
  }
  return out;
}

export function adx(bars: Bar[], period = 14): Point[] {
  if (bars.length < period * 2) return [];
  const tr: number[] = [], pdm: number[] = [], ndm: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const up = bars[i].high - bars[i - 1].high;
    const down = bars[i - 1].low - bars[i].low;
    pdm.push(up > down && up > 0 ? up : 0);
    ndm.push(down > up && down > 0 ? down : 0);
    tr.push(Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close)
    ));
  }
  const smooth = (arr: number[]): number[] => {
    const out: number[] = [];
    let s = 0;
    for (let i = 0; i < period && i < arr.length; i++) s += arr[i];
    out.push(s);
    for (let i = period; i < arr.length; i++) {
      s = s - s / period + arr[i];
      out.push(s);
    }
    return out;
  };
  const sTr = smooth(tr), sPdm = smooth(pdm), sNdm = smooth(ndm);
  const dx: number[] = [];
  for (let i = 0; i < sTr.length; i++) {
    const pdi = (sPdm[i] / sTr[i]) * 100;
    const ndi = (sNdm[i] / sTr[i]) * 100;
    const sum = pdi + ndi;
    dx.push(sum === 0 ? 0 : (Math.abs(pdi - ndi) / sum) * 100);
  }
  const out: Point[] = [];
  let dxSum = 0;
  for (let i = 0; i < period && i < dx.length; i++) dxSum += dx[i];
  if (dx.length >= period) {
    out.push({ time: bars[period * 2 - 1]?.time ?? bars[bars.length - 1].time, value: dxSum / period });
    for (let i = period; i < dx.length; i++) {
      const prev = out[out.length - 1].value;
      out.push({ time: bars[i + period]?.time ?? bars[bars.length - 1].time, value: (prev * (period - 1) + dx[i]) / period });
    }
  }
  return out;
}

export function obv(bars: Bar[]): Point[] {
  const out: Point[] = [];
  let v = 0;
  for (let i = 1; i < bars.length; i++) {
    if (bars[i].close > bars[i - 1].close) v += bars[i].volume;
    else if (bars[i].close < bars[i - 1].close) v -= bars[i].volume;
    out.push({ time: bars[i].time, value: v });
  }
  return out;
}

export function williamsR(bars: Bar[], period = 14): Point[] {
  const out: Point[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let hh = -Infinity, ll = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      if (bars[j].high > hh) hh = bars[j].high;
      if (bars[j].low < ll) ll = bars[j].low;
    }
    const range = hh - ll;
    out.push({ time: bars[i].time, value: range === 0 ? -50 : ((hh - bars[i].close) / range) * -100 });
  }
  return out;
}

export function donchian(bars: Bar[], period = 20) {
  const upper: Point[] = [], lower: Point[] = [], middle: Point[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let hh = -Infinity, ll = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      if (bars[j].high > hh) hh = bars[j].high;
      if (bars[j].low < ll) ll = bars[j].low;
    }
    upper.push({ time: bars[i].time, value: hh });
    lower.push({ time: bars[i].time, value: ll });
    middle.push({ time: bars[i].time, value: (hh + ll) / 2 });
  }
  return { upper, lower, middle };
}

export function keltner(bars: Bar[], period = 20, mult = 2) {
  const mid = ema(bars, period);
  const a = atr(bars, period);
  const aMap = new Map(a.map((p) => [p.time, p.value]));
  const upper: Point[] = [], lower: Point[] = [];
  for (const p of mid) {
    const av = aMap.get(p.time);
    if (av != null) {
      upper.push({ time: p.time, value: p.value + mult * av });
      lower.push({ time: p.time, value: p.value - mult * av });
    }
  }
  return { upper, middle: mid, lower };
}

export function supertrend(bars: Bar[], period = 10, mult = 3): Point[] {
  const a = atr(bars, period);
  const aMap = new Map(a.map((p) => [p.time, p.value]));
  const out: Point[] = [];
  let trendUp = true;
  let prevSt = bars[0]?.close ?? 0;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const av = aMap.get(b.time);
    if (av == null) continue;
    const hl2 = (b.high + b.low) / 2;
    const upperBand = hl2 + mult * av;
    const lowerBand = hl2 - mult * av;
    if (i === 0) {
      prevSt = lowerBand;
      out.push({ time: b.time, value: lowerBand });
      continue;
    }
    if (trendUp) {
      const st = Math.max(lowerBand, prevSt);
      if (b.close < st) { trendUp = false; out.push({ time: b.time, value: upperBand }); prevSt = upperBand; }
      else { out.push({ time: b.time, value: st }); prevSt = st; }
    } else {
      const st = Math.min(upperBand, prevSt);
      if (b.close > st) { trendUp = true; out.push({ time: b.time, value: lowerBand }); prevSt = lowerBand; }
      else { out.push({ time: b.time, value: st }); prevSt = st; }
    }
  }
  return out;
}

export function ichimoku(bars: Bar[]) {
  const conv: Point[] = [], base: Point[] = [], spanA: Point[] = [], spanB: Point[] = [];
  const hl = (lookback: number, i: number) => {
    let hh = -Infinity, ll = Infinity;
    for (let j = Math.max(0, i - lookback + 1); j <= i; j++) {
      if (bars[j].high > hh) hh = bars[j].high;
      if (bars[j].low < ll) ll = bars[j].low;
    }
    return (hh + ll) / 2;
  };
  for (let i = 0; i < bars.length; i++) {
    if (i >= 8) conv.push({ time: bars[i].time, value: hl(9, i) });
    if (i >= 25) base.push({ time: bars[i].time, value: hl(26, i) });
    if (i >= 25) spanA.push({ time: bars[i].time, value: (hl(9, i) + hl(26, i)) / 2 });
    if (i >= 51) spanB.push({ time: bars[i].time, value: hl(52, i) });
  }
  return { conv, base, spanA, spanB };
}

// ---------- Heikin-Ashi candle transform ----------
export function heikinAshi(bars: Bar[]): Bar[] {
  if (bars.length === 0) return [];
  const out: Bar[] = [];
  let prevHa: Bar | null = null;
  for (const b of bars) {
    const haClose = (b.open + b.high + b.low + b.close) / 4;
    const haOpen = prevHa == null
      ? (b.open + b.close) / 2
      : (prevHa.open + prevHa.close) / 2;
    const haHigh = Math.max(b.high, haOpen, haClose);
    const haLow = Math.min(b.low, haOpen, haClose);
    const ha: Bar = { time: b.time, open: haOpen, high: haHigh, low: haLow, close: haClose, volume: b.volume };
    out.push(ha);
    prevHa = ha;
  }
  return out;
}

// ----------------------------------------------------------------------------
// AI Signal — composite quantitative score derived from multiple indicators.
// This is the math layer behind the "AI Signals" widget and the AI Mode chart
// annotations. In production we'd hand the same feature vector to a small
// classifier; here it's a transparent, explainable scoring rubric so the
// reasoning bullets in the UI map 1:1 to what's actually driving the score.
// ----------------------------------------------------------------------------

export interface SignalReason {
  label: string;
  detail: string;
  // -1 .. +1 contribution to overall score
  score: number;
}

export interface AISignalResult {
  // 0..100, higher = more bullish
  score: number;
  regime: "trend_up" | "trend_down" | "range" | "expanding_vol";
  // Buy / Hold / Sell with confidence pct
  action: "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL";
  confidence: number;
  reasons: SignalReason[];
  features: {
    rsi: number;
    macdHist: number;
    adx: number;
    emaTrend: number; // (ema20 - ema50) / ema50
    bbPctB: number;   // %B
    atrPct: number;   // ATR / price
    volumeZ: number;  // last vol vs 20-bar avg, in std devs
    superTrendUp: boolean;
    obvSlope: number;
  };
  // suggested SL / TP based on ATR
  suggestion: {
    entry: number;
    stop: number;
    target: number;
    rr: number;
  };
}

export function aiSignal(bars: Bar[]): AISignalResult | null {
  if (bars.length < 80) return null;
  const last = bars[bars.length - 1];
  const price = last.close;

  const rsiSeries = rsi(bars, 14);
  const macdSeries = macd(bars);
  const adxSeries = adx(bars, 14);
  const ema20 = ema(bars, 20);
  const ema50 = ema(bars, 50);
  const bb = bollinger(bars, 20, 2);
  const atrSeries = atr(bars, 14);
  const st = supertrend(bars, 10, 3);
  const obvSeries = obv(bars);

  const lastN = <T,>(arr: T[]) => arr[arr.length - 1];
  const rsiV = lastN(rsiSeries)?.value ?? 50;
  const macdHistV = lastN(macdSeries)?.hist ?? 0;
  const adxV = lastN(adxSeries)?.value ?? 0;
  const e20 = lastN(ema20)?.value ?? price;
  const e50 = lastN(ema50)?.value ?? price;
  const bbU = lastN(bb.upper)?.value ?? price;
  const bbL = lastN(bb.lower)?.value ?? price;
  const atrV = lastN(atrSeries)?.value ?? price * 0.01;
  const stV = lastN(st)?.value ?? price;
  const obvNow = lastN(obvSeries)?.value ?? 0;
  const obvAgo = obvSeries[Math.max(0, obvSeries.length - 20)]?.value ?? obvNow;

  // Volume Z-score vs 20-bar avg
  const recentVol = bars.slice(-20).map((b) => b.volume);
  const volAvg = recentVol.reduce((a, b) => a + b, 0) / recentVol.length;
  const volSd = Math.sqrt(recentVol.reduce((a, b) => a + (b - volAvg) ** 2, 0) / recentVol.length) || 1;
  const volumeZ = (last.volume - volAvg) / volSd;

  const emaTrend = (e20 - e50) / e50;
  const bbPctB = bbU === bbL ? 0.5 : (price - bbL) / (bbU - bbL);
  const atrPct = atrV / price;
  const superTrendUp = price > stV;
  const obvSlope = (obvNow - obvAgo) / (Math.abs(obvAgo) || 1);

  // ----- Scoring rubric -----
  const reasons: SignalReason[] = [];

  // Trend: EMA20 vs EMA50
  if (emaTrend > 0.003) {
    reasons.push({
      label: "Uptrend confirmed",
      detail: `EMA20 above EMA50 by ${(emaTrend * 100).toFixed(2)}% — the medium-term trend is up.`,
      score: Math.min(1, emaTrend * 40)
    });
  } else if (emaTrend < -0.003) {
    reasons.push({
      label: "Downtrend confirmed",
      detail: `EMA20 below EMA50 by ${Math.abs(emaTrend * 100).toFixed(2)}% — medium-term trend is down.`,
      score: Math.max(-1, emaTrend * 40)
    });
  } else {
    reasons.push({
      label: "Trendless tape",
      detail: "EMA20 and EMA50 are converged; the medium-term trend is flat.",
      score: 0
    });
  }

  // Momentum: RSI
  if (rsiV >= 70) {
    reasons.push({ label: "Overbought (RSI)", detail: `RSI(14) at ${rsiV.toFixed(1)} — stretched to the upside.`, score: -0.3 });
  } else if (rsiV <= 30) {
    reasons.push({ label: "Oversold (RSI)", detail: `RSI(14) at ${rsiV.toFixed(1)} — stretched to the downside, often a setup for reversion.`, score: 0.3 });
  } else if (rsiV >= 55) {
    reasons.push({ label: "Momentum positive", detail: `RSI(14) at ${rsiV.toFixed(1)} — buyers in control without being stretched.`, score: 0.4 });
  } else if (rsiV <= 45) {
    reasons.push({ label: "Momentum negative", detail: `RSI(14) at ${rsiV.toFixed(1)} — sellers in control without being washed out.`, score: -0.4 });
  } else {
    reasons.push({ label: "Momentum neutral", detail: `RSI(14) at ${rsiV.toFixed(1)} — sitting in the middle of its range.`, score: 0 });
  }

  // MACD histogram direction
  if (macdHistV > 0) {
    reasons.push({ label: "MACD positive", detail: `Histogram at ${macdHistV.toFixed(3)} — short EMA accelerating above long EMA.`, score: Math.min(0.4, macdHistV * 2) });
  } else if (macdHistV < 0) {
    reasons.push({ label: "MACD negative", detail: `Histogram at ${macdHistV.toFixed(3)} — short EMA decelerating below long EMA.`, score: Math.max(-0.4, macdHistV * 2) });
  }

  // ADX strength
  if (adxV >= 25) {
    reasons.push({ label: "Strong trend (ADX)", detail: `ADX at ${adxV.toFixed(1)} — directional pressure is real, not noise.`, score: emaTrend > 0 ? 0.3 : -0.3 });
  } else if (adxV < 18) {
    reasons.push({ label: "Choppy regime", detail: `ADX at ${adxV.toFixed(1)} — no strong directional pressure; mean-reversion plays > trend plays.`, score: 0 });
  }

  // Volume confirmation
  if (volumeZ > 1.5) {
    reasons.push({ label: "Volume spike", detail: `Latest bar volume is ${volumeZ.toFixed(1)}σ above 20-bar average — institutional participation.`, score: emaTrend >= 0 ? 0.3 : -0.3 });
  } else if (volumeZ < -1) {
    reasons.push({ label: "Volume drying up", detail: `Volume is ${Math.abs(volumeZ).toFixed(1)}σ below average — conviction is thin in either direction.`, score: 0 });
  }

  // OBV slope (cumulative volume flow)
  if (obvSlope > 0.05) {
    reasons.push({ label: "Accumulation (OBV)", detail: `On-balance volume rising — net buying pressure over the last 20 bars.`, score: 0.25 });
  } else if (obvSlope < -0.05) {
    reasons.push({ label: "Distribution (OBV)", detail: `On-balance volume falling — net selling pressure over the last 20 bars.`, score: -0.25 });
  }

  // Bollinger %B — mean reversion edge case
  if (bbPctB > 1) {
    reasons.push({ label: "Above upper Bollinger", detail: "Price extended above the 2σ band — favors mean-reversion shorts over trend longs near-term.", score: -0.2 });
  } else if (bbPctB < 0) {
    reasons.push({ label: "Below lower Bollinger", detail: "Price extended below the 2σ band — favors mean-reversion longs.", score: 0.2 });
  }

  // SuperTrend
  if (superTrendUp) {
    reasons.push({ label: "SuperTrend long", detail: `Price holding above SuperTrend ($${stV.toFixed(2)}) — trailing-stop bias is bullish.`, score: 0.2 });
  } else {
    reasons.push({ label: "SuperTrend short", detail: `Price below SuperTrend ($${stV.toFixed(2)}) — trailing-stop bias is bearish.`, score: -0.2 });
  }

  // Composite
  const sum = reasons.reduce((a, r) => a + r.score, 0);
  const normalized = Math.max(-1, Math.min(1, sum / 2.5));
  const score = Math.round(50 + normalized * 50);

  let action: AISignalResult["action"];
  if (score >= 75) action = "STRONG BUY";
  else if (score >= 60) action = "BUY";
  else if (score <= 25) action = "STRONG SELL";
  else if (score <= 40) action = "SELL";
  else action = "HOLD";

  // Confidence: scaled by ADX (strong regime = higher confidence) + how lopsided reasons are
  const lopsided = Math.abs(normalized);
  const confidence = Math.round(Math.min(95, 35 + lopsided * 40 + Math.min(adxV, 40) * 0.5));

  // Regime classification
  let regime: AISignalResult["regime"];
  if (adxV >= 25 && emaTrend > 0.003) regime = "trend_up";
  else if (adxV >= 25 && emaTrend < -0.003) regime = "trend_down";
  else if (atrPct > 0.02) regime = "expanding_vol";
  else regime = "range";

  // Trade suggestion (ATR-based)
  const longBias = score >= 50;
  const stop = longBias ? price - 1.5 * atrV : price + 1.5 * atrV;
  const target = longBias ? price + 3 * atrV : price - 3 * atrV;
  const rr = Math.abs((target - price) / (price - stop));

  return {
    score,
    regime,
    action,
    confidence,
    reasons,
    features: {
      rsi: rsiV,
      macdHist: macdHistV,
      adx: adxV,
      emaTrend,
      bbPctB,
      atrPct,
      volumeZ,
      superTrendUp,
      obvSlope
    },
    suggestion: { entry: price, stop, target, rr }
  };
}

// ----------------------------------------------------------------------------
// AI-detected support / resistance — a lightweight pivot-based detector that
// the chart overlay calls to draw horizontal levels. Looks for local highs /
// lows that have been retested.
// ----------------------------------------------------------------------------
export function aiLevels(bars: Bar[], lookback = 5): { kind: "support" | "resistance"; price: number; touches: number }[] {
  if (bars.length < lookback * 4) return [];
  const pivots: { idx: number; price: number; kind: "high" | "low" }[] = [];
  for (let i = lookback; i < bars.length - lookback; i++) {
    let isHigh = true, isLow = true;
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j === i) continue;
      if (bars[j].high >= bars[i].high) isHigh = false;
      if (bars[j].low <= bars[i].low) isLow = false;
    }
    if (isHigh) pivots.push({ idx: i, price: bars[i].high, kind: "high" });
    if (isLow) pivots.push({ idx: i, price: bars[i].low, kind: "low" });
  }
  if (pivots.length === 0) return [];

  // Cluster pivots within 0.5% of each other
  const lastPrice = bars[bars.length - 1].close;
  const tol = lastPrice * 0.005;
  const clusters: { kind: "high" | "low"; price: number; touches: number }[] = [];
  for (const p of pivots) {
    const hit = clusters.find((c) => c.kind === p.kind && Math.abs(c.price - p.price) < tol);
    if (hit) {
      hit.price = (hit.price * hit.touches + p.price) / (hit.touches + 1);
      hit.touches += 1;
    } else {
      clusters.push({ kind: p.kind, price: p.price, touches: 1 });
    }
  }

  return clusters
    .filter((c) => c.touches >= 2)
    .sort((a, b) => b.touches - a.touches)
    .slice(0, 4)
    .map((c) => ({
      kind: c.kind === "high" ? "resistance" : "support",
      price: c.price,
      touches: c.touches
    }));
}
