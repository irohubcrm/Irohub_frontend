import React, { useState } from "react"; // 1. Added useState
import { useQuery } from "@tanstack/react-query";
import { listconvertedcustomers } from "../services/customersRouter";
import { motion } from "framer-motion"; // 2. Added all missing imports
import { FaBars, FaChartBar, FaUserMinus, FaUserPlus } from "react-icons/fa";
import CustomerStatusPieChart from "../components/CustomerStatusPieChart";
import PaymentDonutCHart from "../components/PaymentReportChart/PaymentDonutCHart";
import Spinner from "../components/Spinner";

const CustomerReport = () => {
  // 3. All logic is now INSIDE the component
  const [customerPage, setCustomerPage] = useState(1);

  const {
    data: Customerdata,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["Customer Data", customerPage],
    // 4. Make sure your service passes the page
    queryFn: () => listconvertedcustomers({ page: customerPage }),
  });

  // 5. (LOGIC FIX) Get the total counts from the API response
  // The old way was wrong (counting only the current page)
  const activecustomers = Customerdata?.totalActive || 0;
  const inactivecustomers = Customerdata?.totalInactive || 0;

  // 6. Removed the redundant `activereports === 'customer'` check
  // The parent component is already handling that.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 sm:gap-8 w-full"
    >
      {/* Charts Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <FaChartBar className="text-indigo-500 text-lg sm:text-xl" />
            <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
              Customer Category Overview
            </h4>
          </div>
          {/* <PolarAreaChart /> */}
          <PaymentDonutCHart />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <FaChartBar className="text-pink-500 text-lg sm:text-xl" />
            <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
              Customer Status Distribution
            </h4>
          </div>
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-black text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
              <FaUserPlus className="text-green-400 text-xl sm:text-2xl" />
              {/* This now shows the TRUE total */}
              <div>Active: {activecustomers}</div>
            </div>
            <div className="bg-black text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
              <FaUserMinus className="text-red-400 text-xl sm:text-2xl" />
              {/* This now shows the TRUE total */}
              <div>Inactive: {inactivecustomers}</div>
            </div>
          </div>
          <div className="max-w-full mx-auto">
            <CustomerStatusPieChart />
          </div>
        </div>
      </motion.div>

      {/* Customer List Table Section */}
      <motion.div
        className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Customer List
        </h4>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <p className="text-red-500 text-sm sm:text-base">
            Error loading customer data.
          </p>
        ) : Customerdata && Customerdata.customers.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full table-auto text-xs sm:text-sm">
                <thead className="bg-gradient-to-r from-[#00B5A6] to-[#1E6DB0] text-white font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Name
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Email
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Phone
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Customer Add Date
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Payment Status
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Customer Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {Customerdata.customers.map((customer, index) => (
                    <tr
                      // 7. (RELIABILITY FIX) Use the unique ID for the key
                      key={customer._id}
                      className="hover:bg-gray-50 transition border-b border-gray-200"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 truncate">
                        {customer.name || "N/A"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 truncate">
                        {customer.email || "N/A"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {customer.mobile || "N/A"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            customer.payment === "paid"
                              ? "bg-green-100 text-green-700"
                              : customer.payment === "partially paid"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {customer.payment || "N/A"}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            customer.status === "success"
                              ? "bg-green-100 text-green-700"
                              : customer.status === "failed"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {customer.status?.title || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm sm:text-base">
            No customers found.
          </p>
        )}
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => setCustomerPage((prev) => Math.max(prev - 1, 1))}
            disabled={customerPage === 1}
            className="px-4 py-2 mx-1 bg-gray-300 rounded-md"
          >
            Previous
          </button>
          <span className="px-4 py-2 mx-1">
            {customerPage} / {Customerdata?.totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCustomerPage((prev) =>
                Math.min(prev + 1, Customerdata?.totalPages || 1)
              )
            }
            disabled={
              customerPage === Customerdata?.totalPages ||
              Customerdata?.totalPages === 0
            }
            className="px-4 py-2 mx-1 bg-gray-300 rounded-md"
          >
            Next
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomerReport;