import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { listleads } from '../services/leadsRouter';
import { listleadsourcesettings } from '../services/settingservices/leadSourceSettingsRouter';
import { liststaffs } from '../services/staffRouter';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import Spinner from './Spinner';

const MonthlyLeadsChart = ({ type = 'monthly' }) => {
  const { data: leadsData, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['listleads', { all: true }],
    queryFn: () => listleads({ all: true }),
  });

  const { data: sourceData, isLoading: isLoadingSources } = useQuery({
    queryKey: ['List source'],
    queryFn: listleadsourcesettings,
    enabled: type === 'source',
  });

  const { data: staffData, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['List staff'],
    queryFn: liststaffs,
    enabled: type === 'staffs',
  });

  const chartData = useMemo(() => {
    if (!leadsData?.leads) return [];

    const now = new Date();
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => subMonths(now, i)).reverse();

    if (type === 'monthly') {
      return lastSixMonths.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthLeads = leadsData.leads.filter(lead => isWithinInterval(new Date(lead.createdAt), { start: monthStart, end: monthEnd }));
        
        return {
          name: format(month, 'MMM'),
          'New Leads': monthLeads.filter(l => l.status === 'new').length,
          'Closed Leads': monthLeads.filter(l => ['closed', 'converted', 'rejected'].includes(l.status)).length,
        };
      });
    }

    if (type === 'source') {
      if (!sourceData?.getLeadsource) return [];
      const sourceMap = {};
      sourceData.getLeadsource.forEach(s => { sourceMap[s._id] = s.title; });

      const counts = {};
      leadsData.leads.forEach(lead => {
        if (lead.source && sourceMap[lead.source]) {
          const sourceName = sourceMap[lead.source];
          counts[sourceName] = (counts[sourceName] || 0) + 1;
        }
      });
      return Object.entries(counts).map(([name, value]) => ({ name, 'Leads': value }));
    }

    if (type === 'staffs') {
        if (!staffData?.staffs) return [];
        const closedStatuses = ['closed', 'converted', 'rejected'];
        const counts = {};
        staffData.staffs.forEach(s => { counts[s.name] = 0; });
  
        leadsData.leads.forEach(lead => {
          if (lead.assignedTo?.name && closedStatuses.includes(lead.status)) {
            counts[lead.assignedTo.name] = (counts[lead.assignedTo.name] || 0) + 1;
          }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, 'Closed Leads': value }));
      }

    return [];
  }, [leadsData, sourceData, staffData, type]);

  const isLoading = isLoadingLeads || (type === 'source' && isLoadingSources) || (type === 'staffs' && isLoadingStaff);

  if (isLoading) {
    return <Spinner />;
  }

  const renderBars = () => {
    if (type === 'monthly') {
      return [
        <Bar key="new" dataKey="New Leads" fill="#36A2EB" />,
        <Bar key="closed" dataKey="Closed Leads" fill="#FFCD56" />
      ];
    }
    if (type === 'source') {
      return <Bar dataKey="Leads" fill="#4BC0C0" />;
    }
    if (type === 'staffs') {
        return <Bar dataKey="Closed Leads" fill="#FF6384" />;
    }
    return null;
  }

  return (
    <div className="p-2 sm:p-3 bg-white rounded-xl w-full shadow-md">
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">
        {type === 'source' ? 'Lead Sources Overview'
          : type === 'staffs' ? 'Leads Closed by Staff'
            : 'Monthly Leads Overview'}
      </h2>
      <div style={{ width: '100%', height: 450 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {renderBars()}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyLeadsChart;