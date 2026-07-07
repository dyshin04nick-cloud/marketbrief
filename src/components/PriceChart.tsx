"use client";
// TradingView Lightweight Charts wrapper: candles + volume, or line for
// series data (bond yields, crypto max-range).
import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ColorType, CrosshairMode } from "lightweight-charts";
import type { ChartData } from "@/lib/service";

export const RANGES = ["1D", "1W", "1M", "3M", "1Y", "5Y", "ALL"] as const;

export default function PriceChart({ assetId, defaultRange = "1M" }: { assetId: string; defaultRange?: string }) {
  const [range, setRange] = useState(defaultRange);
  const [status, setStatus] = useState<"loading" | "ok" | "empty">("loading");
  const [reason, setReason] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!boxRef.current) return;
    const chart = createChart(boxRef.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#8b98a9", fontSize: 11 },
      grid: { vertLines: { color: "#1a2330" }, horzLines: { color: "#1a2330" } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#1e2936" },
      timeScale: { borderColor: "#1e2936", timeVisible: true, secondsVisible: false },
    });
    chartRef.current = chart;
    return () => { chart.remove(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    let stop = false;
    setStatus("loading");
    fetch(`/api/chart/${assetId}?range=${range}`)
      .then((r) => r.json())
      .then((data: ChartData) => {
        if (stop || !chartRef.current) return;
        const chart = chartRef.current;
        // clear previous series
        // @ts-ignore private-ish: track our own series list instead
        (chart as any)._mbSeries?.forEach((s: any) => chart.removeSeries(s));
        const seriesList: any[] = [];

        if (!data.points?.length) {
          setStatus("empty");
          setReason(data.unavailableReason ?? "No data returned for this range");
          return;
        }
        if (data.type === "candles") {
          const cs = chart.addCandlestickSeries({
            upColor: "#26a69a", downColor: "#ef5350", borderVisible: false,
            wickUpColor: "#26a69a", wickDownColor: "#ef5350",
          });
          cs.setData(data.points.map((p) => ({ time: p.time as any, open: p.open!, high: p.high!, low: p.low!, close: p.close })));
          seriesList.push(cs);
          if (data.points.some((p) => p.volume)) {
            const vs = chart.addHistogramSeries({ priceFormat: { type: "volume" }, priceScaleId: "vol" });
            chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
            vs.setData(data.points.map((p) => ({
              time: p.time as any, value: p.volume ?? 0,
              color: (p.close >= (p.open ?? p.close)) ? "rgba(38,166,154,.35)" : "rgba(239,83,80,.35)",
            })));
            seriesList.push(vs);
          }
        } else {
          const ls = chart.addAreaSeries({
            lineColor: "#4f8cff", topColor: "rgba(79,140,255,.25)", bottomColor: "rgba(79,140,255,0)", lineWidth: 2,
          });
          ls.setData(data.points.map((p) => ({ time: p.time as any, value: p.close })));
          seriesList.push(ls);
        }
        (chart as any)._mbSeries = seriesList;
        chart.timeScale().fitContent();
        setStatus("ok");
      })
      .catch(() => { if (!stop) { setStatus("empty"); setReason("Chart request failed"); } });
    return () => { stop = true; };
  }, [assetId, range]);

  return (
    <div className="panel">
      <div className="panel-h">
        <div className="flex gap-0.5">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold ${range === r ? "bg-chip text-txt" : "text-muted hover:text-txt"}`}>
              {r}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-dim">TradingView Lightweight Charts</span>
      </div>
      <div className="relative h-[420px]">
        <div ref={boxRef} className="absolute inset-0" />
        {status !== "ok" && (
          <div className="absolute inset-0 flex items-center justify-center bg-panel/70 text-sm text-dim">
            {status === "loading" ? "Loading chart…" : `No chart data: ${reason}`}
          </div>
        )}
      </div>
    </div>
  );
}

