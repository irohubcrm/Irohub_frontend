import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import MonthlyLeadsChart from '../components/BarChart';
import { motion } from 'framer-motion';
import { FaBars, FaChartBar, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import LeadStatusPieChart from '../components/PieChart';
import { useQuery } from '@tanstack/react-query';
import PolarAreaChart from '../components/PolarAreaChart';
import CustomerStatusPieChart from '../components/CustomerStatusPieChart';
import { listleads } from '../services/leadsRouter';
import { liststaffs } from '../services/staffRouter';
import { listtask } from '../services/tasksRouter';
import { listconvertedcustomers } from '../services/customersRouter';
import Icons from './Icons';
import Spinner from '../components/Spinner';
import { useSelector } from 'react-redux';
import PaymentDonutCHart from '../components/PaymentReportChart/PaymentDonutCHart';

function Subadminreports() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activereports, setactivereports] = useState('lead');
  const [allLeads, setAllLeads] = useState([]); // Current month leads
  const [allTimeLeads, setAllTimeLeads] = useState([]); // All-time leads
  const [isFetchingAll, setIsFetchingAll] = useState(true);
  const [isFetchingAllTime, setIsFetchingAllTime] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const user = useSelector((state)=>state.auth.user)

  // Compute current month for filtering
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const monthFilter = `${currentYear}-${currentMonth}`;

  // Fetch the first page of leads for the current month
  const { data: 
    initialLeadsData, 
    isLoading,
     isError } = useQuery({
    queryKey: ['Monthly leads', monthFilter, 1],
    queryFn: () => listleads({ page: 1, month: monthFilter }),
  });

  // Fetch the first page of all-time leads
  const { data:
     initialAllTimeLeadsData, isLoading: isLoadingAllTime, isError: isErrorAllTime } = useQuery({
    queryKey: ['All time leads', 1],
    queryFn: () => listleads({ page: 1 }), // No month filter
  });

  // Fetch all pages of leads for the current month
  useEffect(() => {
    const fetchAllLeads = async () => {
      if (!initialLeadsData || !initialLeadsData.leads) return;

      setIsFetchingAll(true);
      let allFetchedLeads = [...initialLeadsData.leads];
      const totalPages = initialLeadsData.totalPages || 1;

      for (let page = 2; page <= totalPages; page++) {
        try {
          const response = await listleads({ page, month: monthFilter });
          if (response.leads && Array.isArray(response.leads)) {
            allFetchedLeads = [...allFetchedLeads, ...response.leads];
          }
        } catch (error) {
          console.error(`Error fetching page ${page} for current month:`, error);
        }
      }

      // Client-side validation to ensure only current month's leads
      const filteredByMonth = allFetchedLeads.filter((lead) => {
        const createdAt = new Date(lead.createdAt);
        return (
          createdAt.getFullYear() === currentYear &&
          String(createdAt.getMonth() + 1).padStart(2, '0') === currentMonth
        );
      });

      setAllLeads(filteredByMonth);
      setIsFetchingAll(false);
    };

    if (!isLoading && !isError && initialLeadsData) {
      fetchAllLeads();
    }
  }, [initialLeadsData, isLoading, isError, currentYear, currentMonth]);

  // Fetch all pages of all-time leads
  useEffect(() => {
    const fetchAllTimeLeads = async () => {
      if (!initialAllTimeLeadsData || !initialAllTimeLeadsData.leads) return;

      setIsFetchingAllTime(true);
      let allFetchedLeads = [...initialAllTimeLeadsData.leads];
      const totalPages = initialAllTimeLeadsData.totalPages || 1;

      for (let page = 2; page <= totalPages; page++) {
        try {
          const response = await listleads({ page });
          if (response.leads && Array.isArray(response.leads)) {
            allFetchedLeads = [...allFetchedLeads, ...response.leads];
          }
        } catch (error) {
          console.error(`Error fetching page ${page} for all-time leads:`, error);
        }
      }

      setAllTimeLeads(allFetchedLeads);
      setIsFetchingAllTime(false);
    };

    if (!isLoadingAllTime && !isErrorAllTime && initialAllTimeLeadsData) {
      fetchAllTimeLeads();
    }
  }, [initialAllTimeLeadsData, isLoadingAllTime, isErrorAllTime]);

  const { data: Staffsdata, isLoading: loading, isError: errors } = useQuery({
    queryKey: ['List Staffs'],
    queryFn: liststaffs,
  });

  const { data: Taskdata } = useQuery({
    queryKey: ['Task Data'],
    queryFn: listtask,
  });

  const { data: Customerdata } = useQuery({
    queryKey: ['Customer Data'],
    queryFn: listconvertedcustomers,
  });

  const activecustomers = Customerdata?.customers?.filter((customer) => customer?.isActive === true).length || 0;
  const inactivecustomers = Customerdata?.customers?.filter((customer) => customer?.isActive === false).length || 0;

  // Filter leads based on search query (for current month leads table)
  const filteredLeads = allLeads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.mobile?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen w-full bg-gray-100 overflow-x-hidden">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40">
        <motion.div
          animate={{ x: sidebarVisible ? 0 : -260 }}
          transition={{ duration: 0.3 }}
          className="w-64 h-full fixed top-0 left-0 z-50"
        >
          <Sidebar />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col min-h-screen overflow-hidden"
      >
        {/* Header */}
        <div className="relative flex flex-col sm:flex-row justify-between items-start p-4 sm:p-6 bg-gray-100 border-b border-gray-300">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0 flex items-center">
            <button
              className="mr-4 text-blue-600 hover:text-blue-800 transition"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              <FaBars className="text-lg sm:text-xl" />
            </button>
            Reports
          </h3>
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50">
            <Icons />
          </div>
        </div>

        {/* Chart Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
            {['lead', 'staff', 'customer'].map((type) => (
              <button
                key={type}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold cursor-pointer text-sm sm:text-base ${
                  activereports === type ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setactivereports(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {activereports === 'lead' && (
            <div className="flex flex-col gap-6 sm:gap-8 w-full">
              {/* Charts */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2">
                    <FaChartBar className="text-blue-500 text-lg sm:text-xl" />
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800">Lead Sources</h4>
                  </div>
                  <MonthlyLeadsChart type="source" leads={allLeads} />
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                  <LeadStatusPieChart leads={allLeads} />
                </div>
              </motion.div>

              {/* Table */}
              <motion.div
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Leads for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h4>
                  <input
                    type="text"
                    placeholder="Search by name, email, or mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>

                {(isLoading || isFetchingAll) ? (
                  <Spinner />
                ) : isError ? (
                  <p className="text-red-500 text-sm sm:text-base">Error loading leads data.</p>
                ) : filteredLeads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="min-w-full table-auto text-xs sm:text-sm">
                        <thead className="bg-gradient-to-r from-[#00B5A6] to-[#1E6DB0] text-white font-semibold sticky top-0 z-10">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Name</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Email</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Phone</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Status</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Created</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Source</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Assigned To</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-800">
                          {filteredLeads.map((lead, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 transition border-b border-gray-200"
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3 truncate">{lead.name || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 truncate">{lead.email || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">{lead.mobile || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    lead.status === 'converted'
                                      ? 'bg-green-100 text-green-700'
                                      : lead.status === 'open'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : lead.status === 'rejected'
                                      ? 'bg-red-100 text-red-700'
                                      : lead.status === 'closed'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {lead.status || 'N/A'}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {lead.createdAt
                                  ? new Date(lead.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize truncate">
                                {lead?.source?.title || 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize truncate">
                                {lead?.assignedTo?.name || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base">No leads added in this month.</p>
                )}
              </motion.div>
            </div>
          )}

          {activereports === 'staff' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6 sm:gap-8"
            >
              {/* Staff Bar Chart */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                  <FaChartBar className="text-purple-500 text-lg sm:text-xl" />
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-800">Staff-wise Lead Performance</h4>
                </div>
                <MonthlyLeadsChart type="staffs" leads={allTimeLeads} />
              </div>

              {/* Staff Table */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg transition">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Staff Performance (All Time)
                </h4>

                {(loading || isFetchingAllTime) ? (
                  <Spinner />
                ) : errors || isErrorAllTime ? (
                  <p className="text-red-500 text-sm sm:text-base">Error loading staff or leads data.</p>
                ) : Staffsdata && Staffsdata.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="min-w-full table-auto text-xs sm:text-sm">
                        <thead className="bg-gradient-to-r from-[#00B5A6] to-[#1E6DB0] text-white font-semibold sticky top-0 z-10">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Name</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Role</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Closed</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Rejected</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Open</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Tasks Completed</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-800">
                          {Staffsdata.map((staff, index) => {
                            const closedCount = allTimeLeads.filter(
                              (lead) =>
                                (lead.status === 'closed' || lead.status === 'converted') &&
                                lead.assignedTo?._id === staff._id
                            ).length || 0;

                            const rejectedCount = allTimeLeads.filter(
                              (lead) => lead.status === 'rejected' && lead.updatedBy?._id === staff._id
                            ).length || 0;

                            const openCount = allTimeLeads.filter(
                              (lead) => lead.status === 'open' && lead.updatedBy?._id === staff._id
                            ).length || 0;

                            const completedTask = Taskdata?.task?.filter(
                              (task) => task.status === 'completed' && task.updatedBy?._id === staff._id
                            ).length || 0;

                            return (
                              <tr
                                key={staff._id || index}
                                className="hover:bg-gray-50 transition border-b border-gray-200"
                              >
                                <td className="px-2 sm:px-4 py-2 sm:py-3 truncate">{staff.name || 'N/A'}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">{staff.role || 'N/A'}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3">{closedCount}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3">{rejectedCount}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3">{openCount}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3">{completedTask}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base">No staff members found.</p>
                )}
              </div>
            </motion.div>
          )}

          {activereports === 'customer' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6 sm:gap-8 w-full"
            >
              {/* Charts Section */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2">
                    <FaChartBar className="text-indigo-500 text-lg sm:text-xl" />
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800">Customer Category Overview</h4>
                  </div>
                  {/* <PolarAreaChart /> */}
                  <PaymentDonutCHart/>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2">
                    <FaChartBar className="text-pink-500 text-lg sm:text-xl" />
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800">Customer Status Distribution</h4>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-black text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                      <FaUserPlus className="text-green-400 text-xl sm:text-2xl" />
                      <div>Active: {activecustomers}</div>
                    </div>
                    <div className="bg-black text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                      <FaUserMinus className="text-red-400 text-xl sm:text-2xl" />
                      <div>Inactive: {inactivecustomers}</div>
                    </div>
                  </div>
                  <div className="max-w-full mx-auto">
                    <CustomerStatusPieChart />
                  </div>
                </div>
              </motion.div>

              {/* Customer List Table Section */}
              <motion.div
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Customer List</h4>

                {isLoading ? (
                  <Spinner />
                ) : isError ? (
                  <p className="text-red-500 text-sm sm:text-base">Error loading customer data.</p>
                ) : Customerdata && Customerdata.customers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full table-auto text-xs sm:text-sm">
                        <thead className="bg-gradient-to-r from-[#00B5A6] to-[#1E6DB0] text-white font-semibold sticky top-0 z-10">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Name</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Email</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Phone</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Customer Add Date</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Payment Status</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Customer Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-800">
                          {Customerdata.customers.map((customer, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 transition border-b border-gray-200"
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3 truncate">{customer.name || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 truncate">{customer.email || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">{customer.mobile || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {customer.createdAt
                                  ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    customer.payment === 'paid'
                                      ? 'bg-green-100 text-green-700'
                                      : customer.payment === 'partially paid'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  
                                  {customer.payment || 'N/A'}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    customer.status === 'success'
                                      ? 'bg-green-100 text-green-700'
                                      : customer.status === 'failed'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
            
                                  {customer.status?.title || 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base">No customers found.</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Subadminreports;