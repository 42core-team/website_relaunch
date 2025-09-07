"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { QueueMatchesTimeBucket } from "@/app/actions/stats";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function QueueMatchesChart({
  data,
  title = "Queue Matches Played",
}: {
  data: QueueMatchesTimeBucket[];
  title?: string;
}) {
  const labels = data.map((d) => new Date(d.bucket).toLocaleString());
  const counts = data.map((d) => d.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Matches",
        data: counts,
        backgroundColor: "rgba(59, 130, 246, 0.6)", // tailwind blue-500/60
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: title,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 as number | undefined,
        },
      },
    },
  };

  return (
    <div className="w-full h-72">
      <Bar data={chartData} options={options} />
    </div>
  );
}
