import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { listconvertedcustomers } from '../services/customersRouter';
import Spinner from './Spinner';

const COLORS = {
  success: '#10B981',
  failed: '#EF4444',
  unknown: '#6B7280',
};

const CustomerStatusPieChart = () => {
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['Getting Customers'],
    queryFn: listconvertedcustomers
  });

  // Count statuses: success, failed, unknown
  const statusCount = {
    success: 0,
    failed: 0,
    unknown: 0
  };

  const customerList = Array.isArray(customers?.customers) ? customers.customers : [];

  customerList.forEach(customer => {
    const status = customer.status?.title?.trim().toLowerCase();
    if (status === 'success') statusCount.success++;
    else if (status === 'failed') statusCount.failed++;
    else statusCount.unknown++;
  });

  const chartData = [
    { name: 'Success', value: statusCount.success },
    { name: 'Failed', value: statusCount.failed },
    { name: 'Unknown', value: statusCount.unknown },
  ].filter(entry => entry.value > 0);


  if (isLoading) return <Spinner />;
  if (error) return <p>Error loading chart.</p>;

  const total = statusCount.success + statusCount.failed + statusCount.unknown;
  if (total === 0) {
    return <p className="text-center text-gray-500">No customer status data available.</p>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-xl max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Customer Status</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomerStatusPieChart;
