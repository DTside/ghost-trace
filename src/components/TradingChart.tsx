'use client';
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, UTCTimestamp } from 'lightweight-charts';
import { useTradeStore } from '@/store/useTradeStore';

export default function TradingChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  // Храним ссылки на созданные линии, чтобы удалять их
  const priceLinesRef = useRef<Map<string, any>>(new Map());

  const { currentAsset, setCurrentPrice, activeTrades } = useTradeStore() as any;

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#10161e' }, textColor: '#70757a' },
      grid: { vertLines: { color: '#19202a' }, horzLines: { color: '#19202a' } },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        barSpacing: 12,
        minBarSpacing: 5,
        rightOffset: 15,
        fixLeftEdge: true,
      },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.2, bottom: 0.2 } },
    });

    // Area Chart (как в Pocket Option)
    const series = chart.addAreaSeries({
      topColor: 'rgba(41, 98, 255, 0.3)',
      bottomColor: 'rgba(41, 98, 255, 0.05)',
      lineColor: '#2962FF',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => chart.applyOptions({ width: containerRef.current!.clientWidth, height: containerRef.current!.clientHeight });
    window.addEventListener('resize', handleResize);

    return () => { 
        window.removeEventListener('resize', handleResize); 
        chart.remove(); 
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    const symbol = currentAsset?.id || 'BTCUSDT';
    
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`)
      .then(res => res.json()).then(data => {
        const formatted = data.map((d: any) => ({
          time: (d[0] / 1000) as UTCTimestamp,
          value: parseFloat(d[4]) // Для Area берем Close цену
        }));
        seriesRef.current.setData(formatted);
        lastTimeRef.current = formatted[formatted.length - 1].time as number;
      });

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1s`);
    ws.onmessage = (e) => {
      const { k } = JSON.parse(e.data);
      const time = (k.t / 1000) as UTCTimestamp;
      if (time >= lastTimeRef.current) {
        seriesRef.current.update({ time, value: parseFloat(k.c) });
        setCurrentPrice(parseFloat(k.c));
        lastTimeRef.current = time as number;
      }
    };
    return () => ws.close();
  }, [currentAsset]);

  // --- УПРАВЛЕНИЕ МАРКЕРАМИ И ЛИНИЯМИ ---
  useEffect(() => {
    if (!seriesRef.current) return;
    
    // 1. Рисуем ГОРИЗОНТАЛЬНЫЕ ЛИНИИ (Price Lines)
    // Сначала удаляем линии закрытых сделок
    const activeIds = new Set(activeTrades.map((t: any) => t.id));
    priceLinesRef.current.forEach((line, id) => {
        if (!activeIds.has(id)) {
            seriesRef.current.removePriceLine(line);
            priceLinesRef.current.delete(id);
        }
    });

    // Добавляем новые линии
    activeTrades.forEach((t: any) => {
        if (!priceLinesRef.current.has(t.id)) {
            const line = seriesRef.current.createPriceLine({
                price: parseFloat(t.price),
                color: t.direction === 'call' ? '#00b894' : '#ff443a',
                lineWidth: 1,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: `${t.direction.toUpperCase()} $${t.amount}`,
            });
            priceLinesRef.current.set(t.id, line);
        }
    });

    // 2. Рисуем ТОЧКИ ВХОДА (Markers)
    // Используем createdAt, чтобы точка осталась в прошлом!
    const markers = activeTrades.map((t: any) => ({
      time: Math.floor(t.createdAt / 1000) as UTCTimestamp, // ВРЕМЯ СОЗДАНИЯ (не текущее!)
      position: 'inBar', // Внутри графика
      color: t.direction === 'call' ? '#00b894' : '#ff443a',
      shape: 'circle',
      size: 1, // Маленькая точка
    })).filter((m: any) => m.time && !isNaN(m.time));

    // Сортируем (обязательно)
    markers.sort((a: any, b: any) => a.time - b.time);
    
    // ВАЖНО: Маркер может быть отрисован только если его время совпадает с существующей свечой.
    // Если сделка открыта между свечами (на секундах), Lightweight chart привяжет её к ближайшей.
    seriesRef.current.setMarkers(markers);

  }, [activeTrades]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}