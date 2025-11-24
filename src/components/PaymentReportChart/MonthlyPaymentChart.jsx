import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getpaymentDetailsed } from '../../services/paymentstatusRouter';
import Spinner from '../Spinner';

export default function MonthlyPaymentChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['paymentDetails'],
    queryFn: getpaymentDetailsed,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-red-500">Error loading chart data</p>;

  const payments = data?.allPayment || [];

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const chartData = months.map((month, index) => {
    const monthPayments = payments.filter(p => new Date(p.createdAt).getMonth() === index);
    const totalPaid = monthPayments.reduce((acc, p) => acc + (p.totalPaid || 0), 0);
    const totalAmount = monthPayments.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
    return {
      name: month,
      'Total Paid': totalPaid,
      'Total Amount': totalAmount,
    };
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mt-5 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Monthly Payment Report
      </h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            <Legend />
            <Line type="monotone" dataKey="Total Paid" stroke="#2563eb" strokeWidth={3} />
            <Line type="monotone" dataKey="Total Amount" stroke="#f59e0b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}