import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { subDays, format, isWithinInterval } from 'date-fns';
import { listleads } from '../services/leadsRouter';
import Spinner from './Spinner';

const AreaChartComponent = () => {
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['listleads'],
    queryFn: () => listleads({ all: true }),
  });

  const user = useSelector((state) => state.auth.user);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    const data = days.map(day => ({
      name: format(day, 'EEE'),
      open: 0,
      closed: 0,
    }));

    if (leadsData?.leads) {
      leadsData.leads.forEach(lead => {
        const leadDate = new Date(lead.createdAt);
        const isWithinWeek = isWithinInterval(leadDate, { start: subDays(new Date(), 6), end: new Date() });

        if (isWithinWeek) {
          const leadDay = format(leadDate, 'EEE');
          const dataPoint = data.find(d => d.name === leadDay);
          if (dataPoint) {
            const status = lead.status?.trim().toLowerCase();
            if (status === 'open') {
              dataPoint.open++;
            } else if (['closed', 'rejected', 'unavailable', 'converted'].includes(status)) {
              dataPoint.closed++;
            }
          }
        }
      });
    }
    return data;
  }, [leadsData, user]);

  const totalLeads = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.open + curr.closed, 0);
  }, [chartData]);


  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-2 sm:p-3 bg-white rounded-xl w-full h-full shadow-md">
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Lead Status Over Last 7 Days</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="open" stackId="1" stroke="#EAB308" fill="#EAB308" />
            <Area type="monotone" dataKey="closed" stackId="1" stroke="#EF4444" fill="#EF4444" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 sm:mt-3">
        <p className="text-base sm:text-lg font-medium text-gray-700">
          {`Total leads: ${totalLeads}`}
        </p>
      </div>
    </div>
  );
};

export default AreaChartComponent;