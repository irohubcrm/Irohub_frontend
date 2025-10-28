// src/components/AreaChart.jsx
import React, { useMemo } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useSelector } from "react-redux";
import { listleads } from "../services/leadsRouter";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const AreaChart = () => {
    const { data: leads, isLoading } = useQuery({
        queryKey: ["List leads"],
        queryFn: listleads,
        refetchInterval: 60000,
    });    

    const user = useSelector((state) => state.auth.user);
    const queryClient = useQueryClient();

    const daysOfWeek = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            days.push(moment().subtract(i, "days").format("ddd"));
        }
        return days;
    }, []);

    const totalLeadsCreated = useMemo(() => {
        const map = { open: {}, closed: {} };
        daysOfWeek.forEach(day => {
            map.open[day] = 0;
            map.closed[day] = 0;
        });

        let total = 0;

        leads?.leads?.forEach(lead => {
            const leadDate = moment(lead.createdAt);
            const leadDay = leadDate.format("ddd");
            const isWithinWeek = moment().diff(leadDate, "days") <= 6;
            const status = lead.status?.trim().toLowerCase();

            const updatedById =
                typeof lead.updatedBy === "object" ? lead.updatedBy?._id : lead.updatedBy;
            const createdById =
                typeof lead.createdBy === "object" ? lead.createdBy?._id : lead.createdBy;

            const isLeadByUser = user?.id === updatedById || user?.id === createdById;

            if (isWithinWeek && isLeadByUser) {
                if (status === "open") {
                    map.open[leadDay]++;
                } else if (["closed", "rejected", "unavailable", "converted"].includes(status)) {
                    map.closed[leadDay]++;
                }
                total++;
            }
        });

        return { map, total };
    }, [leads, daysOfWeek, user]);

    const chartData = useMemo(() => ({
        labels: daysOfWeek,
        datasets: [
            {
                label: "Opened",
                data: daysOfWeek.map(day => totalLeadsCreated.map.open[day]),
                fill: true,
                backgroundColor: "rgba(234, 179, 8, 0.2)",
                borderColor: "rgba(234, 179, 8, 1)",
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5
            },
            {
                label: "Closed",
                data: daysOfWeek.map(day => totalLeadsCreated.map.closed[day]),
                fill: true,
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                borderColor: "rgba(239, 68, 68, 1)",
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5
            }
        ]
    }), [totalLeadsCreated, daysOfWeek]);

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

    if (isLoading) {
        return <div className="text-center text-sm sm:text-base text-gray-600">Loading...</div>;
    }

    return (
        <div className="p-2 sm:p-3 bg-white rounded-xl w-full h-full shadow-md">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Lead Status Over Last 7 Days</h2>
            <div className="relative w-full h-[300px] sm:h-[400px]">
                <Line data={chartData} options={options} />
            </div>
            <div className="mt-2 sm:mt-3">
                <p className="text-base sm:text-lg font-medium text-gray-700">
                    {`Total leads: ${totalLeadsCreated.total}`}
                </p>
            </div>
        </div>
    );
};

export default AreaChart;