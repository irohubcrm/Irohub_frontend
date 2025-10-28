// frontend/src/components/PaymentReportmodal.tsx
import React from "react";
import MonthlyPaymentChart from "./MonthlyPaymentChart";
import YearlyReportChart from "./YearlyReportChart";
import PaymentDonutCHart from "./PaymentDonutCHart";
import ProductProgressChart from "./ProductAmountChart";
 // Corrected capitalization

const PaymentReportmodal= () => {
  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-6 text-center">
      
      </h2>

      {/* Charts Section */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Monthly Report */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
       
          </h3>
          <div className="overflow-x-auto">
            <MonthlyPaymentChart />
          </div>
        </div>

        {/* Yearly Report */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
          
          </h3>
          <div className="overflow-x-auto">
            <YearlyReportChart />
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
        
          </h3>
          <div className="overflow-x-auto">
            <ProductProgressChart />
          </div>
        </div>

        {/* Payment Donut */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
     
          </h3>
          <div className="overflow-x-auto">
            <PaymentDonutCHart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReportmodal;