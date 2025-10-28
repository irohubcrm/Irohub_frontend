import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { listconvertedcustomers } from '../services/customersRouter';
import Spinner from './Spinner';

ChartJS.register(ArcElement, Tooltip, Legend);

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

  const chartData = {
    labels: [
      `Success: ${statusCount.success}`,
      `Failed: ${statusCount.failed}`,
      `Unknown: ${statusCount.unknown}`
    ],
    datasets: [
      {
        data: [
          statusCount.success,
          statusCount.failed,
          statusCount.unknown
        ],
        backgroundColor: ['#10B981', '#EF4444', '#6B7280'], // green, red, gray
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}`;
          }
        }
      }
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <p>Error loading chart.</p>;

  const total = statusCount.success + statusCount.failed + statusCount.unknown;
  if (total === 0) {
    return <p className="text-center text-gray-500">No customer status data available.</p>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-xl max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Customer Status</h2>
      <div className="w-full flex justify-center">
        <div className="w-64 h-64">
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default CustomerStatusPieChart;
