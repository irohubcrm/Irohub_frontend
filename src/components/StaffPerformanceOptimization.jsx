
import React, { useMemo } from 'react';

const StaffPerformanceOptimization = () => {
  const staffList = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

  const leads = [
    { id: 1, assignedTo: 1, status: 'completed' },
    { id: 2, assignedTo: 1, status: 'pending' },
    { id: 3, assignedTo: 2, status: 'completed' },
    { id: 4, assignedTo: 2, status: 'completed' },
  ];

  const tasks = [
    { id: 1, assignedTo: 1, status: 'pending' },
    { id: 2, assignedTo: 1, status: 'completed' },
    { id: 3, assignedTo: 2, status: 'pending' },
    { id: 4, assignedTo: 2, status: 'pending' },
  ];

  // Before: O(M*N) complexity
  const beforeOptimization = useMemo(() => {
    return staffList.map(staff => {
      const staffLeads = leads.filter(l => l.assignedTo === staff.id);
      const staffTasks = tasks.filter(t => t.assignedTo === staff.id);
      const completedLeads = staffLeads.filter(l => l.status === 'completed');
      const pendingTasks = staffTasks.filter(t => t.status === 'pending');

      return {
        name: staff.name,
        totalLeads: staffLeads.length,
        completedLeads: completedLeads.length,
        pendingTasks: pendingTasks.length,
      };
    });
  }, [staffList, leads, tasks]);

  // After: O(M+N) complexity
  const afterOptimization = useMemo(() => {
    const performanceMap = new Map();

    // Initialize map with staff members
    staffList.forEach(staff => {
      performanceMap.set(staff.id, {
        name: staff.name,
        totalLeads: 0,
        completedLeads: 0,
        pendingTasks: 0,
      });
    });

    // Process leads in a single pass
    leads.forEach(lead => {
      if (performanceMap.has(lead.assignedTo)) {
        const staffData = performanceMap.get(lead.assignedTo);
        staffData.totalLeads++;
        if (lead.status === 'completed') {
          staffData.completedLeads++;
        }
      }
    });

    // Process tasks in a single pass
    tasks.forEach(task => {
      if (performanceMap.has(task.assignedTo)) {
        const staffData = performanceMap.get(task.assignedTo);
        if (task.status === 'pending') {
          staffData.pendingTasks++;
        }
      }
    });

    return Array.from(performanceMap.values());
  }, [staffList, leads, tasks]);

  return (
    <div>
      <h1>Staff Performance Optimization</h1>
      <h2>Before Optimization</h2>
      <pre>{JSON.stringify(beforeOptimization, null, 2)}</pre>
      <h2>After Optimization</h2>
      <pre>{JSON.stringify(afterOptimization, null, 2)}</pre>
    </div>
  );
};

export default StaffPerformanceOptimization;
