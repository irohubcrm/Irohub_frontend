import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { listconvertedcustomers } from '../../services/customersRouter';
import Spinner from '../Spinner';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

const PaymentDonutChart = () => {
  const { data: allCustomers, isLoading, error } = useQuery({
    queryKey: ['listCustomer', 'all'],
    queryFn: () => listconvertedcustomers({ all: true }), // Assuming the service can fetch all customers
    staleTime: 5 * 60 * 1000,
  });

  const paymentStatusCount = useMemo(() => {
    if (!allCustomers?.customers) return {};
    return allCustomers.customers.reduce((acc, customer) => {
      const status = customer.payment || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [allCustomers]);

  const chartData = useMemo(() => {
    return Object.entries(paymentStatusCount).map(([name, value]) => ({ name, value }));
  }, [paymentStatusCount]);

  const totalCustomers = useMemo(() => {
    return allCustomers?.customers?.length || 0;
  }, [allCustomers]);

  if (isLoading) return <Spinner />;
  if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6 bg-white shadow rounded-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        Payment Status Distribution
      </h2>
      <div className="text-center text-lg font-medium text-gray-600 mb-6">
        Total Customers: {totalCustomers}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(paymentStatusCount).map(([status, count], index) => (
            <div
              key={status}
              className="p-4 rounded-lg text-white text-center"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            >
              <strong className="block text-lg">{status}</strong>
              <span className="text-xl font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PaymentDonutChart);