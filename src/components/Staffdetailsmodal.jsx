import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { closeStaffDetailModal } from '../redux/staffDetailModalSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faEnvelope, faPhone, faTasks, faClipboardList, faCheckCircle, faHourglassHalf, faChartLine, faUserTie, faUserCog } from '@fortawesome/free-solid-svg-icons';
import Spinner from './Spinner';
import { useQuery } from '@tanstack/react-query';
import { listleads } from '../services/leadsRouter';
import { listtask } from '../services/tasksRouter';
import { liststaffs } from '../services/staffRouter';

const StatCard = ({ icon, label, value, colorClass }) => (
  <motion.div
    whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
    className="bg-white p-5 rounded-xl shadow-md flex flex-col items-center text-center space-y-3 border border-gray-100 transition-all duration-200"
  >
    <div className={`p-4 rounded-full ${colorClass} bg-opacity-20`}>
      <FontAwesomeIcon icon={icon} className={`${colorClass} text-2xl`} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </motion.div>
);

function StaffDetailsModal() {
  const dispatch = useDispatch();
  const { isOpen, selectedStaffId } = useSelector((state) => state.staffDetailModal);

  const { data: staffData, isLoading: isStaffLoading } = useQuery({
    queryKey: ['staffDetails', selectedStaffId],
    queryFn: () => liststaffs().then(data => data.find(staff => staff._id === selectedStaffId)),
    enabled: isOpen && !!selectedStaffId,
  });

  const { data: leadsData, isLoading: isLeadsLoading } = useQuery({
    queryKey: ['allLeads', selectedStaffId],
    queryFn: () => listleads({ assignedTo: selectedStaffId }),
    enabled: isOpen && !!selectedStaffId,
  });

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['allTasks'],
    queryFn: listtask,
    enabled: isOpen,
  });

  const staffLeads = leadsData?.leads?.filter(lead => lead.assignedTo?._id === selectedStaffId) || [];

  const staffTasks = tasksData?.task?.filter(task => task.assignedTo === selectedStaffId) || [];

  const totalLeads = staffLeads.length;
  const newLeads = staffLeads.filter(lead => lead.status === 'new').length;
  const openLeads = staffLeads.filter(lead => lead.status === 'open').length;
  const convertedLeads = staffLeads.filter(lead => lead.status === 'converted').length;
  const rejectedLeads = staffLeads.filter(lead => lead.status === 'rejected').length;

  const totalTasks = staffTasks.length;
  const pendingTasks = staffTasks.filter(task => task.status === 'pending').length;
  const completedTasks = staffTasks.filter(task => task.status === 'completed').length;

  // Follow-ups data is not available via current APIs
  const totalFollowups = 'N/A';
  const convertedFollowups = 'N/A';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => dispatch(closeStaffDetailModal())}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-gray-100"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {(isStaffLoading || isLeadsLoading || isTasksLoading) && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-2xl z-10">
                <Spinner />
              </div>
            )}

            <button
              onClick={() => dispatch(closeStaffDetailModal())}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="flex items-center space-x-4 mb-8 pb-4 border-b border-gray-200">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg">
                <FontAwesomeIcon icon={staffData?.role === 'Agent' ? faUserTie : faUserCog} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{staffData?.name || 'Staff Details'}</h2>
                <p className="text-gray-500 text-lg">{staffData?.role}</p>
              </div>
            </div>

            {staffData ? (
              <div className="space-y-8">
                {/* Staff Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <p className="text-gray-700 text-lg"><FontAwesomeIcon icon={faEnvelope} className="mr-3 text-blue-500" /><strong>Email:</strong> {staffData?.email}</p>
                
                  <p className="text-gray-700 text-lg"><FontAwesomeIcon icon={faPhone} className="mr-3 text-green-500" /><strong>Mobile:</strong> {staffData?.mobile}</p>
                </div>

                {/* Assigned Agents (for Sub-Admins) */}

                {staffData?.role === 'Sub-Admin' && staffData?.assignedAgents?.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h5 className="text-xl font-semibold text-gray-700 mb-3">Assigned Agents ({staffData.assignedAgents.length})</h5>
                    <div className="flex flex-wrap gap-2">
                      {staffData.assignedAgents.map((agent) => (
                        <span key={agent._id} className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
                          {agent.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leads Statistics */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="text-xl font-semibold text-blue-800 mb-5 flex items-center"><FontAwesomeIcon icon={faChartLine} className="mr-3" />Leads Overview</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard icon={faClipboardList} label="Total Leads" value={totalLeads} colorClass="text-blue-600" />
                    <StatCard icon={faHourglassHalf} label="Open Leads" value={openLeads} colorClass="text-yellow-600" />
                    <StatCard icon={faCheckCircle} label="Converted Leads" value={convertedLeads} colorClass="text-green-600" />
                    <StatCard icon={faTimes} label="Rejected Leads" value={rejectedLeads} colorClass="text-red-600" />
                  </div>

                  {staffLeads.length > 0 && (
                    <div>
                      <h5 className="text-lg font-semibold text-blue-700 mb-3">Assigned Leads ({staffLeads.length})</h5>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {staffLeads.map(lead => (
                          <div key={lead._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">{lead.name}</p>
                              <p className="text-gray-600 text-sm">{lead.email} | {lead.mobile}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${lead.status === 'Converted' ? 'bg-green-100 text-green-800' : lead.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {lead.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tasks Statistics */}
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <h4 className="text-xl font-semibold text-purple-800 mb-5 flex items-center"><FontAwesomeIcon icon={faTasks} className="mr-3" />Tasks Overview</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard icon={faTasks} label="Total Tasks" value={totalTasks} colorClass="text-purple-600" />
                    <StatCard icon={faHourglassHalf} label="Pending Tasks" value={pendingTasks} colorClass="text-orange-600" />
                    <StatCard icon={faCheckCircle} label="Completed Tasks" value={completedTasks} colorClass="text-green-600" />
                  </div>

                  {staffTasks.length > 0 && (
                    <div>
                      <h5 className="text-lg font-semibold text-purple-700 mb-3">Assigned Tasks ({staffTasks.length})</h5>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {staffTasks.map(task => (
                          <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">{task.title}</p>
                              <p className="text-gray-600 text-sm">Updated At: {new Date(task.updatedAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Follow-ups Statistics */}
                <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
                  <h4 className="text-xl font-semibold text-teal-800 mb-5 flex items-center"><FontAwesomeIcon icon={faClipboardList} className="mr-3" />Follow-ups Overview</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <StatCard icon={faClipboardList} label="Total Follow-ups" value={totalFollowups} colorClass="text-indigo-600" />
                    <StatCard icon={faCheckCircle} label="Converted Follow-ups" value={convertedFollowups} colorClass="text-teal-600" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600 text-lg font-medium">No staff data available or selected.</p>
                <p className="text-gray-400 text-sm mt-2">Please select a staff member from the list to view their details.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StaffDetailsModal;
