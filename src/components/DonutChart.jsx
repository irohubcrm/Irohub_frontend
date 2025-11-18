import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { startOfMonth, isAfter, isEqual } from 'date-fns';
import { listleads } from '../services/leadsRouter';
import Spinner from './Spinner';

const statusColors = {
  new: '#3B82F6',
  open: '#EAB308',
  converted: '#10B981',
  walkin: '#A855F7',
  paused: '#F97316',
  rejected: '#EF4444',
  unavailable: '#6B7280',
};

const LeadStatusDonutChart = () => {
  const user = useSelector((state) => state.auth.user);

  const { data: leadsData, isLoading, isError, error } = useQuery({
    queryKey: ['listleads'], // Changed query key to be more specific
    queryFn: () => listleads({ all: true }), // Assuming the service can fetch all leads
    enabled: !!user,
  });

  const statusCounts = useMemo(() => {
    const counts = {
      new: 0,
      open: 0,
      converted: 0,
      walkin: 0,
      paused: 0,
      rejected: 0,
      unavailable: 0,
    };

    if (leadsData?.leads) {
      const currentMonth = startOfMonth(new Date());
      leadsData.leads.forEach(lead => {
        const leadDate = new Date(lead.createdAt); // or updatedAt
        if (isAfter(leadDate, currentMonth) || isEqual(leadDate, currentMonth)) {
          const status = lead.status?.trim().toLowerCase();
          if (counts.hasOwnProperty(status)) {
            counts[status]++;
          }
        }
      });
    }
    return counts;
  }, [leadsData]);

  const chartData = useMemo(() => {
    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(entry => entry.value > 0);
  }, [statusCounts]);

  if (isLoading) return <Spinner />;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div className="p-4 sm:p-6 bg-white shadow rounded-xl w-full max-w-full sm:max-w-xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
        Lead Status Overview (This Month)
      </h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mt-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1 sm:py-1 rounded-lg shadow-sm border"
          >
            <div
              className="w-2 sm:w-3 h-6 sm:h-8 rounded-sm"
              style={{ backgroundColor: statusColors[status] }}
            ></div>
            <div className="flex justify-between items-center w-full">
              <span className="capitalize text-xs sm:text-sm font-medium text-gray-700">
                {status}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-700">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadStatusDonutChart;