import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import moment from "moment";
import { listleads } from "../services/leadsRouter";
import Spinner from "./Spinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadStatusDonutChart = () => {
  const user = useSelector((state) => state.auth.user);
  const [allLeads, setAllLeads] = useState([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);

    const { data: leadsData, isFetching, isError, error } = useQuery({
        queryKey: ["List leads"],
        queryFn: listleads,
        enabled: !!user,
    });

    useEffect(() => {
        const fetchAllLeads = async () => {
            setIsLoadingAll(true);
            let allLeads = [];
            let currentPage = 1;
            let totalPages = leadsData?.totalPages || 1;

      while (currentPage <= totalPages) {
        const response = await listleads({ page: currentPage });
        allLeads = [...allLeads, ...response.leads];
        totalPages = response.totalPages;
        currentPage++;
      }

      setAllLeads(allLeads);
      setIsLoadingAll(false);
    };

    if (leadsData?.totalPages) {
      fetchAllLeads();
    }
  }, [leadsData]);

  const [statusCounts, setStatusCounts] = useState({
    new: 0,
    open: 0,
    converted: 0,
    walkin: 0,
    paused: 0,
    rejected: 0,
    unavailable: 0,
  });

  const statuses = [
    "new",
    "open",
    "converted",
    "walkin",
    "paused",
    "rejected",
    "unavailable",
  ];
  const statusColors = {
    new: "#3B82F6",
    open: "#EAB308",
    converted: "#10B981",
    walkin: "#A855F7",
    paused: "#F97316",
    rejected: "#EF4444",
    unavailable: "#6B7280",
  };

    useEffect(() => {
        const newStatusCounts = {
            new: 0,
            open: 0,
            converted: 0,
            walkin: 0,
            paused: 0,
            rejected: 0,
            unavailable: 0
        };
        let hasMatchingLeads = false;

        if (allLeads.length > 0) {
            allLeads.forEach(lead => {
                if (lead.role === "user") {
                    const createdAt = moment(lead.createdAt);
                    const updatedAt = moment(lead.updatedAt);
                    const currentMonth = moment().startOf("month");

                    if (createdAt.isSameOrAfter(currentMonth) || updatedAt.isSameOrAfter(currentMonth)) {
                        const updatedById = typeof lead.updatedBy === "object" ? lead.updatedBy?._id : lead.updatedBy;
                        const isLeadByUser = user?.id === updatedById || user?.id === lead.createdBy;

            if (isLeadByUser) {
              hasMatchingLeads = true;
              const status = lead.status?.trim().toLowerCase();
              if (statuses.includes(status)) {
                newStatusCounts[status]++;
              }
            }
          }
        }
        
      });
    }

    if (!hasMatchingLeads) {
      newStatusCounts["unavailable"] = 1;
    }

    setStatusCounts(newStatusCounts);
  }, [allLeads, user]);

  const chartData = {
    labels: statuses.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: statuses.map((status) => statusCounts[status]),
        backgroundColor: statuses.map((status) => statusColors[status]),
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

  if (isError) {
    return (
      <div className="p-4 sm:p-6 bg-white shadow rounded-xl w-full max-w-full sm:max-w-xl mx-auto flex items-center justify-center">
        <p>Error: {error.message || "Failed to load leads."}</p>
      </div>
    );
  }

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
        {statuses.map((status) => (
          <div
            key={status}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1 sm:py-1 rounded-lg shadow-sm border"
          >
            <div
              className="w-2 sm:w-3 h-6 sm:h-8 rounded-sm"
              style={{ backgroundColor: statusColors[status] }}
            ></div>
            <div className="flex justify-between items-center w-full">
              <span className="capitalize text-xs sm:text-sm font-medium text-gray-700">
                {status}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-700">
                {statusCounts[status] || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadStatusDonutChart;