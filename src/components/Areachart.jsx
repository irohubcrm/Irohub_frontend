// src/components/AreaChart.jsx
import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const AreaChart = ({ data }) => {
    if (!data) {
        return <div className="text-center text-sm sm:text-base text-gray-600">Loading...</div>;
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            tooltip: {
                mode: "index",
                intersect: false,
                bodyFont: {
                    size: 12,
                    family: "'Inter', sans-serif"
                },
                titleFont: {
                    size: 14,
                    family: "'Inter', sans-serif"
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    }
                }
            }
        }
    };

    return (
        <div className="p-2 sm:p-3 bg-white rounded-xl w-full h-full shadow-md">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Lead Status Over Last 7 Days</h2>
            <div className="relative w-full h-[300px] sm:h-[400px]">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default AreaChart;