import React from "react";
import { useQuery } from "@tanstack/react-query";
import { listleads } from "../services/leadsRouter";
import Spinner from "./Spinner";

const COLORS = ["#4ade80", "#60a5fa", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6"];

const LeadSourceProgressChart = () => {
  const fetchAllLeads = async () => {
    let allLeads = [];
    let page = 1;
    const limit = 100;
    let totalPages = 1;
    const allSources = new Set();

    try {
      while (page <= totalPages) {
        const response = await listleads({ page, limit });
        allLeads = [...allLeads, ...response.leads];
        totalPages = response.totalPages;
        page++;
      }

      const userLeads = allLeads.filter(
        (lead) => lead.role === "user" && lead.source?.title?.trim()
      );

      userLeads.forEach((lead) => {
        if (lead.source?.title) {
          allSources.add(lead.source.title);
        }
      });
      return { leads: userLeads, sources: Array.from(allSources) };
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw new Error(error.message || "Failed to fetch leads");
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["List all leads"],
    queryFn: fetchAllLeads,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const userLeads = data?.leads || [];
  const allSources = data?.sources || [];

  const totalLeads = userLeads.length || 0;

  const sourceCounts = {};
  allSources.forEach((source) => {
    sourceCounts[source] = 0;
  });

  userLeads.forEach((lead) => {
    const sourceTitle = lead.source?.title;
    if (sourceTitle) {
      sourceCounts[sourceTitle]++;
    }
  });

    const progressData = allSources.map((source, index) => ({
        name: source,
        count: sourceCounts[source],
        percent: totalLeads > 0 ? ((sourceCounts[source] / totalLeads) * 100).toFixed(2) : 0,
        color: COLORS[index % COLORS.length],
    }));

    progressData.sort((a, b) => b.count - a.count);

  return (
    <div className="p-2 sm:p-4 bg-white shadow rounded-xl w-full max-w-full sm:max-w-2xl mx-auto h-auto min-h-[200px] sm:h-auto max-h-[500px] overflow-y-auto">
      <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-center text-gray-800">
        Lead Source Distribution
      </h2>
      {isLoading && <Spinner />}
      {error && <div className="text-red-500 text-center">Error: {error.message}</div>}
      {!isLoading && !error && allSources.length === 0 && (
        <div className="text-gray-500 text-center">No lead sources available</div>
      )}
      {!isLoading && !error && allSources.length > 0 &&
        progressData.map((entry, index) => (
          <div key={index} className="mb-4 sm:mb-6 text-left">
            <div className="mb-0.5 sm:mb-1 flex justify-between items-center text-xs sm:text-sm font-medium text-gray-700">
              <span>
                {entry.name} ({entry.count})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 sm:h-6 relative overflow-hidden">
              <div
                className="h-4 sm:h-6 rounded-full transition-all duration-700 ease-out flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white"
                style={{
                  width: `${entry.percent}%`,
                  backgroundColor: entry.color,
                }}
              >
                {entry.percent}%
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default LeadSourceProgressChart;
