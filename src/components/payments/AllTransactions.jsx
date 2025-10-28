import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaExclamationCircle,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
} from "react-icons/fa";
import {
  getProductPaymentDetails,
  getProducts,
} from "../../services/paymentstatusRouter";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const AllTransactions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["productPayments"],
    queryFn: getProductPaymentDetails,
  });

  const allTransactions = data?.getProductPayment || [];

  const { data: productData } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
  const products = productData?.getProduct || [];

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    customer: "",
    status: "",
    paymentMode: "",
    product: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    let filtered = [...allTransactions];

    if (filters.customer) {
      filtered = filtered.filter((t) =>
        t.payment.customer?.name
          ?.toLowerCase()
          .includes(filters.customer.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((t) => {
        const { totalPaid, totalAmount, dueDate } = t.payment;
        const now = new Date();
        const due = totalAmount - totalPaid;

        let status = "Unpaid";
        if (totalPaid === totalAmount) status = "Paid";
        else if (totalPaid > 0 && totalPaid < totalAmount) status = "Partially Paid";
        else if (totalPaid === 0) status = "Unpaid";
        if (dueDate && new Date(dueDate) < now && due > 0) status = "Overdue";

        return status === filters.status;
      });
    }

    if (filters.paymentMode) {
      filtered = filtered.filter(
        (t) => t.paymentMode.toLowerCase() === filters.paymentMode.toLowerCase()
      );
    }

    if (filters.product) {
      filtered = filtered.filter(
        (t) => t.payment.product?._id === filters.product
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (t) => new Date(t.transactionDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (t) => new Date(t.transactionDate) <= new Date(filters.endDate)
      );
    }

    setFilteredTransactions(filtered);
  }, [allTransactions, filters]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-60">
        <p>Loading transactions...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-60 text-red-600">
        <p>Error loading transactions</p>
      </div>
    );

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 mt-8 border border-gray-200/80">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Transactions Management
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Customer name"
          className="border rounded px-3 py-2"
          value={filters.customer}
          onChange={(e) =>
            setFilters({ ...filters, customer: e.target.value })
          }
        />
        <select
          className="border rounded px-3 py-2"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Overdue">Overdue</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filters.paymentMode}
          onChange={(e) =>
            setFilters({ ...filters, paymentMode: e.target.value })
          }
        >
          <option value="">All Payment Modes</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filters.product}
          onChange={(e) => setFilters({ ...filters, product: e.target.value })}
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <FaUser className="mr-2" /> Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <FaCalendarAlt className="mr-2" /> Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recorded By
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn) => {
                const { totalPaid, totalAmount, dueDate } = txn.payment;
                const due = totalAmount - totalPaid;
                const now = new Date();

                let status = "Unpaid";
                let statusColor = "bg-red-100 text-red-800";
                let StatusIcon = <FaTimesCircle />;

                if (totalPaid === totalAmount) {
                  status = "Paid";
                  statusColor = "bg-green-100 text-green-800";
                  StatusIcon = <FaCheckCircle />;
                } else if (totalPaid > 0 && totalPaid < totalAmount) {
                  status = "Partially Paid";
                  statusColor = "bg-yellow-100 text-yellow-800";
                  StatusIcon = <FaHourglassHalf />;
                } else if (totalPaid === 0) {
                  status = "Unpaid";
                  statusColor = "bg-gray-100 text-gray-800";
                  StatusIcon = <FaTimesCircle />;
                }
                if (dueDate && new Date(dueDate) < now && due > 0) {
                  status = "Overdue";
                  statusColor = "bg-orange-100 text-orange-800";
                  StatusIcon = <FaExclamationCircle />;
                }

                return (
                  <tr
                    key={txn._id}
                    className="hover:bg-gray-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {txn.payment.customer?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {txn.payment.product?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(txn.transactionDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-semibold text-right">
                      {formatCurrency(txn.paidAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {txn.paymentMode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {txn.transactionRecordBy?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        <span className="mr-1.5">{StatusIcon}</span>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  <FaExclamationCircle className="text-3xl mx-auto mb-2" />
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllTransactions;
