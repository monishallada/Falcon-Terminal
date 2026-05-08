import { Bar } from "./types";

export function sma(bars: Bar[], period: number) {
  const out: { time: number; value: number }[] = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close;
    if (i >= period) sum -= bars[i - period].close;
    if (i >= period - 1) out.push({ time: bars[i].time, value: sum / period });
  }
  return out;
}

export function ema(bars: Bar[], period: number) {
  const out: { time: number; value: number }[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < bars.length; i++) {
    const c = bars[i].close;
    if (prev == null) {
      // seed with sma
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

export function rsi(bars: Bar[], period = 14) {
  const out: { time: number; value: number }[] = [];
  let gain = 0, loss = 0;
  for (let i = 1; i < bars.length; i++) {
    const diff = bars[i].close - bars[i - 1].close;
    if (i <= period) {
      if (diff > 0) gain += diff;
      else loss += -diff;
      if (i === period) {
        gain /= period;
        loss /= period;
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
  const upper: { time: number; value: number }[] = [];
  const lower: { time: number; value: number }[] = [];
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
  // align e1 to e2
  const map1 = new Map(e1.map((p) => [p.time, p.value]));
  const macdLine = e2
    .map((p) => ({ time: p.time, value: (map1.get(p.time) ?? 0) - p.value }))
    .filter((p) => map1.has(p.time));

  // signal — ema of macdLine
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

export function vwap(bars: Bar[]) {
  const out: { time: number; value: number }[] = [];
  let pv = 0;
  let v = 0;
  for (const b of bars) {
    const tp = (b.high + b.low + b.close) / 3;
    pv += tp * b.volume;
    v += b.volume;
    if (v > 0) out.push({ time: b.time, value: pv / v });
  }
  return out;
}

export function atr(bars: Bar[], period = 14) {
  const out: { time: number; value: number }[] = [];
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
