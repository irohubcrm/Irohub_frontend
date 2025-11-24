import React from "react";
import { Chart as ChartJS, defaults } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { getpaymentDetailsed } from "../../services/paymentstatusRouter";

ChartJS.register(ChartDataLabels);

defaults.responsive = true;
defaults.maintainAspectRatio = false;

export default function MonthlyPaymentChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["paymentDetails"],
    queryFn: getpaymentDetailsed,
  });

  if (isLoading) return <p>Loading chart...</p>;
  if (isError) return <p className="text-red-500">Error loading chart data</p>;

  const payments = data?.allPayment || [];

  // ✅ Months (Jan–Dec)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // ✅ Monthly totals for Paid and Total Amount
  const monthlyPaidTotals = Array(12).fill(0);
  const monthlyTotalAmounts = Array(12).fill(0);

  payments.forEach((item) => {
    if (!item.createdAt) return;
    const monthIndex = new Date(item.createdAt).getMonth();
    monthlyPaidTotals[monthIndex] += item.totalPaid || 0;
    monthlyTotalAmounts[monthIndex] += item.totalAmount || 0;
  });

  // ✅ Scale factor to inflate values for display (e.g., multiply by 1000 to simulate larger amounts)
  const scaleFactor = 1000;

  // ✅ Scaled data for chart display
  const scaledPaidTotals = monthlyPaidTotals.map(value => value * scaleFactor);
  const scaledTotalAmounts = monthlyTotalAmounts.map(value => value * scaleFactor);

  // ✅ Chart Data
  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Total Paid (₹)",
        data: scaledPaidTotals, // Use scaled data
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#2563eb",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderDash: [6, 3],
      },
      {
        label: "Total Amount (₹)",
        data: scaledTotalAmounts, // Use scaled data
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b",
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#f59e0b",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // ✅ Chart Options
  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: "Monthly Payment Report (Jan–Dec)",
        font: { size: 18, weight: "bold" },
        color: "#111827",
      },
      legend: {
        position: "top",
        labels: { color: "#374151", font: { size: 14 } },
      },
      datalabels: {
        color: "#111",
        anchor: "end",
        align: "top",
        font: { size: 12, weight: "bold" },
        formatter: (value) => (value ? `₹${(value / scaleFactor).toFixed(2)}` : ""), // Show original value
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || "";
            const value = context.raw / scaleFactor; // Convert back to original value
            return `${datasetLabel}: ₹${value.toFixed(2)}`;
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: "#374151",
          font: { size: 14, weight: "bold" },
        },
        ticks: { color: "#4b5563" },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: "Amount (₹)",
          color: "#374151",
          font: { size: 14, weight: "bold" },
        },
        beginAtZero: true,
        ticks: {
          color: "#4b5563",
          callback: (value) => `₹${(value / scaleFactor).toFixed(0)}`, // Show original scale on y-axis
        },
        grid: { color: "#e5e7eb" },
        suggestedMax: Math.max(...scaledPaidTotals, ...scaledTotalAmounts) * 1.1, // Ensure chart accommodates scaled values
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mt-5 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      
      </h2>
      <div className="h-[400px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}