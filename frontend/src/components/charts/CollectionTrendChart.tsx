"use client";

import type { EChartsOption } from "echarts";
import EChart from "./EChart";
import { fmt, TREND } from "../../lib/analytics/data";

export default function CollectionTrendChart() {
  const option: EChartsOption = {
    color: ["#059669", "#4b9cd3"],
    grid: { left: 50, right: 20, top: 36, bottom: 32 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => fmt(Number(value)),
    },
    legend: {
      top: 0,
      right: 0,
      data: ["Collected", "Outstanding"],
      textStyle: { fontSize: 12 },
    },
    xAxis: {
      type: "category",
      data: TREND.map((t) => t.month),
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisLabel: { color: "#64748b", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
        formatter: (value: number) => `$${Math.round(value / 1000)}k`,
      },
      splitLine: { lineStyle: { color: "#eef2f7" } },
    },
    series: [
      {
        name: "Collected",
        type: "line",
        data: TREND.map((t) => t.Collected),
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(5, 150, 105, 0.25)" },
              { offset: 1, color: "rgba(5, 150, 105, 0)" },
            ],
          },
        },
      },
      {
        name: "Outstanding",
        type: "line",
        data: TREND.map((t) => t.Outstanding),
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(75, 156, 211, 0.25)" },
              { offset: 1, color: "rgba(75, 156, 211, 0)" },
            ],
          },
        },
      },
    ],
  };

  return <EChart option={option} height="220px" />;
}
