import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function MonthlyLeadsChart({ data, type = 'monthly' }) {
    if (!data) {
        return <div className="text-center text-sm sm:text-base text-gray-600">Loading...</div>;
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: { size: 12, family: "'Inter', sans-serif" },
                },
            },
            x: {
                ticks: { font: { size: 12, family: "'Inter', sans-serif" } },
            },
        },
        plugins: {
            legend: {
                display: type !== 'staffs',
                position: 'top',
                labels: {
                    font: { family: "'Inter', sans-serif", size: 13 },
                },
            },
            tooltip: {
                backgroundColor: '#1E6DB0',
                titleFont: { size: 14, family: "'Inter', sans-serif" },
                bodyFont: { size: 12, family: "'Inter', sans-serif" },
            },
        },
    };

    return (
        <div className="p-2 sm:p-3 bg-white rounded-xl w-full shadow-md">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">
                {type === 'source' ? 'Lead Sources Overview'
                    : type === 'staffs' ? 'Leads Closed by Staff'
                        : 'Monthly Leads Overview'}
            </h2>
            <div
                className={`relative w-full overflow-hidden ${type === 'source' || type === 'staffs'
                    ? 'h-[420px] sm:h-[590px]'
                    : 'h-[350px] sm:h-[450px]'
                    }`}
            >
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}

export default MonthlyLeadsChart;