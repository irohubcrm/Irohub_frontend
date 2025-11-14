import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import {
  FaAddressBook,
  FaBars,
  FaChevronDown,
  FaEdit,
  FaUserCircle,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleaddtasksmodal,
  toggleViewedittaskmodal,
  toggleViewtasksmodal,
} from "../redux/modalSlice";
import Addtaskmodal from "../components/Addtaskmodal";
import Viewtasksmodal from "../components/Viewtasksmodal";
import VieweditTaskmodal from "../components/VieweditTaskmodal";
import { liststaffs } from "../services/staffRouter";
import Icons from "./Icons";
import Spinner from "../components/Spinner";

function Admintasks() {
  const [selectedRole, setselectedRole] = useState("Sub-Admin");
  const [sidebarVisible, setsidebarVisible] = useState(true);
  const isTaskmodal = useSelector((state) => state.modal.addtasksmodal);
  const isViewtaskmodal = useSelector((state) => state.modal.viewtasksModal);
  const isViewedittaskmodal = useSelector(
    (state) => state.modal.viewedittaskModal
  );
  const dispatch = useDispatch();

  const fetchstaffs = useQuery({
    queryKey: ["listagents"],
    queryFn: liststaffs,
  });

  const filteredStaff = fetchstaffs?.data?.filter(
    (staff) => staff.role === selectedRole
  );

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
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

      {/* Main content */}
      <motion.div
        animate={{ x: sidebarVisible ? 256 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <button
              className="mr-3 text-blue-600 hover:text-blue-800 transition"
              onClick={() => setsidebarVisible(!sidebarVisible)}
            >
              <FaBars className="text-2xl" />
            </button>
            Tasks
          </h3>
          <div className="flex justify-end">
            <Icons />
          </div>
        </div>

        {/* Filter + Add Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedRole}
              onChange={(e) => setselectedRole(e.target.value)}
              className="w-full sm:w-auto appearance-none outline-0 bg-blue-600 text-white px-4 py-2 pr-10 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 transition"
            >
              <option className="bg-white text-blue-600" value="Sub-Admin">
                Subadmin
              </option>
              <option className="bg-white text-blue-600" value="Agent">
                Agent
              </option>
            </select>
            <div className="pointer-events-none text-white absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaChevronDown />
            </div>
          </div>

          <button
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-md shadow hover:from-blue-700 hover:to-blue-600 transition"
            onClick={() => dispatch(toggleaddtasksmodal())}
          >
            <FaAddressBook className="inline-block mr-2" />
            Add Tasks
          </button>
        </div>

        {/* Staff Cards */}
        {fetchstaffs.isLoading ? (
          <Spinner />
        ) : filteredStaff?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff, index) => (
              <motion.div
                key={staff._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 group relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-blue-600 text-[80px] sm:text-[100px] lg:text-[120px]">
                    {staff.profileImage ? (
                      <img
                        src={staff.profileImage}
                        alt="Profile image"
                        className="w-[120px] h-[120px] rounded-full  border-2 border-[#00B5A6] object-contain"
                      />
                    ) : (
                      <FaUserCircle />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm sm:text-base truncate w-40">
                      {staff.name}
                    </h4>
                    <p className="text-sm text-gray-500 capitalize">
                      {staff.role}
                    </p>
                    <div className="flex flex-col gap-2 items-end">
                      <button
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="Edit Tasks"
                        onClick={() => dispatch(toggleViewedittaskmodal(staff))}
                      >
                        <FaEdit className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    className="w-full flex items-center justify-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-xl font-medium transition hover:bg-blue-600 hover:text-white"
                    onClick={() => dispatch(toggleViewtasksmodal(staff._id))}
                  >
                    <FaAddressBook />
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center text-lg py-6">
            No staff members available
          </p>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isTaskmodal && (
          <motion.div
            key="addtask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            <div className="relative z-10">
              <Addtaskmodal />
            </div>
          </motion.div>
        )}
        {isViewtaskmodal && (
          <motion.div
            key="viewtask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            <div className="relative z-10">
              <Viewtasksmodal />
            </div>
          </motion.div>
        )}
        {isViewedittaskmodal && (
          <motion.div
            key="edittask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            <div className="relative z-10">
              <VieweditTaskmodal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Admintasks;
