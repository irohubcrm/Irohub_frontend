import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { FaBars, FaSearch, FaUserPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleaddcustomermodal,
  toggleConvertedcustomerdetailmodal,
} from "../redux/modalSlice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Addcustomermodal from "../components/Addcustomermodal";
import { AnimatePresence, motion } from "framer-motion";
import {
  listconvertedcustomers,
  updateactivecustomers,
  updatecustomerstatus,
  deletemultiplecustomer,
} from "../services/customersRouter";
import Icons from "./Icons";
import { listcustomersettingstatus } from "../services/settingservices/customerStatusSettingsRouter";
import Spinner from "../components/Spinner";
import { Trash2 } from "lucide-react";
import ConvertedCustomerdetailModal from "../components/ConvertedCustomerdetailModal";

function Subadmincustomer() {
  const dispatch = useDispatch();
  const queryclient = useQueryClient();
  const isaddCustomermodal = useSelector(
    (state) => state.modal.addcustomermodal
  );
  const isCustomerdetailmodal = useSelector(
    (state) => state.modal.convertedcustomerdetailModal
  );
  const role = useSelector((state) => state.auth.role);
  const metadata = useSelector((state) => state.auth.metadataUser);

  const [sidebarVisible, setsidebarVisible] = useState(true);
  const [statussuccessmodal, setstatussuccessmodal] = useState(false);
  const [showsearch, setshowsearch] = useState(false);
  const [searchText, setsearchText] = useState("");
  const [paymentfilter, setpaymentfilter] = useState("Payment Status");
  const [activefilter, setActivefilter] = useState("All");
  const [datefilter, setdatefilter] = useState("Date");
  const [selectdatefilter, setselectdatefilter] = useState(null);
  const [daterangefilter, setdaterangefilter] = useState({
    start: null,
    end: null,
  });
  const [currentpage, setcurrentpage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const leadsperpage = 10;

  const { data: fetchconvertedcustomers, isLoading } = useQuery({
    queryKey: [
      "List converted customers",
      paymentfilter,
      activefilter,
      currentpage,
      searchText,
      datefilter,
      selectdatefilter,
      daterangefilter,
    ],
    queryFn: () =>
      listconvertedcustomers({
        page: currentpage,
        limit: leadsperpage,
        paymentStatus:
          paymentfilter !== "Payment Status" ? paymentfilter : undefined,
        activestatus: activefilter !== "All" ? activefilter : undefined,
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
      }),
    keepPreviousData: true,
  });
  console.log("fetchconvertedcustomers", fetchconvertedcustomers)
  const fetchcustomerstatus = useQuery({
    queryKey: ["List Settingstatus"],
    queryFn: listcustomersettingstatus,
    
  });
  

  const updatingcustomerstatus = useMutation({
    mutationKey: ["Update Customerstatus"],
    mutationFn: updatecustomerstatus,
    onSuccess: () => {
      queryclient.invalidateQueries(["List converted customers"]);
    },
  });


  

  const updatingactivecustomers = useMutation({
    mutationKey: ["Update active customers"],
    mutationFn: updateactivecustomers,
    onSuccess: () => {
      queryclient.invalidateQueries(["List converted customers"]);
    },
  });

  const deleteCustomersMutation = useMutation({
    mutationKey: ["Delete customers"],
    mutationFn: deletemultiplecustomer,
    onSuccess: () => {
      queryclient.invalidateQueries(["List converted customers"]);
      setSelectedCustomers([]);
      setstatussuccessmodal(true);
      setTimeout(() => {
        setstatussuccessmodal(false);
      }, 2000);
    },
    onError: (error) => {
      console.error("Delete customers error:", error);
      alert(
        "Failed to delete customers: " +
          (error.response?.data?.message || error.message)
      );
    },
  });

  const handlecustomerstatus = async (customerId, status) => {
    const statusToSend = status === "" ? null : status;
    await updatingcustomerstatus.mutateAsync({
      customerId,
      status: statusToSend,
    });
    setstatussuccessmodal(true);
    setTimeout(() => {
      setstatussuccessmodal(false);
    }, 2000);
  };

  const handleactivestatus = async (customerId, isActive) => {
    await updatingactivecustomers.mutateAsync({ customerId, isActive });
    setstatussuccessmodal(true);
    setTimeout(() => {
      setstatussuccessmodal(false);
    }, 2000);
  };
 
  

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedCustomers.length > 0) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    await deleteCustomersMutation.mutateAsync({
      customerIds: selectedCustomers,
    });
    setShowDeleteConfirm(false);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
  };

  const totalLeads = fetchconvertedcustomers?.totalLeads || 0;
  const totalPages = fetchconvertedcustomers?.totalPages || 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setcurrentpage(page);
      setSelectedCustomers([]);
    }
  };

  const filteredcustomerstatus =
    fetchcustomerstatus?.data?.getCustomerstatus?.filter(
      (customerstatus) => customerstatus.active
    );
    

  // Simplified payment status function to use Customer.payment
  const getPaymentStatus = (customer) => {
    return customer.payment || "Pending"; // Use backend-computed payment status
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
        {fetchcustomerstatus.isLoading && <Spinner />}
        {updatingactivecustomers.isPending && <Spinner />}
        {updatingcustomerstatus.isPending && <Spinner />}
        {deleteCustomersMutation.isPending && <Spinner />}
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
                Customers
              </h3>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Icons />
            </div>
            {role !== "Agent" && !metadata && (
              <button
                className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 md:p-5 rounded-full shadow-lg transform hover:-translate-y-2 transition-all duration-300 z-40 flex items-center justify-center"
                onClick={() => dispatch(toggleaddcustomermodal())}
              >
                <FaUserPlus className="text-base sm:text-lg md:text-xl" />
                <span className="text-xs sm:text-sm md:text-base font-medium">
                  Add Customer
                </span>
              </button>
            )}
          </div>

          <div className="flex justify-between items-center p-4">
            {/* Left side: Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={paymentfilter}
                onChange={(e) => setpaymentfilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200 hover:border-blue-400"
              >
                <option value="Payment Status">Payment Status</option>
                <option value="pending">Pending</option>
                <option value="partially paid">Partially Paid</option>
                <option value="paid">Paid</option>
              </select>
              <select
                value={activefilter}
                onChange={(e) => setActivefilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200 hover:border-blue-400"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
              {selectedCustomers.length > 0 &&
                role !== "Agent" &&
                !metadata && (
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
            ) : fetchconvertedcustomers?.customers?.length > 0 ? (
              <>
                <div className="overflow-x-auto w-full bg-white p-3 sm:p-4 rounded-xl shadow-lg">
                  <div className="max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
                    <table className="w-full table-auto border-collapse text-xs sm:text-sm min-w-[800px]">
                      <thead className="sticky top-0 bg-gradient-to-r from-[#00B5A6] to-[#1E6DB0] text-white text-xs sm:text-sm uppercase z-10">
                        <tr>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            {role !== "Agent" && !metadata && (
                              <input
                                type="checkbox"
                                checked={
                                  selectedCustomers.length ===
                                    fetchconvertedcustomers?.customers
                                      ?.length &&
                                  fetchconvertedcustomers?.customers?.length > 0
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCustomers(
                                      fetchconvertedcustomers.customers.map(
                                        (customer) => customer._id
                                      )
                                    );
                                  } else {
                                    setSelectedCustomers([]);
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
                            Date
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Payment
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Status
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Active
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchconvertedcustomers?.customers?.map(
                          (customer, index) => (
                            <motion.tr
                              key={customer._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.4,
                                delay: index * 0.05,
                              }}
                              className="bg-white even:bg-gray-50 hover:bg-blue-50 text-xs sm:text-sm"
                            >
                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                                {role !== "Agent" && !metadata && (
                                  <input
                                    type="checkbox"
                                    checked={selectedCustomers.includes(
                                      customer._id
                                    )}
                                    onChange={() =>
                                      handleSelectCustomer(customer._id)
                                    }
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
                                    dispatch(
                                      toggleConvertedcustomerdetailmodal(
                                        customer
                                      )
                                    )
                                  }
                                >
                                  {customer.name}
                                </button>
                              </td>
                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                                {customer.createdAt
                                  ? new Date(
                                      customer.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "N/A"}
                              </td>
                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                          <span
  className={`inline-block px-2 py-1 rounded-md text-white text-xs sm:text-sm ${
    getPaymentStatus(customer) === "paid"
      ? "bg-green-600"
      : getPaymentStatus(customer) === "partially paid"
      ? "bg-yellow-500"
      : "bg-red-500"
  }`}
>
  {customer.payment || "Pending"}
</span>

                              </td>
                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                                <select
                                  className="border p-1 sm:p-2 rounded-md bg-gray-100 hover:bg-white focus:ring-2 focus:ring-blue-400 transition text-xs sm:text-sm w-full"
                               value={customer.status?._id || ""}

                                  disabled={!!metadata}
                                  onChange={(e) =>
                                    handlecustomerstatus(
                                      customer._id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="" label="Select" />
                                  {filteredcustomerstatus?.map(
                                    (customerstatus) => (
                                      <option
                                        key={customerstatus._id}
                                        value={customerstatus._id}
                                      >
                                        {customerstatus.title}
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>
                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    disable={!!metadata}
                                    checked={!!customer?.isActive}
                                    onChange={(e) =>
                                      handleactivestatus(
                                        customer._id,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <div className="w-8 h-4 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors duration-200 ease-in-out peer-disabled:bg-gray-200"></div>
                                  <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out transform peer-checked:translate-x-4 peer-disabled:bg-gray-400"></div>
                                </label>
                              </td>
                            </motion.tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    disabled={currentpage === 1}
                    onClick={() => handlePageChange(currentpage - 1)}
                    className="px-4 py-2 bg-blue-600 text- rounded disabled:bg-gray-300"
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
                  ? `No customers available on page ${currentpage}. Try adjusting filters or navigating to another page.`
                  : "No Customers Available"}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isaddCustomermodal && (
          <motion.div
            key="add-customer"
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
              className="absolute inset-0 bg-black"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <Addcustomermodal />
            </div>
          </motion.div>
        )}
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
              {deleteCustomersMutation.isSuccess
                ? "Customers deleted successfully!"
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
                Are you sure you want to delete {selectedCustomers.length}{" "}
                customer(s)?
              </h3>
              <div className="flex gap-2 sm:gap-4 justify-center">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg transition text-sm"
                >
                  Yes
                </button>
                <button
                  onClick={closeDeleteConfirm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg transition text-sm"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {isCustomerdetailmodal && (
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
              className="absolute inset-0 bg-black"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <ConvertedCustomerdetailModal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Subadmincustomer;
