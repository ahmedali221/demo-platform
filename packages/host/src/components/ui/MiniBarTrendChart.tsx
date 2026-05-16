import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

export default function MiniBarTrendChart({
  values = [17, 22, 22, 20, 21, 24, 18, 23, 21, 22, 16, 18],
  trend = [18, 19, 18, 18.5, 20, 21.5, 19, 18.8, 19.5, 18.7, 17.8, 17],
}) {
  const data: ChartData<"bar" | "line", number[], string> = {
    labels: values.map((_, i) => `#${i + 1}`),
    datasets: [
      {
        type: "bar" as const,
        data: values,
        backgroundColor: values.map((_, i) =>
          i % 2 === 0 ? "rgba(94, 112, 235, 0.9)" : "rgba(94, 112, 235, 0.45)",
        ),
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 10,
      },
      {
        type: "line" as const,
        data: trend,
        borderColor: "#9aa3c7",
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0,0,0,0.04)",
          drawBorder: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        min: 12,
        max: 24,
        ticks: {
          stepSize: 2,
          color: "#4a4a4a",
          font: { size: 12 },
        },
        grid: {
          color: "rgba(0,0,0,0.05)",
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div
      style={{
        background: "#f4f5f7",
        borderRadius: "18px",
        padding: "12px",
        width: 270,
        height: 190,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04) inset",
      }}
    >
      <Bar data={data as any} options={options} />
    </div>
  );
}
