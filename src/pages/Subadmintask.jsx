import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { FaAddressBook, FaBars, FaEdit, FaUserCircle } from "react-icons/fa";
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
import { listagents } from "../services/staffRouter";
import { listtask, updatetaskstatus } from "../services/tasksRouter";
import Icons from "./Icons";
import Spinner from "../components/Spinner";

function Subadmintask() {
  const [activetask, setactivetask] = useState("staffs");
  const [sidebarVisible, setsidebarVisible] = useState(true);
  const [statussuccessmodal, setstatussuccessmodal] = useState(false);

  const dispatch = useDispatch();
  const queryclient = useQueryClient();

  const isTaskmodal = useSelector((state) => state.modal.addtasksmodal);
  const isViewtaskmodal = useSelector((state) => state.modal.viewtasksModal);
  const isViewedittaskmodal = useSelector(
    (state) => state.modal.viewedittaskModal
  );
  const userlogged = useSelector((state) => state.auth.user);
  const metadata = useSelector((state) => state.auth.metadataUser);

  const fetchstaffs = useQuery({
    queryKey: ["listagents"],
    queryFn: listagents,
  });

  const fetchtasks = useQuery({
    queryKey: ["List tasks"],
    queryFn: listtask,
  });

  const updatingtaskstatus = useMutation({
    mutationKey: ["Update Task Status"],
    mutationFn: updatetaskstatus,
    onSuccess: () => {
      queryclient.invalidateQueries(["Update Task Status"]);
    },
  });

  const handlestatuschange = async (taskId, status) => {
    await updatingtaskstatus.mutateAsync({ taskId, status });
    setstatussuccessmodal(true);
    setTimeout(() => setstatussuccessmodal(false), 2000);
  };

  const userId = metadata ? metadata._id : userlogged.id;
  const filteredStaffs = fetchstaffs?.data?.filter(
    (staff) => staff.assignedTo === userId
  );
  const filteredtasks = fetchtasks?.data?.task?.filter(
    (task) => task.assignedTo === userId
  );

  return (
    <div className="flex min-h-screen w-screen bg-gradient-to-br from-blue-500 via-red-500  to-red-100 overflow-x-hidden">
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

      {/* Main Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 p-6 sm:p-10 overflow-y-auto"
      >
        {(fetchstaffs.isLoading ||
          fetchtasks.isLoading ||
          updatingtaskstatus.isLoading) && <Spinner />}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between mb-10"
        >
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-800 flex items-center gap-3">
            <button
              className="text-blue-600 hover:text-blue-800 transition"
              onClick={() => setsidebarVisible(!sidebarVisible)}
            >
              <FaBars className="text-xl" />
            </button>
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
              Task Manager
            </span>
          </h3>
          <div className="flex justify-end">
            <Icons />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
          <div className="flex gap-4">
            {["staffs", "tasks"].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                  activetask === tab
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setactivetask(tab)}
              >
                {tab === "staffs" ? "Staffs" : "Tasks"}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Section */}
        {activetask === "staffs" ? (
          fetchstaffs.isLoading ? (
            <p className="text-center text-blue-600 font-medium py-6">
              Loading staff...
            </p>
          ) : filteredStaffs?.length > 0 ? (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
              initial="hidden"
              animate="show"
              className="w-1/3 flex justify-center"
            >
              <div className="grid gap-4 sm:gap-4 grid-cols-3  w-[600px] justify-items-center">
                {filteredStaffs.map((staff) => (
                  <motion.div
                    key={staff._id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2 p-6 flex flex-col items-center w-[260px] sm:w-[280px]"
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="flex flex-col items-center">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-blue-600 text-[90px] mb-3 drop-shadow-md"
                      >
                        {staff.profileImage ? (
                          <img
                            src={staff.profileImage}
                            alt="Profile"
                            className="w-[100px] h-[100px] rounded-full border-4 border-blue-500 object-cover shadow-md"
                          />
                        ) : (
                          <FaUserCircle />
                        )}
                      </motion.div>
                      <h4 className="text-lg font-bold text-gray-800 text-center">
                        {staff.name}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize text-center">
                        {staff.role}
                      </p>
                    </div>

                    {!metadata && (
                      <div className="flex justify-end w-full mt-3">
                        <button
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="Edit Tasks"
                          onClick={() =>
                            dispatch(toggleViewedittaskmodal(staff))
                          }
                        >
                          <FaEdit className="text-lg" />
                        </button>
                      </div>
                    )}

                    <div className="mt-4 w-full">
                      <button
                        className="w-full flex items-center justify-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-xl font-medium transition-all hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200"
                        onClick={() =>
                          dispatch(toggleViewtasksmodal(staff._id))
                        }
                      >
                        <FaAddressBook />
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <p className="text-gray-500 text-center text-base sm:text-lg py-6">
              No staff members available
            </p>
          )
        ) : fetchtasks.isLoading ? (
          <p className="text-center text-blue-600 font-medium py-6">
            Loading tasks...
          </p>
        ) : filteredtasks?.length > 0 ? (
          <div className="overflow-x-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg max-w-[1200px] mx-auto border border-gray-100">
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
                  <th className="px-5 py-3 text-sm font-bold">#</th>
                  <th className="px-5 py-3 text-sm font-bold">Name</th>
                  <th className="px-5 py-3 text-sm font-bold">Deadline</th>
                  <th className="px-5 py-3 text-sm font-bold">
                    Task Description
                  </th>
                  <th className="px-5 py-3 text-sm font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredtasks.map((task, index) => (
                  <motion.tr
                    key={task._id}
                    className="border-t border-gray-200 hover:bg-blue-50 transition-all"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {task.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-5 py-4 text-gray-600 capitalize text-sm">
                      {task.description}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                        value={task.status}
                        onChange={(e) =>
                          handlestatuschange(task._id, e.target.value)
                        }
                      >
                        <option value="pending" className="text-yellow-600">
                          Pending
                        </option>
                        <option value="completed" className="text-green-600">
                          Completed
                        </option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6 text-base sm:text-lg">
            No tasks assigned to you yet.
          </p>
        )}

        {/* Floating Add Task Button (FAB) */}
        {!metadata && (
          <motion.button
            onClick={() => dispatch(toggleaddtasksmodal())}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-300 hover:shadow-blue-400 rounded-full p-4 sm:p-5 flex items-center justify-center z-50 transition-all duration-300"
          >
            <FaAddressBook className="text-2xl sm:text-3xl" />
          </motion.button>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isTaskmodal && (
          <ModalWrapper>
            <Addtaskmodal />
          </ModalWrapper>
        )}
        {isViewtaskmodal && (
          <ModalWrapper>
            <Viewtasksmodal />
          </ModalWrapper>
        )}
        {isViewedittaskmodal && (
          <ModalWrapper>
            <VieweditTaskmodal />
          </ModalWrapper>
        )}
        {statussuccessmodal && (
          <StatusToast message="✅ Status updated successfully!" />
        )}
      </AnimatePresence>
    </div>
  );
}

/* Reusable Modal Wrapper */
const ModalWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 bg-black backdrop-blur-sm"
    />
    <div className="relative z-10 w-full max-w-4xl mx-4">{children}</div>
  </motion.div>
);

/* Status Toast */
const StatusToast = ({ message }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    <motion.div className="absolute inset-0 bg-black opacity-30" />
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative z-10 bg-white/90 backdrop-blur-lg text-green-700 border border-green-300 shadow-xl px-6 py-6 rounded-2xl text-lg font-semibold w-[90%] sm:w-[400px] flex items-center justify-center text-center"
    >
      {message}
    </motion.div>
  </motion.div>
);

export default Subadmintask;
