import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import Customerdetailmodal from "../components/Customerdetailmodal";
import {
  deletemultipleleads,
  listopencustomers,
  updateleadstatus,
  updatepriority,
} from "../services/leadsRouter";
import Icons from "./Icons";
import { liststaffs } from "../services/staffRouter";
import Spinner from "../components/Spinner";
import { Trash2 } from "lucide-react";
import { toggleCustomerdetailmodal } from "../redux/modalSlice";

function Subadminfollowups() {
  const queryclient = useQueryClient();
  const dispatch = useDispatch();
  const iscustomerdetailmodal = useSelector(
    (state) => state.modal.customerdetailModal
  );
  const role = useSelector((state) => state.auth.role);
  const metadata = useSelector((state) => state.auth.metadataUser);

  const [sidebarVisible, setsidebarVisible] = useState(true);
  const [statussuccessmodal, setstatussuccessmodal] = useState(false);
  const [showsearch, setshowsearch] = useState(false);
  const [priorityfilter, setpriorityfilter] = useState("Priority");
  const [assignedfilter, setassignedfilter] = useState("AssignedTo");
  const [leadvaluefilter, setleadvaluefilter] = useState("Sort By");
  const [datefilter, setdatefilter] = useState("Date");
  const [selectdatefilter, setselectdatefilter] = useState(null);
  const [daterangefilter, setdaterangefilter] = useState({
    start: null,
    end: null,
  });
  const [searchText, setsearchText] = useState("");
  const [currentpage, setcurrentpage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const leadsperpage = 10;

  const { data: fetchopencustomers, isLoading } = useQuery({
    queryKey: [
      "Opencustomers",
      currentpage,
      priorityfilter,
      assignedfilter,
      searchText,
      datefilter,
      selectdatefilter,
      daterangefilter,
      leadvaluefilter,
    ],
    queryFn: () =>
      listopencustomers({
        page: currentpage,
        limit: leadsperpage,
        priority: priorityfilter !== "Priority" ? priorityfilter : undefined,
        assignedTo:
          assignedfilter !== "AssignedTo" ? assignedfilter : undefined,
        searchText,
        date: datefilter !== "Date" ? datefilter : undefined,
        startDate:
          datefilter === "custom" && selectdatefilter
            ? selectdatefilter.toISOString()
            : datefilter === "range" && daterangefilter.start
            ? daterangefilter.start.toISOString()
            : undefined,
        endDate:
          datefilter === "range" && daterangefilter.end
            ? daterangefilter.end.toISOString()
            : undefined,
        sortBy: leadvaluefilter !== "Sort By" ? leadvaluefilter : undefined,
      }),
    keepPreviousData: true,
  });

  const fetchstaffs = useQuery({
    queryKey: ["List staffs"],
    queryFn: liststaffs,
  });

  const updatingpriority = useMutation({
    mutationKey: ["Updatepriority"],
    mutationFn: updatepriority,
    onSuccess: () => {
      queryclient.invalidateQueries(["Opencustomers"]);
    },
  });

  const updatingleadstatus = useMutation({
    mutationKey: ["Updateleadstatus"],
    mutationFn: updateleadstatus,
    onSuccess: () => {
      queryclient.invalidateQueries(["Opencustomers"]);
    },
  });
  

  const deleteLeadsMutation = useMutation({
    mutationKey: ["Delete leads"],
    mutationFn: deletemultipleleads,
    onSuccess: () => {
      queryclient.invalidateQueries(["Opencustomers"]);
      setSelectedLeads([]);
      setstatussuccessmodal(true);
      setTimeout(() => {
        setstatussuccessmodal(false);
      }, 2000);
    },
    onError: (error) => {
      console.error("Delete leads error:", error);
      alert(
        "Failed to delete leads: " +
          (error.response?.data?.message || error.message)
      );
    },
  });

  const handleleadchange = async (leadId, status) => {
    await updatingleadstatus.mutateAsync({ leadId, status });
    setstatussuccessmodal(true);
    setTimeout(() => {
      setstatussuccessmodal(false);
    }, 2000);
  };

  const handlepriority = async (customerId, priority) => {
    await updatingpriority.mutateAsync({ customerId, priority });
    setstatussuccessmodal(true);
    setTimeout(() => {
      setstatussuccessmodal(false);
    }, 2000);
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.length > 0) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    await deleteLeadsMutation.mutateAsync({ leadIds: selectedLeads });
    setShowDeleteConfirm(false);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
  };

  const totalLeads = fetchopencustomers?.totalLeads || 0;
  const totalPages = fetchopencustomers?.totalPages || 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setcurrentpage(page);
      setSelectedLeads([]); // Clear selections when changing pages
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex overflow-x-hidden bg-gray-50">
      {/* Sidebar */}
      <motion.div
        animate={{ x: sidebarVisible ? 0 : -260 }}
        transition={{ duration: 0.3 }}
        className="w-64 h-full fixed top-0 left-0 z-50"
      >
        <Sidebar />
      </motion.div>

      {/* Main Content */}
      <motion.div
        animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 h-screen overflow-y-auto"
      >
        {fetchstaffs.isLoading && <Spinner />}
        {updatingleadstatus.isPending && <Spinner />}
        {updatingpriority.isPending && <Spinner />}
        {deleteLeadsMutation.isPending && <Spinner />}
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-white shadow sticky top-0 z-30 border-b">
            <div className="flex items-center mb-4 sm:mb-0">
              <button
                className="mr-2 sm:mr-4 text-blue-600 hover:text-blue-800 transition"
                onClick={() => setsidebarVisible(!sidebarVisible)}
              >
                <FaBars className="text-lg sm:text-xl md:text-2xl" />
              </button>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Follow-ups
              </h3>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Icons />
            </div>
          </div>

          <div className="flex justify-between items-center p-4">
            {/* Left side: Filters */}
            <div className="flex flex-wrap gap-3">





              {/* priority set */}
              <select
                value={priorityfilter}
                onChange={(e) => setpriorityfilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200 hover:border-blue-400"
              >
                <option>Priority</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="Not Assigned">Not Assigned</option>
              </select>
              {role === "Admin" && (
                <select
                  value={assignedfilter}
                  onChange={(e) => setassignedfilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200 hover:border-blue-400"
                >
                  <option value="AssignedTo">Assigned To</option>
                  {fetchstaffs?.data?.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              )}
              <select
                value={leadvaluefilter}
                onChange={(e) => setleadvaluefilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200 hover:border-blue-400"
              >
                <option value="Sort By">Lead Value</option>
                <option value="ascleadvalue">Lead Value ↑</option>
                <option value="descleadvalue">Lead Value ↓</option>
              </select>
              <select
                value={datefilter}
                onChange={(e) => setdatefilter(e.target.value)}
                className="min-w-[140px] px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all hover:border-blue-400"
              >
                <option value="Date">Date</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="custom">Search from date</option>
                <option value="range">Search from range of date</option>
              </select>
              {datefilter === "custom" && (
                <input
                  type="date"
                  onChange={(e) =>
                    setselectdatefilter(new Date(e.target.value))
                  }
                  className="px-4 py-2 rounded-lg border border-gray-300"
                />
              )}
              {datefilter === "range" && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    onChange={(e) =>
                      setdaterangefilter({
                        ...daterangefilter,
                        start: new Date(e.target.value),
                      })
                    }
                    className="px-4 py-2 rounded-lg border border-gray-300"
                  />
                  <input
                    type="date"
                    onChange={(e) =>
                      setdaterangefilter({
                        ...daterangefilter,
                        end: new Date(e.target.value),
                      })
                    }
                    className="px-4 py-2 rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Right side: Search */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {showsearch && (
                  <motion.input
                    key="search-input"
                    type="text"
                    value={searchText}
                    onChange={(e) => setsearchText(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 font-medium bg-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-40 sm:w-56"
                    placeholder="Search..."
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
              <button
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                onClick={() => setshowsearch(!showsearch)}
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-grow p-4 sm:p-6 bg-gray-100">
            <div className="flex justify-end mb-4 gap-2">
              {selectedLeads.length > 0 && role !== "Agent" && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-shadow shadow-md"
                >
                  <Trash2 size={18} />
                  Delete Selected
                </motion.button>
              )}
            </div>
            {isLoading ? (
              <Spinner />
            ) : fetchopencustomers?.leads?.length > 0 ? (
              <>
                <div className="overflow-x-auto w-full bg-white p-3 sm:p-4 rounded-xl shadow-lg">
                  <div className="max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
                    <table className="w-full table-auto border-collapse text-xs sm:text-sm min-w-[800px]">
                      <thead className="sticky top-0 bg-gradient-to-r from-[#00B5A6] to-[#1E6DB0] text-white text-xs sm:text-sm uppercase z-10">
                        <tr>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            {role !== "Agent" && (
                              <input
                                type="checkbox"
                                checked={
                                  selectedLeads.length ===
                                    fetchopencustomers?.leads?.length &&
                                  fetchopencustomers?.leads?.length > 0
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLeads(
                                      fetchopencustomers.leads.map(
                                        (lead) => lead._id
                                      )
                                    );
                                  } else {
                                    setSelectedLeads([]);
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                            )}
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Sl No
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Name
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Phone Number
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Created By
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Assigned To
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Location
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Priority
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchopencustomers?.leads?.map((lead, index) => (
                          <motion.tr
                            key={lead._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="bg-white even:bg-gray-50 hover:bg-blue-50 text-xs sm:text-sm"
                          >
                            <td className="py-2 sm:py-4 px-2 sm:px-4">
                              {role !== "Agent" && (
                                <input
                                  type="checkbox"
                                  checked={selectedLeads.includes(lead._id)}
                                  onChange={() => handleSelectLead(lead._id)}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                              )}
                            </td>
                            <td className="py-2 sm:py-4 px-2 sm:px-4">
                              {(currentpage - 1) * leadsperpage + index + 1}
                            </td>
                            <td className="py-2 sm:py-4 px-2 sm:px-4">
                              <button
                                className="text-blue-700 font-semibold hover:underline"
                                onClick={() =>
                                  dispatch(toggleCustomerdetailmodal(lead))
                                }
                              >
                                {lead.name}
                              </button>
                            </td>
                            <td className="py-2 sm:py-4 px-2 sm:px-4">
                              {lead.mobile}
                            </td>
                            <td className="py-2 sm:py-4 px-2 sm:px-4">
                              {lead.createdBy?.name}
                            </td>
                            <td className="py-2 sm:py-4 px-2 sm:px-4">
                              {lead.assignedTo?.name || "N/A"}
                            </td>
                            <td className="py-2 sm:py-4 px-2 sm:px-4">
                              {lead.location || "N/A"}
                            </td>
                            <td className="py-2 sm:py-4 px-2 sm:px-4">





                              {/* priority  */}
                         <select
  className="border p-1 mt-2 sm:p-2 rounded-md bg-gray-100 hover:bg-white 
             focus:ring-2 focus:ring-blue-400 transition text-xs sm:text-sm w-full"
  value={lead.status === "new" ? "Not Assigned" : (lead.priority || "Not Assigned")}
  disabled={!!metadata || lead.status === "new"} 
  onChange={(e) => handlepriority(lead._id, e.target.value)}
>
  <option value="hot">Hot</option>
  <option value="warm">Warm</option>
  <option value="cold">Cold</option>
  <option value="Not Assigned">Not Assigned</option>

</select>

                            </td>
                            <td className="py-2 sm:py-4 px-2 sm:px-4">
                              <select
                                className="border p-1 sm:p-2 rounded-md bg-gray-100 hover:bg-white focus:ring-2 focus:ring-blue-400 transition text-xs sm:text-sm w-full"
                                value={lead.status}
                                disable={!!metadata}
                                onChange={(e) =>
                                  handleleadchange(lead._id, e.target.value)
                                }
                              >
                                <option value="new">New</option>
                                <option value="open">Open</option>
                                <option value="converted">Converted</option>
                                
                                <option value="closed">Closed</option>
                                <option value="walkin">Walk In</option>
                                <option value="paused">Paused</option>
                                <option value="rejected">Rejected</option>
                                <option value="unavailable">Unavailable</option>

                              </select>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    disabled={currentpage === 1}
                    onClick={() => handlePageChange(currentpage - 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 rounded ${
                        currentpage === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentpage === totalPages}
                    onClick={() => handlePageChange(currentpage + 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center text-sm sm:text-lg py-4 sm:py-6">
                {totalLeads > 0
                  ? `No follow-ups available on page ${currentpage}. Try adjusting filters or navigating to another page.`
                  : "No Follow-ups Available"}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {statussuccessmodal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
          >
            <motion.div className="absolute inset-0 bg-black opacity-30" />
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10 bg-green-100 text-green-700 px-6 sm:px-10 py-4 sm:py-6 rounded-xl shadow-2xl text-sm sm:text-base font-semibold w-full max-w-xs sm:max-w-sm md:max-w-md h-[100px] sm:h-[120px] flex items-center justify-center text-center"
            >
              {deleteLeadsMutation.isSuccess
                ? "Leads deleted successfully!"
                : "Status updated successfully!"}
            </motion.div>
          </motion.div>
        )}
        {showDeleteConfirm && (
          <motion.div
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg text-center w-full max-w-xs sm:max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">
                Are you sure you want to delete {selectedLeads.length} lead(s)?
              </h3>
              <div className="flex gap-2 sm:gap-4 justify-center">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm"
                >
                  Yes
                </button>
                <button
                  onClick={closeDeleteConfirm}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {iscustomerdetailmodal && (
          <motion.div
            key="customer-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <Customerdetailmodal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Subadminfollowups;
