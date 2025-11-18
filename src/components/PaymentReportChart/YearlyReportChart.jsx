import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getpaymentDetailsed } from '../../services/paymentstatusRouter';
import Spinner from '../Spinner';

export default function YearlyReportChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['paymentDetails'],
    queryFn: getpaymentDetailsed,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-red-500">Error loading chart data</p>;

  const payments = data?.allPayment || [];

  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

  const chartData = years.map(year => {
    const yearPayments = payments.filter(p => new Date(p.createdAt).getFullYear() === year);
    const totalPaid = yearPayments.reduce((acc, p) => acc + (p.totalPaid || 0), 0);
    const totalAmount = yearPayments.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
    return {
      name: year,
      'Total Paid': totalPaid,
      'Total Amount': totalAmount,
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Yearly Payment Performance
      </h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="Total Paid" fill="#3b82f6" />
            <Bar dataKey="Total Amount" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
