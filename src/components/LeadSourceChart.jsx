import React from "react";
import Spinner from "./Spinner";

const COLORS = ["#4ade80", "#60a5fa", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6"];

const LeadSourceProgressChart = ({ data }) => {
  if (!data) {
    return <Spinner />;
  }

  const progressData = data.map((entry, index) => ({
    ...entry,
    color: COLORS[index % COLORS.length],
  }));

  progressData.sort((a, b) => b.count - a.count);

  return (
    <div className="p-2 sm:p-4 bg-white shadow rounded-xl w-full max-w-full sm:max-w-2xl mx-auto h-auto min-h-[200px] sm:h-auto max-h-[500px] overflow-y-auto">
      <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-center text-gray-800">
        Lead Source Distribution
      </h2>
      {progressData.length === 0 ? (
        <div className="text-gray-500 text-center">No lead sources available</div>
      ) : (
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
        ))
      )}
    </div>
  );
};

export default LeadSourceProgressChart;
