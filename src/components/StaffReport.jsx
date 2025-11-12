import React, { useState, useMemo } from "react"; // Added useState, useMemo
import { useQuery } from "@tanstack/react-query";
import { listleads } from "../services/leadsRouter";
import { liststaffs } from "../services/staffRouter";
import { listtask } from "../services/tasksRouter";
import { motion } from "framer-motion"; // Added motion
import { FaChartBar } from "react-icons/fa"; // Added FaChartBar
import MonthlyLeadsChart from "../components/BarChart"; // Added MonthlyLeadsChart
import Spinner from "../components/Spinner"; // Added Spinner

// --- All hooks MUST be inside the component ---
const StaffReport = () => {
  // 1. All hooks moved inside the component
  const [staffPage, setStaffPage] = useState(1);

  const {
    data: initialAllTimeLeadsData,
    isLoading: isLoadingAllTime,
    isError: isErrorAllTime,
  } = useQuery({
    queryKey: ["All time leads", staffPage],
    queryFn: () => listleads({ page: staffPage }),
  });
  console.log("initialAllTimeLeadsData", initialAllTimeLeadsData)
  const {
    data: Staffsdata,
    isLoading: loading,
    isError: errors,
  } = useQuery({
    queryKey: ["List Staffs"],
    queryFn: liststaffs,
  });
  console.log("staffsData", Staffsdata)
  const { data: Taskdata } = useQuery({
    queryKey: ["Task Data"],
    queryFn: listtask,
  });
  console.log("Taskdata", Taskdata)
  // 2. Your fast Hash Map calculation
  const staffPerformanceData = useMemo(() => {
    const leads = initialAllTimeLeadsData?.leads || [];
    console.log("leads11", leads)
    const tasks = Taskdata?.task || [];
    const staffs = Staffsdata || [];

    const stats = new Map();

    for (const staff of staffs) {
      stats.set(staff._id, {
        ...staff,
        closedCount: 0,
        rejectedCount: 0,
        openCount: 0,
        completedTask: 0,
      });
    }
    console.log("leads", leads)
    for (const lead of leads) {
      console.log("leadsssss", lead.assignedTo, lead.updatedBy, lead.status)
      const assignedId = lead.assignedTo?._id;
      const updatedById = lead.updatedBy?._id;

      if (
        (lead.status === "closed" || lead.status === "converted") &&
        stats.has(assignedId)
      ) {
        stats.get(assignedId).closedCount += 1;
      }

      if (lead.status === "rejected" && stats.has(updatedById)) {
        stats.get(updatedById).rejectedCount += 1;
      }

      if (lead.status === "open" && stats.has(updatedById)) {
        stats.get(updatedById).openCount += 1;
      }
    }
    console.log("first");
    for (const task of tasks) {
      const staffId = task.updatedBy?._id;
      if (task.status === "completed" && stats.has(staffId)) {
        stats.get(staffId).completedTask += 1;
      }
    }

    return Array.from(stats.values());
  }, [Staffsdata, initialAllTimeLeadsData, Taskdata]);

  // 3. The JSX remains mostly the same
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 sm:gap-8"
    >
      {/* Staff Bar Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
        <div className="flex items-center gap-2 mb-4 border-b pb-2">
          <FaChartBar className="text-purple-500 text-lg sm:text-xl" />
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
            Staff-wise Lead Performance
          </h4>
        </div>
        <MonthlyLeadsChart
          type="staffs"
          leads={initialAllTimeLeadsData?.leads}
        />
      </div>

      {/* Staff Table */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg transition">
        <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Staff Performance (All Time)
        </h4>

        {loading || isLoadingAllTime ? (
          <Spinner />
        ) : errors || isErrorAllTime ? (
          <p className="text-red-500 text-sm sm:text-base">
            Error loading staff or leads data.
          </p>
        ) : Staffsdata && Staffsdata.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="min-w-full table-auto text-xs sm:text-sm">
                <thead className="bg-gradient-to-r from-[#00B5A6] to-[#1E6DB0] text-white font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Name
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Role
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Closed
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Rejected
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Open
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Tasks Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {staffPerformanceData.map((staff, index) => (
                    <tr
                      key={staff._id || index}
                      className="hover:bg-gray-50 transition border-b border-gray-200"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 truncate">
                        {staff.name || "N/A"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                        {staff.role || "N/A"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {staff.closedCount}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {staff.rejectedCount}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {staff.openCount}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {staff.completedTask}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm sm:text-base">
            No staff members found.
          </p>
        )}
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => setStaffPage((prev) => Math.max(prev - 1, 1))}
            disabled={staffPage === 1}
            className="px-4 py-2 mx-1 bg-gray-300 rounded-md"
          >
            Previous
          </button>
          <span className="px-4 py-2 mx-1">
            {staffPage} / {initialAllTimeLeadsData?.totalPages || 1}
          </span>
          <button
            onClick={() =>
              setStaffPage((prev) =>
                Math.min(prev + 1, initialAllTimeLeadsData?.totalPages || 1)
              )
            }
            disabled={
              staffPage === initialAllTimeLeadsData?.totalPages ||
              initialAllTimeLeadsData?.totalPages === 0
            }
            className="px-4 py-2 mx-1 bg-gray-300 rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default StaffReport;
