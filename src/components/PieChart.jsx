import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { listleads } from '../services/leadsRouter';
import Spinner from "./Spinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadStatusPieChart = () => {
    const [allLeads, setAllLeads] = useState([]);
    const [isFetchingAll, setIsFetchingAll] = useState(true);

    // Fetch the first page to get pagination metadata
    const { data: initialLeadsData, isLoading, isError } = useQuery({
        queryKey: ["List leads", 1],
        queryFn: () => listleads({ page: 1 }),
    });

    // Fetch all pages of leads
    useEffect(() => {
        const fetchAllLeads = async () => {
            if (!initialLeadsData || !initialLeadsData.leads) return;

            setIsFetchingAll(true);
            let allFetchedLeads = [...initialLeadsData.leads];
            const totalPages = initialLeadsData.totalPages || 1; // Adjust based on API response

            // Fetch remaining pages if there are more
            for (let page = 2; page <= totalPages; page++) {
                try {
                    const response = await listleads({ page });
                    if (response.leads && Array.isArray(response.leads)) {
                        allFetchedLeads = [...allFetchedLeads, ...response.leads];
                    }
                } catch (error) {
                    console.error(`Error fetching page ${page}:`, error);
                }
            }

            setAllLeads(allFetchedLeads);
            setIsFetchingAll(false);
        };

        if (!isLoading && !isError && initialLeadsData) {
            fetchAllLeads();
        }
    }, [initialLeadsData, isLoading, isError]);

    const statuses = ["new", "open", "converted", "walkin", "paused", "rejected", "unavailable"];
    const statusColors = {
        new: "#3B82F6",
        open: "#EAB308",
        converted: "#10B981",
        walkin: "#A855F7",
        paused: "#F97316",
        rejected: "#EF4444",
        unavailable: "#6B7280"
    };

    const statusCounts = {};
    statuses.forEach(status => {
        statusCounts[status] = 0;
    });

    // Process all leads
    if (Array.isArray(allLeads)) {
        allLeads.forEach(lead => {
            const status = typeof lead.status === "string" ? lead.status.trim().toLowerCase() : "unknown";
            if (statuses.includes(status)) {
                statusCounts[status]++;
            }
        });
    }

    const chartData = {
        labels: statuses.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [
            {
                data: statuses.map(status => statusCounts[status]),
                backgroundColor: statuses.map(status => statusColors[status]),
                borderWidth: 1,
                hoverOffset: 8,
            }
        ]
    };

    const options = {
        responsive: true,
        animation: {
            animateScale: true,
            animateRotate: true
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: context => {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                    }
                }
            }
        }
    };

    return (
        <div className="p-6 bg-white shadow rounded-xl max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Lead Status Overview</h2>

            {(isLoading || isFetchingAll) && <Spinner />}
            {isError && <p className="text-center text-red-500">Error fetching leads.</p>}

            {/* Render chart only if data is available and valid */}
            {!isLoading && !isFetchingAll && !isError && Array.isArray(allLeads) && allLeads.length > 0 && (
                <>
                    <div className="flex justify-center mb-6">
                        <div className="w-64 sm:w-72">
                            <Pie data={chartData} options={options} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {statuses.map(status => (
                            <div
                                key={status}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg shadow-sm border border-gray-200"
                            >
                                <div
                                    className="w-3 h-12 rounded-sm"
                                    style={{ backgroundColor: statusColors[status] }}
                                ></div>
                                <div className="flex justify-between items-center w-full">
                                    <span className="capitalize text-sm font-medium text-gray-700">
                                        {status}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {statusCounts[status]}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {!isLoading && !isFetchingAll && !isError && (!Array.isArray(allLeads) || allLeads.length === 0) && (
                <p className="text-center text-gray-500">No leads data available to display the chart.</p>
            )}
        </div>
    );
};

export default LeadStatusPieChart;