import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadStatusDonutChart = ({ data }) => {
  if (!data) {
    return <div className="text-center text-sm sm:text-base text-gray-600">Loading...</div>;
  }

  const statusColors = {
    new: "#3B82F6",
    open: "#EAB308",
    converted: "#10B981",
    walkin: "#A855F7",
    paused: "#F97316",
    rejected: "#EF4444",
    unavailable: "#6B7280",
  };

  const chartData = {
    labels: data.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map(item => statusColors[item.status]),
        borderWidth: 1,
        cutout: "35%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
        titleFont: { size: 12, family: "'Inter', sans-serif" },
        bodyFont: { size: 10, family: "'Inter', sans-serif" },
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 bg-white shadow rounded-xl w-full max-w-full sm:max-w-xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
        Lead Status Overview
      </h2>
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="w-full max-w-[28rem] sm:max-w-[30rem] h-[300px] sm:h-[350px]">
          <Pie data={chartData} options={options} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
        {data.map((item) => (
          <div
            key={item.status}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1 sm:py-1 rounded-lg shadow-sm border"
          >
            <div
              className="w-2 sm:w-3 h-6 sm:h-8 rounded-sm"
              style={{ backgroundColor: statusColors[item.status] }}
            ></div>
            <div className="flex justify-between items-center w-full">
              <span className="capitalize text-xs sm:text-sm font-medium text-gray-700">
                {item.status}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-700">
                {item.count || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadStatusDonutChart;