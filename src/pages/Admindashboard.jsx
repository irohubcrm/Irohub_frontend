import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import AreaChart from '../components/Areachart';
import MonthlyLeadsChart from '../components/BarChart';
import { motion } from 'framer-motion';
import { FaBars, FaChartBar, FaPhoneAlt, FaTasks, FaUser } from 'react-icons/fa';
import LeadSourceProgressChart from '../components/LeadSourceChart';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import LeadStatusDonutChart from '../components/DonutChart';
import { useSelector } from 'react-redux';
import { getDashboardStats } from '../services/dashboardRouter';
import Icons from './Icons';
import Spinner from '../components/Spinner';
import moment from 'moment';

function Admindashboard() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const userlogged = useSelector((state) => state.auth.user);
  const metadata = useSelector((state) => state.auth.metadataUser);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    retry: 3,
  });

  // Handle errors
  if (error) {
    console.error('Query error:', error);
    return <div className="p-4 text-red-600">Error loading data. Please try again.</div>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  const {
    weeklyLeads = [],
    monthlyLeads = [],
    leadStatus = [],
    leadSource = [],
    tasks = [],
    allTasks = [],
    totalLeads = 0,
    totalFollowups = 0,
    closedLeads = 0,
  } = dashboardData || {};

  const weeklyLeadsData = {
    labels: weeklyLeads.map(d => moment().day(d._id).format('ddd')),
    datasets: [
      { label: 'Opened', data: weeklyLeads.map(d => d.open_leads), backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgba(54, 162, 235, 1)', fill: true },
      { label: 'Closed', data: weeklyLeads.map(d => d.closed_leads), backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 99, 132, 1)', fill: true },
    ],
  };

  const monthlyLeadsData = {
    labels: monthlyLeads.map(d => moment().month(d._id - 1).format('MMM')),
    datasets: [
      { label: 'New Leads', data: monthlyLeads.map(d => d.new_leads), backgroundColor: 'rgba(54, 162, 235, 0.6)' },
      { label: 'Closed Leads', data: monthlyLeads.map(d => d.closed_leads), backgroundColor: 'rgba(255, 205, 86, 0.6)' },
    ],
  };

  const leadStatusData = leadStatus.map(s => ({ status: s._id, count: s.count }));

  const totalLeadSource = leadSource.reduce((acc, curr) => acc + curr.count, 0);
  const leadSourceData = leadSource.map(s => ({ ...s, percent: totalLeadSource > 0 ? (s.count / totalLeadSource * 100).toFixed(2) : 0 }));

  const completedTask = allTasks.filter(task => task.status === 'completed') || [];
  const assignedTask = tasks || [];
  const completedAssignedtask = tasks.filter(task => task.status === 'completed') || [];

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-x-hidden">
      <div className="fixed inset-y-0 left-0 z-40">
        <motion.div
          animate={{ x: sidebarVisible ? 0 : -260 }}
          transition={{ duration: 0.3 }}
          className="w-64 h-full fixed top-0 left-0 z-50"
        >
          <Sidebar />
        </motion.div>
      </div>

      <motion.div
        animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col (= h-screen"
      >

        <div className="relative flex justify-between items-start">
          <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 border-b border-gray-300">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
              <button
                className="mr-2 sm:mr-4 text-blue-600 hover:text-blue-800 transition"
                onClick={() => setSidebarVisible(!sidebarVisible)}
              >
                <FaBars className="text-lg sm:text-xl lg:text-2xl" />
              </button>
              Dashboard
            </h3>
          </div>
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50">
            <Icons />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {userlogged?.role !== 'Agent' ? (
              <Link to="/subadminreports">
                <motion.div
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FaChartBar className="text-blue-500 text-base sm:text-xl" />
                    </div>
                    <h4 className="text-sm sm:text-md font-medium text-gray-600">Lead</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-4">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{closedLeads}</h1>
                    <p className="text-xs sm:text-sm font-semibold text-gray-500">Closed</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Total <span className="text-blue-500">{totalLeads}</span> Lead
                  </p>
                </motion.div>
              </Link>
            ) : (
              <motion.div
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaChartBar className="text-blue-500 text-base sm:text-xl" />
                  </div>
                  <h4 className="text-sm sm:text-md font-medium text-gray-600">Lead</h4>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{closedLeads}</h1>
                  <p className="text-xs sm:text-sm font-semibold text-gray-500">Closed</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Total <span className="text-blue-500">{totalLeads}</span> Lead
                </p>
              </motion.div>
            )}

            <Link to="/followups">
              <motion.div
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaUser className="text-blue-500 text-base sm:text-xl" />
                  </div>
                  <h4 className="text-sm sm:text-md font-medium text-gray-600">FollowUp</h4>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{closedLeads}</h1>
                  <p className="text-xs sm:text-sm font-semibold text-gray-500">Completed</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Total <span className="text-blue-500">{totalFollowups}</span> FollowUp
                </p>
              </motion.div>
            </Link>

            <Link to="/tasks">
              <motion.div
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaPhoneAlt className="text-blue-500 text-base sm:text-xl" />
                  </div>
                  <h4 className="text-sm sm:text-md font-medium text-gray-600">Calls</h4>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">0</h1>
                  <p className="text-xs sm:text-sm font-semibold text-gray-500">Closed</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Total <span className="text-blue-500">0</span> Calls
                </p>
              </motion.div>
            </Link>

            {userlogged?.role === 'Admin' ? (
              <Link to="/tasks">
                <motion.div
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FaTasks className="text-blue-500 text-base sm:text-xl" />
                    </div>
                    <h4 className="text-sm sm:text-md font-medium text-gray-600">Task</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-4">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{completedTask.length}</h1>
                    <p className="text-xs sm:text-sm font-semibold text-gray-500">Completed</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Total <span className="text-blue-500">{allTasks.length}</span> Task
                  </p>
                </motion.div>
              </Link>
            ) : userlogged?.role === 'Sub-Admin' ? (
              <Link to="/subadmintasks">
                <motion.div
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FaTasks className="text-blue-500 text-base sm:text-xl" />
                    </div>
                    <h4 className="text-sm sm:text-md font-medium text-gray-600">Task</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-4">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{completedAssignedtask.length}</h1>
                    <p className="text-xs sm:text-sm font-semibold text-gray-500">Completed</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Total <span className="text-blue-500">{assignedTask.length}</span> Task
                  </p>
                </motion.div>
              </Link>
            ) : (
              <Link to="/agenttasks">
                <motion.div
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FaTasks className="text-blue-500 text-base sm:text-xl" />
                    </div>
                    <h4 className="text-sm sm:text-md font-medium text-gray-600">Task</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-4">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{completedAssignedtask.length}</h1>
                    <p className="text-xs sm:text-sm font-semibold text-gray-500">Completed</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Total <span className="text-blue-500">{assignedTask.length}</span> Task
                  </p>
                </motion.div>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <motion.div
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden min-h-[200px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Weekly Leads</h4>
              <div className="w-full h-auto">
                <AreaChart data={weeklyLeadsData} />
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden min-h-[200px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Monthly Leads</h4>
              <div className="w-full h-auto">
                <MonthlyLeadsChart data={monthlyLeadsData} type="monthly" />
              </div>
            </motion.div>

            {userlogged?.role === 'Admin' && !metadata && (
              <motion.div
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden min-h-[200px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Lead Source Chart</h4>
                <div className="w-full h-auto mt-30">
                  <LeadSourceProgressChart data={leadSourceData} />
                </div>
              </motion.div>
            )}

            <motion.div
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden min-h-[200px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Lead Status Chart</h4>
              <div className="w-full h-auto">
                <LeadStatusDonutChart data={leadStatusData} />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Admindashboard;