import React, { useRef, useEffect, useState } from 'react';
import { 
  Maximize2, ZoomIn, ZoomOut, RefreshCw, Eye, EyeOff, 
  TrendingUp, Activity, Layers, Crosshair, BarChart2, Shield 
} from 'lucide-react';
import { 
  calculateEMA, calculateBollingerBands, calculateRSI, 
  calculateMACD, calculateFibonacci, findSupportResistance 
} from '../utils/technicalAnalysis';

export default function InteractiveChart({ data, timeframe, setTimeframe, liveTick }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Indicators toggle state
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showFib, setShowFib] = useState(false);
  const [showSR, setShowSR] = useState(true);
  const [subChart, setSubChart] = useState('RSI'); // 'RSI' | 'MACD' | 'OFF'
  const [chartType, setChartType] = useState('candles'); // 'candles' | 'line'

  // Pan & Zoom state
  const [zoomLevel, setZoomLevel] = useState(40); // Number of visible candles
  const [panOffset, setPanOffset] = useState(0); // Offset from the latest candle
  const [hoverInfo, setHoverInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Calculated Technicals
  const ema20 = calculateEMA(data, 20);
  const ema50 = calculateEMA(data, 50);
  const ema200 = calculateEMA(data, 200);
  const bollinger = calculateBollingerBands(data, 20, 2);
  const rsi = calculateRSI(data, 14);
  const macd = calculateMACD(data, 12, 26, 9);
  const srLevels = findSupportResistance(data);

  // Find min/max for Fibonacci
  const recentSlice = data.slice(-Math.min(data.length, 60));
  const maxPrice = Math.max(...recentSlice.map(d => d.high));
  const minPrice = Math.min(...recentSlice.map(d => d.low));
  const fibLevels = calculateFibonacci(maxPrice, minPrice);

  // Render Canvas Chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight || 550;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Layout Dimensions
    const paddingRight = 65; // Price scale
    const paddingBottom = subChart === 'OFF' ? 30 : 160; // Sub-chart area
    const paddingTop = 25;
    const paddingLeft = 10;

    const mainWidth = width - paddingLeft - paddingRight;
    const mainHeight = height - paddingTop - paddingBottom;

    // Candle slicing
    const visibleCount = Math.min(data.length, Math.max(15, zoomLevel));
    const startIndex = Math.max(0, data.length - visibleCount - panOffset);
    const endIndex = Math.min(data.length, startIndex + visibleCount);
    const visibleData = data.slice(startIndex, endIndex);

    if (visibleData.length === 0) return;

    // Price Bounds
    let localHigh = Math.max(...visibleData.map(d => d.high));
    let localLow = Math.min(...visibleData.map(d => d.low));

    // Add padding to price scale
    const priceMargin = (localHigh - localLow) * 0.08 || 5;
    localHigh += priceMargin;
    localLow -= priceMargin;
    const priceRange = localHigh - localLow;

    const candleWidth = mainWidth / visibleData.length;
    const getX = (index) => paddingLeft + index * candleWidth + candleWidth / 2;
    const getY = (price) => paddingTop + mainHeight - ((price - localLow) / priceRange) * mainHeight;

    // --- 1. Draw Grid Lines & Price Scale ---
    ctx.strokeStyle = '#e0e3eb';
    ctx.lineWidth = 1;

    // Horizontal Grid (Price levels)
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = localLow + (priceRange / gridSteps) * i;
      const y = getY(p);

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Price Label
      ctx.fillStyle = '#787b86';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`$${p.toFixed(1)}`, width - paddingRight + 8, y + 4);
    }

    // --- 2. Draw Support & Resistance Zones ---
    if (showSR) {
      srLevels.supports.forEach(sup => {
        if (sup >= localLow && sup <= localHigh) {
          const y = getY(sup);
          ctx.fillStyle = 'rgba(8, 153, 129, 0.04)';
          ctx.fillRect(paddingLeft, y - 8, mainWidth, 16);
          ctx.strokeStyle = 'rgba(8, 153, 129, 0.25)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(paddingLeft, y);
          ctx.lineTo(width - paddingRight, y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#089981';
          ctx.fillText(`Sup $${sup}`, width - paddingRight + 8, y + 3);
        }
      });

      srLevels.resistances.forEach(res => {
        if (res >= localLow && res <= localHigh) {
          const y = getY(res);
          ctx.fillStyle = 'rgba(242, 54, 69, 0.04)';
          ctx.fillRect(paddingLeft, y - 8, mainWidth, 16);
          ctx.strokeStyle = 'rgba(242, 54, 69, 0.25)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(paddingLeft, y);
          ctx.lineTo(width - paddingRight, y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#f23645';
          ctx.fillText(`Res $${res}`, width - paddingRight + 8, y + 3);
        }
      });
    }

    // --- 3. Draw Fibonacci Retracement ---
    if (showFib && fibLevels) {
      const fibs = [
        { label: '0.0%', val: fibLevels.level0, color: '#787b86' },
        { label: '23.6%', val: fibLevels.level236, color: '#2962ff' },
        { label: '38.2%', val: fibLevels.level382, color: '#00bcd4' },
        { label: '50.0%', val: fibLevels.level500, color: '#ff9800' },
        { label: '61.8%', val: fibLevels.level618, color: '#9c27b0' },
        { label: '100.0%', val: fibLevels.level100, color: '#787b86' }
      ];

      fibs.forEach(f => {
        if (f.val >= localLow && f.val <= localHigh) {
          const y = getY(f.val);
          ctx.strokeStyle = f.color;
          ctx.setLineDash([2, 2]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(paddingLeft, y);
          ctx.lineTo(width - paddingRight, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = f.color;
          ctx.font = '10px "JetBrains Mono"';
          ctx.fillText(`Fib ${f.label} ($${f.val})`, paddingLeft + 10, y - 4);
        }
      });
    }

    // --- 4. Draw Bollinger Bands ---
    if (showBB) {
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleData.length; i++) {
        const dataIdx = startIndex + i;
        const bb = bollinger[dataIdx];
        if (bb) {
          const x = getX(i);
          const yUpper = getY(bb.upper);
          if (!started) { ctx.moveTo(x, yUpper); started = true; }
          else { ctx.lineTo(x, yUpper); }
        }
      }
      for (let i = visibleData.length - 1; i >= 0; i--) {
        const dataIdx = startIndex + i;
        const bb = bollinger[dataIdx];
        if (bb) {
          const x = getX(i);
          const yLower = getY(bb.lower);
          ctx.lineTo(x, yLower);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(41, 98, 255, 0.04)';
      ctx.fill();
    }

    // --- 5. Draw EMA Overlays ---
    const drawLineIndicator = (indicatorArray, color, width = 1.5) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleData.length; i++) {
        const dataIdx = startIndex + i;
        const val = indicatorArray[dataIdx];
        if (val !== null && val !== undefined) {
          const x = getX(i);
          const y = getY(val);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();
    };

    if (showEMA20) drawLineIndicator(ema20, '#2196f3', 1.8);
    if (showEMA50) drawLineIndicator(ema50, '#ff9800', 1.8);
    if (showEMA200) drawLineIndicator(ema200, '#9c27b0', 2.0);

    // --- 6. Draw Candlesticks / Line Chart ---
    if (chartType === 'candles') {
      visibleData.forEach((d, i) => {
        const x = getX(i);
        const yOpen = getY(d.open);
        const yClose = getY(d.close);
        const yHigh = getY(d.high);
        const yLow = getY(d.low);

        const isBullish = d.close >= d.open;
        const color = isBullish ? '#089981' : '#f23645';

        // High-Low Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Candle Body
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
        const bodyWidth = Math.max(2, candleWidth * 0.75);

        ctx.fillStyle = color;
        ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
      });
    } else {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      visibleData.forEach((d, i) => {
        const x = getX(i);
        const y = getY(d.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // --- 7. Draw Current Price Marker ---
    const lastVisible = visibleData[visibleData.length - 1];
    if (lastVisible) {
      const yCurrent = getY(lastVisible.close);
      const isBullish = lastVisible.close >= lastVisible.open;
      const markerColor = isBullish ? '#089981' : '#f23645';
      ctx.strokeStyle = markerColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, yCurrent);
      ctx.lineTo(width - paddingRight, yCurrent);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag Box
      ctx.fillStyle = markerColor;
      ctx.fillRect(width - paddingRight, yCurrent - 10, paddingRight - 5, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "JetBrains Mono"';
      ctx.fillText(`$${lastVisible.close.toFixed(2)}`, width - paddingRight + 4, yCurrent + 4);
    }

    // --- 8. Draw Sub-chart (RSI / MACD) ---
    if (subChart !== 'OFF') {
      const subTop = height - paddingBottom + 25;
      const subHeight = paddingBottom - 35;

      // Sub-chart border & grid
      ctx.strokeStyle = '#e0e3eb';
      ctx.strokeRect(paddingLeft, subTop, mainWidth, subHeight);

      if (subChart === 'RSI') {
        // RSI Guidelines 70 and 30
        const getRsiY = (val) => subTop + subHeight - (val / 100) * subHeight;
        
        ctx.strokeStyle = 'rgba(242, 54, 69, 0.25)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, getRsiY(70));
        ctx.lineTo(width - paddingRight, getRsiY(70));
        ctx.stroke();

        ctx.strokeStyle = 'rgba(8, 153, 129, 0.25)';
        ctx.beginPath();
        ctx.moveTo(paddingLeft, getRsiY(30));
        ctx.lineTo(width - paddingRight, getRsiY(30));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#787b86';
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillText('70 OB', width - paddingRight + 6, getRsiY(70) + 3);
        ctx.fillText('30 OS', width - paddingRight + 6, getRsiY(30) + 3);

        // Draw RSI Curve
        ctx.strokeStyle = '#9c27b0';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < visibleData.length; i++) {
          const dataIdx = startIndex + i;
          const rsiVal = rsi[dataIdx];
          if (rsiVal !== null && rsiVal !== undefined) {
            const x = getX(i);
            const y = getRsiY(rsiVal);
            if (!started) { ctx.moveTo(x, y); started = true; }
            else { ctx.lineTo(x, y); }
          }
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = '#9c27b0';
        ctx.font = 'bold 11px sans-serif';
        const latestRsi = rsi[rsi.length - 1] || 50;
        ctx.fillText(`RSI (14): ${latestRsi}`, paddingLeft + 10, subTop + 16);
      } else if (subChart === 'MACD') {
        const getMacdY = (val) => subTop + subHeight / 2 - (val * 3);

        // Histogram
        visibleData.forEach((d, i) => {
          const dataIdx = startIndex + i;
          const hist = macd.histogram[dataIdx];
          if (hist !== null && hist !== undefined) {
            const x = getX(i);
            const yZero = getMacdY(0);
            const yHist = getMacdY(hist);
            const color = hist >= 0 ? 'rgba(8, 153, 129, 0.7)' : 'rgba(242, 54, 69, 0.7)';
            ctx.fillStyle = color;
            ctx.fillRect(x - candleWidth * 0.35, Math.min(yZero, yHist), candleWidth * 0.7, Math.abs(yHist - yZero));
          }
        });

        // MACD Line
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < visibleData.length; i++) {
          const dataIdx = startIndex + i;
          const val = macd.macdLine[dataIdx];
          if (val !== null && val !== undefined) {
            const x = getX(i);
            const y = getMacdY(val);
            if (!started) { ctx.moveTo(x, y); started = true; }
            else { ctx.lineTo(x, y); }
          }
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = '#2196f3';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`MACD (12,26,9)`, paddingLeft + 10, subTop + 16);
      }
    }

  }, [data, zoomLevel, panOffset, showEMA20, showEMA50, showEMA200, showBB, showFib, showSR, subChart, chartType]);

  // Handle Mouse Hover / Crosshair
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingLeft = 10;
    const paddingRight = 65;
    const mainWidth = canvas.width - paddingLeft - paddingRight;

    const visibleCount = Math.min(data.length, Math.max(15, zoomLevel));
    const startIndex = Math.max(0, data.length - visibleCount - panOffset);
    const endIndex = Math.min(data.length, startIndex + visibleCount);
    const visibleData = data.slice(startIndex, endIndex);

    const candleWidth = mainWidth / visibleData.length;
    const index = Math.floor((x - paddingLeft) / candleWidth);

    if (index >= 0 && index < visibleData.length) {
      setHoverInfo({
        candle: visibleData[index],
        x,
        y
      });
    }

    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const candlesMoved = Math.round(deltaX / candleWidth);
      if (candlesMoved !== 0) {
        setPanOffset(prev => Math.max(0, Math.min(data.length - zoomLevel, prev + candlesMoved)));
        setDragStartX(e.clientX);
      }
    }
  };

  return (
    <div ref={containerRef} className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-2xl relative flex flex-col gap-3">
      
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs">
        
        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {['M1', 'M5', 'M15', 'H1', 'H4', 'D1'].map(tf => (
            <button
              key={tf}
              onClick={() => { setTimeframe(tf); setPanOffset(0); }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                timeframe === tf ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart View Type */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setChartType('candles')}
            className={`px-2.5 py-1 rounded-md transition-all ${chartType === 'candles' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            🕯️ Candlesticks
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2.5 py-1 rounded-md transition-all ${chartType === 'line' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-400'}`}
          >
            📈 Line
          </button>
        </div>

        {/* Technical Overlays Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-2 py-1 rounded-lg border font-mono ${showEMA20 ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            EMA20
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-2 py-1 rounded-lg border font-mono ${showEMA50 ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            EMA50
          </button>
          <button
            onClick={() => setShowEMA200(!showEMA200)}
            className={`px-2 py-1 rounded-lg border font-mono ${showEMA200 ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            EMA200
          </button>
          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2 py-1 rounded-lg border font-mono ${showBB ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Bands
          </button>
          <button
            onClick={() => setShowFib(!showFib)}
            className={`px-2 py-1 rounded-lg border font-mono ${showFib ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Fibonacci
          </button>
          <button
            onClick={() => setShowSR(!showSR)}
            className={`px-2 py-1 rounded-lg border font-mono ${showSR ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Supp/Res
          </button>
        </div>

        {/* Sub-chart Mode */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-slate-500 px-1 font-sans">Sub:</span>
          {['RSI', 'MACD', 'OFF'].map(sub => (
            <button
              key={sub}
              onClick={() => setSubChart(sub)}
              className={`px-2 py-0.5 rounded text-xs font-semibold ${subChart === sub ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Zoom & Reset */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel(prev => Math.max(15, prev - 10))}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => { setPanOffset(0); setZoomLevel(40); }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            title="Reset Chart View"
          >
            <RefreshCw size={14} />
          </button>
        </div>

      </div>

      {/* OHLCV Hover HUD Bar */}
      {hoverInfo && hoverInfo.candle && (
        <div className="flex flex-wrap items-center gap-4 px-3 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">{hoverInfo.candle.timeString}</span>
          <span className="text-slate-400">O: <strong className="text-slate-100">${hoverInfo.candle.open.toFixed(2)}</strong></span>
          <span className="text-slate-400">H: <strong className="text-emerald-400">${hoverInfo.candle.high.toFixed(2)}</strong></span>
          <span className="text-slate-400">L: <strong className="text-rose-400">${hoverInfo.candle.low.toFixed(2)}</strong></span>
          <span className="text-slate-400">C: <strong className="text-amber-400">${hoverInfo.candle.close.toFixed(2)}</strong></span>
          <span className="text-slate-400">Vol: <strong className="text-slate-200">{hoverInfo.candle.volume.toLocaleString()}</strong></span>
        </div>
      )}

      {/* Main Canvas Container */}
      <div className="relative w-full h-[520px] cursor-crosshair overflow-hidden rounded-xl">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
          onMouseDown={(e) => { setIsDragging(true); setDragStartX(e.clientX); }}
          onMouseUp={() => setIsDragging(false)}
          className="w-full h-full block"
        />
      </div>

    </div>
  );
}
