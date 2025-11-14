import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './Sidebar';
import AreaChart from '../components/Areachart';
import MonthlyLeadsChart from '../components/BarChart';
import { motion } from 'framer-motion';
import { FaBars, FaChartBar, FaPhoneAlt, FaTasks, FaUser } from 'react-icons/fa';
import LeadSourceProgressChart from '../components/LeadSourceChart';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import LeadStatusDonutChart from '../components/DonutChart';
import { useSelector } from 'react-redux';
import { listleads } from '../services/leadsRouter';
import { listtask } from '../services/tasksRouter';
import Icons from './Icons';
import Spinner from '../components/Spinner';

function Admindashboard() {
  const queryClient = useQueryClient();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const userlogged = useSelector((state) => state.auth.user);
  const metadata = useSelector((state) => state.auth.metadataUser);

  // Invalidate queries on mount
  useEffect(() => {
    queryClient.invalidateQueries(['List leads']);
    queryClient.invalidateQueries(['List tasks']);
  }, [queryClient]);

  const { data: leads, isLoading: leadsLoading, error: leadsError } = useQuery({
    queryKey: ['List leads'],
    queryFn: listleads,
    retry: 3,
  });

  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['List tasks'],
    queryFn: listtask,
    retry: 3,
  });

  // Handle errors
  if (leadsError || tasksError) {
    console.error('Query error:', leadsError || tasksError);
    return <div className="p-4 text-red-600">Error loading data. Please try again.</div>;
  }

  const totalFollowups = useMemo(() => {
    return leads?.leads?.length ? leads.leads.filter(lead => lead.status === 'open') : [];
  }, [leads]);
  const closedLeads = useMemo(() => {
    return leads?.leads?.length
      ? leads.leads.filter(
          lead =>
            ['closed', 'converted', 'rejected'].includes(lead.status) &&
            (lead.updatedBy?._id === userlogged?.id || lead.updatedBy === userlogged?.id)
        )
      : [];
  }, [leads, userlogged]);
  const completedTask = useMemo(() => {
    return tasks?.task?.length ? tasks.task.filter(task => task.status === 'completed') : [];
  }, [tasks]);
  const assignedTask = useMemo(() => {
    return tasks?.task?.length
      ? tasks.task.filter(task => task.assignedTo === userlogged?.id)
      : [];
  }, [tasks, userlogged]);
  const completedAssignedtask = useMemo(() => {
    return tasks?.task?.length
      ? tasks.task.filter(
          task => task.status === 'completed' && task.assignedTo === userlogged?.id && task.updatedBy === userlogged?.id
        )
      : [];
  }, [tasks, userlogged]);

  const isDataLoading = leadsLoading || tasksLoading;

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
        {isDataLoading && <Spinner />}
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
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{closedLeads.length}</h1>
                    <p className="text-xs sm:text-sm font-semibold text-gray-500">Closed</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Total <span className="text-blue-500">{leads?.leads?.length || 0}</span> Lead
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
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{closedLeads.length}</h1>
                  <p className="text-xs sm:text-sm font-semibold text-gray-500">Closed</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Total <span className="text-blue-500">{leads?.leads?.length || 0}</span> Lead
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
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{closedLeads.length}</h1>
                  <p className="text-xs sm:text-sm font-semibold text-gray-500">Completed</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Total <span className="text-blue-500">{totalFollowups.length}</span> FollowUp
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
                    Total <span className="text-blue-500">{tasks?.task?.length || 0}</span> Task
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
                <AreaChart />
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
                <MonthlyLeadsChart type="monthly" />
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
                  <LeadSourceProgressChart />
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
                <LeadStatusDonutChart />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Admindashboard;