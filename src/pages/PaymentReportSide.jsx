import Icons from "./Icons";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";
import PaymentDonutCHart from "../components/PaymentReportChart/PaymentDonutCHart";
import PaymentReportmodal from "../components/PaymentReportChart/PaymentReportmodal";
import MonthlyPaymentChart from "../components/PaymentReportChart/MonthlyPaymentChart";
import YearlyReportChart from "../components/PaymentReportChart/YearlyReportChart";
 
function Paymentreports() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activesettings, setactivesettings] = useState("paymentdonutChart");

  // Menu items configuration
  const menuItems = [
    { key: "paymentreport", label: "Payment Overview" },
    { key: "monthlypaymentChart", label: "Monthly" },
    { key: "yearlyreportchart", label: "Yearly" },
  ];

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <motion.div
          animate={{ x: sidebarVisible ? 0 : -256 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 h-full w-64 z-40 bg-white shadow-md"
        >
          <Sidebar />
        </motion.div>

        {/* Main content */}
        <motion.div
          animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {/* Header */}
          <div className="relative flex justify-between items-start bg-white border-b border-gray-200">
            <div className="p-4 sm:p-6 lg:p-8 flex-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <button
                  className="mr-3 text-blue-600 hover:text-blue-800 transition p-2 rounded-lg hover:bg-blue-50"
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                >
                  <FaBars className="text-xl" />
                </button>
                Payment Reports
              </h3>
            </div>
            
            {/* Top Icons */}
            <div className="p-4">
              <Icons />
            </div>
          </div>

          {/* TOP TABS MENU */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap gap-1 max-w-full overflow-x-auto">
              {menuItems.map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => setactivesettings(item.key)}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200
                    ${
                      activesettings === item.key
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                    }
                  `}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {item.label}
                </motion.button>
              ))}
            </div>
  
            {/* Active Tab Indicator */}
            <div className="h-0.5 bg-gradient-to-r from-blue-600 to-blue-700 mt-2 rounded-full transition-all duration-300">
              <motion.div
                className="h-full bg-white rounded-full"
                animate={{
                  width: `${100 / menuItems.length}%`,
                  x: `${menuItems.findIndex(item => item.key === activesettings) * (100 / menuItems.length)}%`
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activesettings === "paymentdonutChart" && <PaymentDonutCHart />}
              {activesettings === "paymentreport" && <PaymentReportmodal />}
              {activesettings === "monthlypaymentChart" && <MonthlyPaymentChart />}
              {activesettings === "yearlyreportchart" && <YearlyReportChart />}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Paymentreports;
