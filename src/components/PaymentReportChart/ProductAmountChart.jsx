import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductSetting } from '../../services/settingservices/productSettingRouter';
import {  getpaymentDetailsed } from '../../services/paymentstatusRouter';

// ✅ Progress bar component
function ProgressChartBar({ value, max }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}

export default function ProductProgressChart() {
  // 🧩 Fetch products
  const {
    data: productData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProductSetting,
  });

  // 🧩 Fetch all payment details
  const { data: paymentData } = useQuery({
    queryKey: ['allPayments'],
    queryFn: getpaymentDetailsed,
  });

  if (isLoading) return <div className="p-4">Data is Loading.........</div>;
  if (isError) return <div className="p-4 text-red-600">Data is Error......</div>;


  // ✅ Step 1: Extract arrays safely
  const products = productData?.Products || [];
  const payments = paymentData?.allPayment || [];

  // ✅ Step 2: Group payment totals by product ID
  const paymentMap = payments.reduce((acc, pay) => {
    const pid = pay.product;
    if (!acc[pid]) {
      acc[pid] = { totalAmount: 0, totalPaid: 0 };
    }
    acc[pid].totalAmount += pay.totalAmount || 0;
    acc[pid].totalPaid += pay.totalPaid || 0;
    return acc;
  }, {});

  // ✅ Step 3: Merge products with payments
  const mergedProducts = products.map((prod) => {
    const p = paymentMap[prod._id] || { totalAmount: 0, totalPaid: 0 };
    return {
      ...prod,
      amount: p.totalAmount,
      paidAmount: p.totalPaid,
    };
  });

  // ✅ Step 4: Calculate overall totals
  const overallTotal = mergedProducts.reduce((sum, item) => sum + (item.amount || 0), 0);
  const overallPaid = mergedProducts.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
  const overallPercentage =
    overallTotal > 0 ? Math.round((overallPaid / overallTotal) * 100) : 0;

  // ✅ Step 5: Render UI
  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Product Payment Progress Chart</h2>

        {/* Overall summary */}
        <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-indigo-800">
              Total Payments Collected
            </span>
            <span className="text-xl font-extrabold text-indigo-700">{overallPercentage}%</span>
          </div>
          <ProgressChartBar value={overallPaid} max={overallTotal} />
          <p className="text-sm text-gray-500 mt-2 text-right">
            ₹{overallPaid.toLocaleString()} collected out of ₹{overallTotal.toLocaleString()}
          </p>
        </div>

        {/* Per product progress */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Product Wise Progress
          </h3>

          {mergedProducts.length === 0 && (
            <div className="text-gray-500 text-sm italic">No product payment data available.</div>
          )}

          {mergedProducts.map((item) => {
            const paidPercentage =
              item.amount > 0 ? Math.round(((item.paidAmount || 0) / item.amount) * 100) : 0;
            const statusText =
              paidPercentage === 100
                ? 'Paid in Full'
                : paidPercentage > 0
                ? 'Partial Payment'
                : 'Pending';

            return (
              <div
                key={item._id}
                className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-lg"
              >
                <div className="col-span-4 flex flex-col">
                  <span className="font-medium text-gray-700 capitalize">{item.title}</span>
                  <span
                    className={`text-xs font-semibold ${
                      paidPercentage === 100
                        ? 'text-green-600'
                        : paidPercentage > 0
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {statusText}
                  </span>
                </div>

                <div className="col-span-6">
                  <ProgressChartBar value={item.paidAmount || 0} max={item.amount || 0} />
                </div>

                <div className="col-span-2 text-right">
                  <span className="text-sm font-bold text-gray-600">{paidPercentage}%</span>
                  <p className="text-xs text-gray-500">
                    ₹{(item.amount - (item.paidAmount || 0)).toLocaleString()} due
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
