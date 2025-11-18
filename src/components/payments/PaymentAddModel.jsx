import React, { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPayment,
  getTransactions,
  deletePayment,
  getCustomerPayments,
} from "../../services/paymentstatusRouter";
import { uploadToCloudinary } from "../../utils/cloudinaryHelper";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditPaymentModal from "./EditPaymentModal";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Currency formatter for INR (memoized outside the component)
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

const PaymentAddModel = ({ customerId, productId }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [editPayment, setEditPayment] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const userId = useSelector((state) => state.auth.user?.id);
  const queryClient = useQueryClient();

  // 🔹 Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", customerId],
    queryFn: () => getTransactions(customerId),
    enabled: !!customerId,
  });

  // 🔹 Fetch payment summary
  const {
    data: Payments,
    isLoading: paymentLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["payments", customerId],
    queryFn: () => getCustomerPayments({ customerId }),
    enabled: !!customerId,
  });

  const paymentInfo = Payments?.data ?? Payments ?? null;
  if (isError) console.error("Error loading customer payments:", error);

  // 🔹 Invalidate queries together
  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries(["transactions", customerId]);
    queryClient.invalidateQueries(["payments", customerId]);
  }, [queryClient, customerId]);

  // 🔹 Compute next payment suggestion
  const nextPaymentDate = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [date]);

  // 🔹 Add Payment Mutation
  const { mutate: addPaymentFn } = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      toast.success("✅ Payment added successfully!");
      invalidateQueries();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong!");
    },
  });

  // 🔹 Delete Payment Mutation
  const { mutate: deletePaymentFn } = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      toast.success("🗑️ Payment deleted!");
      invalidateQueries();
    },
    onError: () => {
      toast.error("⚠️ Failed to delete payment.");
    },
  });

  // 🔹 Form helpers
  const resetForm = () => {
    setAmount("");
    setDate("");
    setPaymentMode("");
    setReceiptFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !date || !paymentMode || !receiptFile) {
      return toast.error("⚠️ Please fill all fields and upload a receipt.");
    }

    try {
      setIsUploading(true);
      let receiptUrl = null;
      
      // Upload receipt if provided
      if (receiptFile) {
        receiptUrl = await uploadToCloudinary(receiptFile);
      }

      const payload = {
        productId,
        customerId,
        paidAmount: Number(amount),
        transactionDate: new Date(date).toISOString(),
        paymentMode,
        transactionRecordBy: userId,
        receiptUrl,
      };

      addPaymentFn(payload);
    } catch (error) {
      toast.error("Failed to upload receipt. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("🗑️ Confirm delete?")) deletePaymentFn(id);
  };

  // Extract safe payment values
  const totalAmount = paymentInfo?.allPayment?.totalAmount ?? 0;
  const totalPaid = paymentInfo?.allPayment?.totalPaid ?? 0;
  const balance = totalAmount - totalPaid;

  return (
    <div className="m-6 bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">💰 Add Payment</h1>

      {/* Payment Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (₹)"
          className="p-3 border rounded-xl"
          min="1"
          required
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-3 border rounded-xl"
          required
        />

        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          className="p-3 border rounded-xl"
          required
        >
          <option value="">Select Payment Mode</option>
          <option value="upi">UPI</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>

        {paymentMode && (
          <div className="col-span-2">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              {paymentMode === "cash" ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">📝 For cash payments, please upload:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                    <li>Written receipt or acknowledgment</li>
                    <li>Cash counting photo (optional)</li>
                    <li>Any supporting documents</li>
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  📱 Please upload a screenshot of the {paymentMode.replace('_', ' ')} payment
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-3 p-2 w-full border rounded-lg text-sm"
              />
              {receiptFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {receiptFile.name} selected
                </p>
              )}
            </div>
          </div>
        )}

        {nextPaymentDate && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg mt-1 md:col-span-2">
            📅 Suggested Next Payment:{" "}
            <span className="font-semibold text-blue-700">
              {nextPaymentDate.toLocaleDateString()}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className="col-span-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Uploading...
            </>
          ) : (
            'Add Payment'
          )}
        </button>
      </form>

      {/* Payment Summary */}
      {paymentLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : paymentInfo ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total Amount</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total Paid</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {paymentInfo?.allPayment?.product?.title ?? "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {formatCurrency(totalAmount)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                  {formatCurrency(totalPaid)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {formatCurrency(balance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No payment details available.</p>
      )}

      {/* Transactions Table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-blue-600 mb-3">
          💳 Payment Transactions
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : transactions?.transactions?.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Mode</th>
                  <th className="p-3">Screenshot</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.transactions.map((item, i) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">
                      {new Date(item.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold text-green-600">
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="p-3 capitalize">{item.paymentMode}</td>
                    <td className="p-3 text-center">
                      {item.receiptUrl ? (
                        <button
                          onClick={() => setPreviewImage(item)}
                          className={`relative group ${
                            item.paymentMode === 'cash' 
                              ? 'ring-2 ring-yellow-400'
                              : item.paymentMode === 'upi'
                              ? 'ring-2 ring-green-400'
                              : item.paymentMode === 'card'
                              ? 'ring-2 ring-blue-400'
                              : 'ring-2 ring-purple-400'
                          }`}
                        >
                          <img
                            src={item.receiptUrl}
                            alt={`${item.paymentMode} receipt`}
                            className="w-16 h-16 object-cover rounded-lg hover:opacity-75 transition-opacity cursor-pointer"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100">👁️ View</span>
                          </div>
                        </button>
                      ) : (
                        <span className={`text-sm px-3 py-2 rounded-full ${
                          item.paymentMode === 'cash'
                            ? 'bg-yellow-50 text-yellow-600'
                            : item.paymentMode === 'upi'
                            ? 'bg-green-50 text-green-600'
                            : item.paymentMode === 'card'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          {item.paymentMode === 'cash' ? '📄 No receipt' : '🖼️ No screenshot'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 flex gap-3">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => setEditPayment(item)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(item._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No transactions found.</p>
        )}
      </div>

      {/* Edit Modal with Animation */}
      <AnimatePresence>
        {editPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EditPaymentModal
              editPayment={editPayment}
              onClose={() => setEditPayment(null)}
              onUpdated={invalidateQueries}
            />
          </motion.div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl w-full bg-white rounded-xl p-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                ✕
              </button>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment Receipt
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(previewImage.transactionDate).toLocaleDateString()} • 
                      <span className={`ml-2 capitalize ${
                        previewImage.paymentMode === 'cash'
                          ? 'text-yellow-600'
                          : previewImage.paymentMode === 'upi'
                          ? 'text-green-600'
                          : previewImage.paymentMode === 'card'
                          ? 'text-blue-600'
                          : 'text-purple-600'
                      }`}>
                        {previewImage.paymentMode.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(previewImage.paidAmount)}
                    </p>
                  </div>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                  <img
                    src={previewImage.receiptUrl}
                    alt="Payment Receipt"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <a
                    href={previewImage.receiptUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    💾 Download
                  </a>
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentAddModel;
