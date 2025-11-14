import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import {
  FaBars,
  FaChevronDown,
  FaEdit,
  FaInfoCircle,
  FaTrash,
  FaUserAlt,
  FaUserCircle,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleAssignleadsmodal,
  toggleAssignteamsmodal,
  togglestaffeditmodal,
  togglestaffmodal,
} from "../redux/modalSlice";
import { openStaffDetailModal } from "../redux/staffDetailModalSlice";
import Assignleadsmodal from "../components/Assignleadsmodal";
import Staffmodel from "../components/Staffmodel";
import Staffeditmodal from "../components/Staffeditmodal";
import Adminassignteams from "../components/Adminassignteams";
import StaffDetailsModal from "../components/Staffdetailsmodal";
import { AnimatePresence, motion } from "framer-motion";
import { deletestaff, liststaffs, getallagents } from "../services/staffRouter";
import Icons from "./Icons";
import Spinner from "../components/Spinner";


function Stafflist() {
  const dispatch = useDispatch();
  const queryclient = useQueryClient();
  const isAssignteamsmodal = useSelector(
    (state) => state.modal.assignteamsModal
  );
  const isAssignleadsmodal = useSelector(
    (state) => state.modal.assignleadsModal
  );
  const isStaffmodal = useSelector((state) => state.modal.staffmodal);
  const isStaffeditmodal = useSelector((state) => state.modal.staffeditmodal);

  const [selectedRole, setselectedRole] = useState("Sub-Admin");
  const [sidebarVisible, setsidebarVisible] = useState(true);
  const [showReassignModal, setshowReassignModal] = useState(false);
  const [statussucceess, setstatussuccess] = useState(false);
  const [selectedStaffid, setselectedStaffid] = useState(null);
  const [newAgentId, setnewAgentId] = useState(null);

  const fetchstaffs = useQuery({
    queryKey: ["listagents"],
    queryFn: liststaffs,
  });

  const fetchAllAgents = useQuery({
    queryKey: ["listallagents"],
    queryFn: getallagents,
  });

  const deletestaffs = useMutation({
    mutationKey: ["Deletestaffs"],
    mutationFn: deletestaff,
    onSuccess: () => {
      queryclient.invalidateQueries(["listagents"]);
    },
  });

  const handleconfirm = (staffId) => {
    setselectedStaffid(staffId);
    setshowReassignModal(true);
  };

  const closeconfirm = () => {
    setselectedStaffid(null);
    setshowReassignModal(false);
  };

  const confirmDeleteAndReassign = async () => {
    if (!newAgentId) {
      // Handle case where no new agent is selected
      return;
    }
    await deletestaffs.mutateAsync({ staffId: selectedStaffid, newAgentId });
    setshowReassignModal(false);
    setstatussuccess(true);
    setselectedStaffid(null);
    setnewAgentId(null);
    setTimeout(() => {
      setstatussuccess(false);
    }, 2000);
  };

  const filteredStaff = useMemo(() => {
    return fetchstaffs?.data?.filter(
      (staff) => staff.role === selectedRole
    );
  }, [fetchstaffs.data, selectedRole]);


  return (
    <div className="flex min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 overflow-x-hidden">
      <div className="fixed inset-y-0 left-0 z-40">
        <motion.div
          animate={{ x: sidebarVisible ? 0 : -260 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-64 h-full fixed top-0 left-0 z-50 shadow-2xl"
        >
          <Sidebar />
        </motion.div>
      </div>
      <motion.div
        animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8"
      >
        {deletestaffs.isPending && <Spinner />}
        <div className="flex flex-col h-full max-w-7xl mx-auto">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 lg:mb-10 flex items-center">
            <button
              className="mr-3 sm:mr-4 text-indigo-600 hover:text-indigo-800 transition-transform duration-200 hover:scale-110"
              onClick={() => setsidebarVisible(!sidebarVisible)}
            >
              <FaBars className="text-xl sm:text-2xl lg:text-3xl" />
            </button>
            Staff Management
          </h3>
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50">
            <Icons />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedRole}
                onChange={(e) => setselectedRole(e.target.value)}
                className="appearance-none bg-indigo-600 text-white px-4 sm:px-5 py-2.5 pr-10 sm:pr-12 rounded-full shadow-md focus:ring-4 focus:ring-indigo-200 focus:outline-none transition-all duration-200 w-full sm:w-48 text-sm sm:text-base font-medium hover:bg-indigo-700"
                aria-label="Select staff role"
              >
                <option className="bg-white text-indigo-600" value="Sub-Admin">
                  Subadmin
                </option>
                <option className="bg-white text-indigo-600" value="Agent">
                  Agent
                </option>
              </select>
              <div className="pointer-events-none text-white absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                <FaChevronDown className="text-sm sm:text-base" />
              </div>
            </div>

            <button
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 sm:px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 w-full sm:w-auto text-sm sm:text-base font-medium"
              onClick={() => dispatch(togglestaffmodal())}
            >
              <FaUserPlus /> Add Staff
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-220px)] lg:max-h-[calc(100vh-250px)] pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {fetchstaffs.isLoading ? (
                <Spinner />
              ) : filteredStaff?.length > 0 ? (
                filteredStaff.map((staff, index) => (
                  <motion.div
                    key={staff._id}
                    className="bg-white relative z-10 rounded-2xl shadow-xl p-5 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, ease: "easeOut" }}
                  >
                    <div className="grid grid-cols-3 gap-2 text-center text-sm font-medium text-gray-600 mb-4">
                      <div className="p-2 bg-gray-50 rounded-md">Leads: {staff.leadCount || 0}</div>
                      <div className="p-2 bg-gray-50 rounded-md">FollowUps: {staff.followupCount || 0}</div>
                      {staff.role === "Sub-Admin" && (
                        <div className="p-2 bg-gray-50 rounded-md">Agents: {staff?.assignedAgents?.length || 0}</div>
                      )}
                    </div>

  
                    <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-100 bg-gray-50 p-3 rounded-b-2xl -mx-6 -mb-6">
                      <button
                        onClick={() => dispatch(openStaffDetailModal(staff._id))}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
                        aria-label={`View details for ${staff.name}`}
                      >
                        <FaInfoCircle className="text-xl" />
                      </button>
                      <button
                        onClick={() => dispatch(togglestaffeditmodal(staff))}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors duration-200"
                        aria-label={`Edit ${staff.name}`}
                      >
                        <FaEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleconfirm(staff._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                        aria-label={`Delete ${staff.name}`}
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-4 sm:space-x-5 mt-6">
                      <div className="text-indigo-600 text-[80px] sm:text-[100px] lg:text-[110px]">
                        {staff.profileImage ? (
                          <img
                            src={staff.profileImage}
                            alt={`${staff.name}'s profile image`}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-indigo-100 object-cover"
                          />
                        ) : (
                          <FaUserCircle className="w-24 h-24 sm:w-28 sm:h-28" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate w-36 sm:w-44">
                          {staff.name}
                        </h4>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base font-medium">
                          {staff.role}
                        </p>
                      </div>
                    </div>

                    {staff.role === "Sub-Admin" &&
                      staff?.assignedAgents?.length > 0 && (
                        <div className="absolute top-14 sm:top-16 right-3 sm:right-4 z-50">
                          <div className="group relative inline-block">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center cursor-pointer shadow-lg ring-2 ring-white hover:scale-105 transition-transform duration-200">
                              <FaInfoCircle className="text-base" />
                            </div>
                            <div className="absolute right-0 top-full mt-2 w-64 bg-indigo-600/95 border border-indigo-300 rounded-xl shadow-2xl p-4 text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto scale-95 group-hover:scale-100 transform transition-all duration-300 ease-in-out">
                              <div className="absolute -top-2 right-4 w-4 h-4 bg-indigo-600 rotate-45 border-l border-t border-indigo-300 shadow-md"></div>
                              <ul className="space-y-3">
                                {staff?.assignedAgents?.map((agent, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-3"
                                  >
                                    <FaUserAlt className="text-white mt-1 text-base" />
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-sm truncate w-48">
                                        {agent.name}
                                      </span>
                                      <span className="text-xs text-gray-200 italic">
                                        {agent.role}
                                      </span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="mt-6 flex flex-col gap-3">
                      {staff.role === "Sub-Admin" && (
                        <button
                          onClick={() =>
                            dispatch(toggleAssignteamsmodal(staff))
                          }
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 transition-all duration-200 ring-2 ring-transparent hover:ring-indigo-200"
                        >
                          Assign Teams
                        </button>
                      )}
                      <button
                        onClick={() =>
                          dispatch(toggleAssignleadsmodal(staff._id))
                        }
                        className="w-full border-2 border-indigo-500 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-500 hover:text-white transition-all duration-200 text-sm sm:text-base font-medium"
                      >
                        Assign Leads
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-600 col-span-full text-base sm:text-lg font-medium">
                  No staff members available
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {isAssignteamsmodal && (
          <motion.div
            key="assign-teams"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-gray-900"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <Adminassignteams />
            </div>
          </motion.div>
        )}
        {isAssignleadsmodal && (
          <motion.div
            key="assign-leads"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gray-900"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <Assignleadsmodal />
            </div>
          </motion.div>
        )}
        {isStaffmodal && (
          <motion.div
            key="staff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-gray-900"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <Staffmodel />
            </div>
          </motion.div>
        )}
        {isStaffeditmodal && (
          <motion.div
            key="staff-edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-gray-900"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <Staffeditmodal />
            </div>
          </motion.div>
        )}
        {showReassignModal && (
          <motion.div
            className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-center w-full max-w-xs sm:max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Reassign Leads
              </h3>
              <p className="text-gray-600 mb-4">
                Select a new agent to reassign the leads to.
              </p>
              <select
                onChange={(e) => setnewAgentId(e.target.value)}
                className="appearance-none bg-indigo-600 text-white px-4 sm:px-5 py-2.5 pr-10 sm:pr-12 rounded-full shadow-md focus:ring-4 focus:ring-indigo-200 focus:outline-none transition-all duration-200 w-full sm:w-48 text-sm sm:text-base font-medium hover:bg-indigo-700"
              >
                <option value="">Select an agent</option>
                {fetchAllAgents.data?.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={confirmDeleteAndReassign}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-all duration-200 text-sm sm:text-base font-medium shadow-md"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={closeconfirm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-full transition-all duration-200 text-sm sm:text-base font-medium shadow-md"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {statussucceess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-gray-900 opacity-40" />
            <motion.div
              className="relative z-10 bg-green-100 text-green-900 px-8 sm:px-10 py-5 rounded-2xl shadow-2xl text-sm sm:text-base font-semibold w-full max-w-xs sm:max-w-sm flex items-center justify-center text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              ✅ Staff deleted successfully!
            </motion.div>
          </motion.div>
        )}
        <StaffDetailsModal />
      </AnimatePresence>
    </div>
  );
}

export default Stafflist;
