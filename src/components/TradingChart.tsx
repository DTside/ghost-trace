'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, UTCTimestamp } from 'lightweight-charts'; // Используем UTCTimestamp
import { useTradeStore } from '@/store/useTradeStore';

// Генератор мок-данных с правильными типами
const generateMockData = (basePrice: number, count: number) => {
    let price = basePrice;
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = count; i > 0; i--) {
        const time = (now - (i * 60)) as UTCTimestamp;
        const volatility = basePrice * 0.0005;
        const change = (Math.random() - 0.5) * volatility;
        const close = price + change;
        data.push({ time, value: close });
        price = close;
    }
    return { data, lastPrice: price };
};

export default function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Достаем activeTrades для отрисовки точек входа
  const { currentAsset, setCurrentPrice, activeTrades } = useTradeStore() as any;
  const [currentPriceDisplay, setCurrentPriceDisplay] = useState('0.00');
  
  const seriesRef = useRef<any>(null); // Храним ссылку на серию, чтобы обновлять маркеры

  // 1. Инициализация графика и данных
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#6b7280' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const newSeries = chart.addAreaSeries({
      lineColor: '#3b82f6', topColor: 'rgba(59, 130, 246, 0.4)', bottomColor: 'rgba(59, 130, 246, 0.0)',
      lineWidth: 2, priceLineVisible: true,
    });
    
    seriesRef.current = newSeries; // Сохраняем ссылку

    const handleResize = () => { if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth }); };
    window.addEventListener('resize', handleResize);

    let ws: WebSocket | null = null;
    let intervalId: any = null;

    const loadData = async () => {
        // A. КРИПТА (Binance)
        if (currentAsset.category === 'Crypto') {
            try {
                const symbol = currentAsset.id || 'BTCUSDT';
                const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`);
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    const mappedData = data.map((d: any) => ({
                        time: (d[0] / 1000) as UTCTimestamp,
                        value: parseFloat(d[4])
                    }));
                    newSeries.setData(mappedData);
                    
                    const lastPrice = mappedData[mappedData.length - 1].value;
                    setCurrentPrice(lastPrice);
                    setCurrentPriceDisplay(lastPrice.toFixed(2));

                    ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);
                    ws.onmessage = (event) => {
                        const message = JSON.parse(event.data);
                        const price = parseFloat(message.k.c);
                        const time = (message.k.t / 1000) as UTCTimestamp;
                        
                        newSeries.update({ time, value: price });
                        setCurrentPrice(price);
                        setCurrentPriceDisplay(price.toFixed(2));
                    };
                }
            } catch (e) {
                startSimulation(10000); 
            }
        } 
        // B. АКЦИИ / ФОРЕКС (Симуляция)
        else {
            let basePrice = 100;
            if (currentAsset.category === 'Forex') basePrice = 1.09;
            if (currentAsset.category === 'Stocks') basePrice = 150;
            if (currentAsset.category === 'Commodities') basePrice = 2000;
            startSimulation(basePrice);
        }
    };

    const startSimulation = (startPrice: number) => {
        const { data, lastPrice } = generateMockData(startPrice, 100);
        newSeries.setData(data);
        
        let currentSimPrice = lastPrice;
        
        intervalId = setInterval(() => {
            const time = Math.floor(Date.now() / 1000) as UTCTimestamp;
            const volatility = currentSimPrice * 0.0005;
            const change = (Math.random() - 0.5) * volatility;
            currentSimPrice += change;
            
            newSeries.update({ time, value: currentSimPrice });
            setCurrentPrice(currentSimPrice);
            setCurrentPriceDisplay(currentSimPrice.toFixed(currentAsset.category === 'Forex' ? 5 : 2));
        }, 1000);
    };

    loadData();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      if (ws) ws.close();
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentAsset]);

  // 2. ОТРИСОВКА МАРКЕРОВ (СДЕЛОК)
  // Этот эффект запускается каждый раз, когда меняется список сделок
  useEffect(() => {
      if (!seriesRef.current || !activeTrades) return;

      const markers = activeTrades.map((t: any) => {
          // Важно: переводим миллисекунды в секунды для графика
          // Если t.createdAt это Timestamp (число), делим на 1000
          const time = Math.floor(new Date(t.createdAt).getTime() / 1000) as UTCTimestamp;
          
          return {
              time: time,
              position: 'inBar', // Точка на графике
              color: t.direction === 'call' ? '#10b981' : '#ef4444', // Зеленый для Call, Красный для Put
              shape: t.direction === 'call' ? 'arrowUp' : 'arrowDown',
              text: t.direction === 'call' ? 'CALL' : 'PUT',
              size: 2
          };
      });

      // Сортируем маркеры по времени (требование библиотеки)
      markers.sort((a: any, b: any) => a.time - b.time);

      seriesRef.current.setMarkers(markers);

  }, [activeTrades]);

  return (
    <div className="relative w-full h-full group">
        <div ref={chartContainerRef} className="w-full h-full" />
        <div className="absolute right-0 top-[20%] bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-l shadow-lg z-20">
            <span className="animate-pulse mr-2">●</span>{currentPriceDisplay}
        </div>
    </div>
  );
}