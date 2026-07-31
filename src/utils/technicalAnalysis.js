// Technical Analysis indicator calculation engine for XAU/USD

export function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const emaValues = new Array(data.length).fill(null);
  
  if (data.length < period) return emaValues;

  // Initial SMA for first EMA point
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let prevEMA = sum / period;
  emaValues[period - 1] = parseFloat(prevEMA.toFixed(2));

  for (let i = period; i < data.length; i++) {
    const currentEMA = (data[i].close * k) + (prevEMA * (1 - k));
    emaValues[i] = parseFloat(currentEMA.toFixed(2));
    prevEMA = currentEMA;
  }

  return emaValues;
}

export function calculateSMA(data, period) {
  const smaValues = new Array(data.length).fill(null);
  if (data.length < period) return smaValues;

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    smaValues[i] = parseFloat((sum / period).toFixed(2));
  }
  return smaValues;
}

export function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const bands = new Array(data.length).fill(null);
  const sma = calculateSMA(data, period);

  for (let i = period - 1; i < data.length; i++) {
    const mean = sma[i];
    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(data[j].close - mean, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);
    bands[i] = {
      middle: mean,
      upper: parseFloat((mean + multiplier * stdDev).toFixed(2)),
      lower: parseFloat((mean - multiplier * stdDev).toFixed(2))
    };
  }

  return bands;
}

export function calculateRSI(data, period = 14) {
  const rsiValues = new Array(data.length).fill(null);
  if (data.length <= period) return rsiValues;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiValues[period] = parseFloat((100 - (100 / (1 + rs))).toFixed(2));

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiValues[i] = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
  }

  return rsiValues;
}

export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);
  
  const macdLine = new Array(data.length).fill(null);
  for (let i = 0; i < data.length; i++) {
    if (emaFast[i] !== null && emaSlow[i] !== null) {
      macdLine[i] = parseFloat((emaFast[i] - emaSlow[i]).toFixed(2));
    }
  }

  // Calculate Signal Line (EMA of MACD line)
  const validMacdObjects = [];
  macdLine.forEach((val, idx) => {
    if (val !== null) validMacdObjects.push({ close: val, index: idx });
  });

  const signalLine = new Array(data.length).fill(null);
  const histogram = new Array(data.length).fill(null);

  if (validMacdObjects.length >= signalPeriod) {
    const signalEma = calculateEMA(validMacdObjects, signalPeriod);
    signalEma.forEach((val, idx) => {
      if (val !== null) {
        const originalIndex = validMacdObjects[idx].index;
        signalLine[originalIndex] = val;
        histogram[originalIndex] = parseFloat((macdLine[originalIndex] - val).toFixed(2));
      }
    });
  }

  return { macdLine, signalLine, histogram };
}

export function calculateFibonacci(high, low) {
  const diff = high - low;
  return {
    level0: low,
    level236: parseFloat((low + diff * 0.236).toFixed(2)),
    level382: parseFloat((low + diff * 0.382).toFixed(2)),
    level500: parseFloat((low + diff * 0.500).toFixed(2)),
    level618: parseFloat((low + diff * 0.618).toFixed(2)),
    level786: parseFloat((low + diff * 0.786).toFixed(2)),
    level100: high,
    ext1272: parseFloat((low + diff * 1.272).toFixed(2)),
    ext1618: parseFloat((low + diff * 1.618).toFixed(2))
  };
}

export function findSupportResistance(data) {
  if (!data || data.length < 20) return { supports: [], resistances: [] };

  const highs = [];
  const lows = [];

  for (let i = 2; i < data.length - 2; i++) {
    if (data[i].high > data[i-1].high && data[i].high > data[i-2].high &&
        data[i].high > data[i+1].high && data[i].high > data[i+2].high) {
      highs.push(data[i].high);
    }
    if (data[i].low < data[i-1].low && data[i].low < data[i-2].low &&
        data[i].low < data[i+1].low && data[i].low < data[i+2].low) {
      lows.push(data[i].low);
    }
  }

  // Group nearby levels
  const cluster = (arr, threshold = 12) => {
    const clusters = [];
    arr.forEach(val => {
      let found = false;
      for (let c of clusters) {
        if (Math.abs(c.avg - val) <= threshold) {
          c.items.push(val);
          c.avg = c.items.reduce((a, b) => a + b, 0) / c.items.length;
          found = true;
          break;
        }
      }
      if (!found) clusters.push({ avg: val, items: [val] });
    });
    return clusters.sort((a, b) => b.items.length - a.items.length).slice(0, 3).map(c => parseFloat(c.avg.toFixed(2)));
  };

  return {
    resistances: cluster(highs).sort((a, b) => b - a),
    supports: cluster(lows).sort((a, b) => a - b)
  };
}

export function calculatePivotPoints(high, low, close) {
  const p = (high + low + close) / 3;

  // Standard
  const stdR1 = (2 * p) - low;
  const stdS1 = (2 * p) - high;
  const stdR2 = p + (high - low);
  const stdS2 = p - (high - low);
  const stdR3 = high + 2 * (p - low);
  const stdS3 = low - 2 * (high - p);

  // Fibonacci
  const range = high - low;
  const fibR1 = p + (range * 0.382);
  const fibS1 = p - (range * 0.382);
  const fibR2 = p + (range * 0.618);
  const fibS2 = p - (range * 0.618);
  const fibR3 = p + range;
  const fibS3 = p - range;

  // Camarilla
  const camR1 = close + (range * 1.1 / 12);
  const camS1 = close - (range * 1.1 / 12);
  const camR2 = close + (range * 1.1 / 6);
  const camS2 = close - (range * 1.1 / 6);
  const camR3 = close + (range * 1.1 / 4);
  const camS3 = close - (range * 1.1 / 4);

  return {
    standard: { p: parseFloat(p.toFixed(2)), r1: parseFloat(stdR1.toFixed(2)), r2: parseFloat(stdR2.toFixed(2)), r3: parseFloat(stdR3.toFixed(2)), s1: parseFloat(stdS1.toFixed(2)), s2: parseFloat(stdS2.toFixed(2)), s3: parseFloat(stdS3.toFixed(2)) },
    fibonacci: { p: parseFloat(p.toFixed(2)), r1: parseFloat(fibR1.toFixed(2)), r2: parseFloat(fibR2.toFixed(2)), r3: parseFloat(fibR3.toFixed(2)), s1: parseFloat(fibS1.toFixed(2)), s2: parseFloat(fibS2.toFixed(2)), s3: parseFloat(fibS3.toFixed(2)) },
    camarilla: { p: parseFloat(p.toFixed(2)), r1: parseFloat(camR1.toFixed(2)), r2: parseFloat(camR2.toFixed(2)), r3: parseFloat(camR3.toFixed(2)), s1: parseFloat(camS1.toFixed(2)), s2: parseFloat(camS2.toFixed(2)), s3: parseFloat(camS3.toFixed(2)) }
  };
}

export function generateMarketSignals(data) {
  if (!data || data.length < 50) return null;

  const currentClose = data[data.length - 1].close;
  const ema20 = calculateEMA(data, 20);
  const ema50 = calculateEMA(data, 50);
  const ema200 = calculateEMA(data, 200);
  const rsi = calculateRSI(data, 14);
  const macd = calculateMACD(data);
  const sr = findSupportResistance(data);

  const currEMA20 = ema20[ema20.length - 1];
  const currEMA50 = ema50[ema50.length - 1];
  const currEMA200 = ema200[ema200.length - 1] || currEMA50;
  const currRSI = rsi[rsi.length - 1] || 50;
  const currHist = macd.histogram[macd.histogram.length - 1] || 0;

  let bullScore = 0;
  let bearScore = 0;
  const reasons = [];

  // EMA alignment
  if (currEMA20 > currEMA50) {
    bullScore += 2;
    reasons.push('EMA20 อยู่เหนือ EMA50 (Short-term Bullish)');
  } else {
    bearScore += 2;
    reasons.push('EMA20 อยู่ใต้ EMA50 (Short-term Bearish)');
  }

  if (currentClose > currEMA200) {
    bullScore += 2;
    reasons.push('ราคาอยู่เหนือ EMA200 (Long-term Bullish Trend)');
  } else {
    bearScore += 2;
    reasons.push('ราคาอยู่ใต้ EMA200 (Long-term Bearish Trend)');
  }

  // RSI
  if (currRSI < 35) {
    bullScore += 2;
    reasons.push(`RSI (${currRSI}) อยู่ในโซน Oversold (มีโอกาสเกิดการดีดตัว)`);
  } else if (currRSI > 68) {
    bearScore += 2;
    reasons.push(`RSI (${currRSI}) อยู่ในโซน Overbought (มีโอกาสเกิดการย่อตัว)`);
  } else if (currRSI > 50) {
    bullScore += 1;
  } else {
    bearScore += 1;
  }

  // MACD
  if (currHist > 0) {
    bullScore += 2;
    reasons.push('MACD Histogram เป็นบวก (Bullish Momentum)');
  } else {
    bearScore += 2;
    reasons.push('MACD Histogram เป็นลบ (Bearish Momentum)');
  }

  const totalScore = bullScore + bearScore;
  const bullRatio = Math.round((bullScore / (totalScore || 1)) * 100);

  let bias = 'NEUTRAL';
  if (bullRatio >= 65) bias = 'STRONG BULLISH';
  else if (bullRatio >= 55) bias = 'BULLISH';
  else if (bullRatio <= 35) bias = 'STRONG BEARISH';
  else if (bullRatio <= 45) bias = 'BEARISH';

  // Strategy Setup
  let type = bias.includes('BULLISH') ? 'BUY' : 'SELL';
  let entry = currentClose;
  let sl, tp1, tp2, tp3;

  const nearestSupport = sr.supports[0] || (currentClose - 25);
  const nearestResistance = sr.resistances[0] || (currentClose + 25);

  if (type === 'BUY') {
    sl = parseFloat((nearestSupport - 5).toFixed(2));
    const risk = entry - sl;
    tp1 = parseFloat((entry + risk * 1.5).toFixed(2));
    tp2 = parseFloat((entry + risk * 2.5).toFixed(2));
    tp3 = parseFloat((entry + risk * 4.0).toFixed(2));
  } else {
    sl = parseFloat((nearestResistance + 5).toFixed(2));
    const risk = sl - entry;
    tp1 = parseFloat((entry - risk * 1.5).toFixed(2));
    tp2 = parseFloat((entry - risk * 2.5).toFixed(2));
    tp3 = parseFloat((entry - risk * 4.0).toFixed(2));
  }

  const rrRatio = parseFloat((Math.abs(tp2 - entry) / Math.abs(entry - sl)).toFixed(2));

  return {
    bias,
    bullRatio,
    reasons,
    setup: {
      type,
      entry,
      sl,
      tp1,
      tp2,
      tp3,
      rrRatio,
      timeframe: 'H1 / H4',
      confidence: Math.min(92, Math.max(62, bullRatio > 50 ? bullRatio : 100 - bullRatio))
    },
    supports: sr.supports,
    resistances: sr.resistances
  };
}
