// Utility to generate realistic historical & live XAU/USD gold OHLCV data

export function generateGoldData(timeframe = 'H1', count = 120) {
  const data = [];
  let basePrice = 4050.00;
  
  // Set timeframe interval in minutes
  let intervalMinutes = 60;
  if (timeframe === 'M15') intervalMinutes = 15;
  if (timeframe === 'H4') intervalMinutes = 240;
  if (timeframe === 'D1') intervalMinutes = 1440;

  const now = new Date();
  let currentTime = new Date(now.getTime() - count * intervalMinutes * 60 * 1000);

  // Volatility factor per timeframe
  const volatilityMap = {
    'M15': 3.5,
    'H1': 8.0,
    'H4': 18.0,
    'D1': 35.0
  };
  const vol = volatilityMap[timeframe] || 8.0;

  let trend = 0.2; // Slight bullish bias

  for (let i = 0; i < count; i++) {
    // Random walk with mean reversion
    if (Math.random() < 0.1) trend = (Math.random() - 0.45) * 1.5;
    
    const noise = (Math.random() - 0.48) * vol;
    const open = parseFloat(basePrice.toFixed(2));
    const close = parseFloat((open + noise + trend).toFixed(2));
    
    const highOffset = Math.random() * (vol * 0.6);
    const lowOffset = Math.random() * (vol * 0.6);
    
    const high = parseFloat((Math.max(open, close) + highOffset).toFixed(2));
    const low = parseFloat((Math.min(open, close) - lowOffset).toFixed(2));
    const volume = Math.floor(1500 + Math.random() * 8000 + (Math.abs(close - open) * 200));

    data.push({
      time: new Date(currentTime),
      timeString: formatTimeLabel(currentTime, timeframe),
      open,
      high,
      low,
      close,
      volume
    });

    basePrice = close;
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
  }

  return data;
}

function formatTimeLabel(date, timeframe) {
  if (timeframe === 'D1') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (timeframe === 'H4' || timeframe === 'H1') {
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:00`;
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function generateLiveTick(lastCandle, timeframe) {
  const vol = timeframe === 'M15' ? 0.8 : timeframe === 'H1' ? 1.5 : 3.0;
  const delta = (Math.random() - 0.49) * vol;
  const newClose = parseFloat((lastCandle.close + delta).toFixed(2));
  const newHigh = parseFloat((Math.max(lastCandle.high, newClose)).toFixed(2));
  const newLow = parseFloat((Math.min(lastCandle.low, newClose)).toFixed(2));

  return {
    ...lastCandle,
    close: newClose,
    high: newHigh,
    low: newLow,
    volume: lastCandle.volume + Math.floor(Math.random() * 25)
  };
}
