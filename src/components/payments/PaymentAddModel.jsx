import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPayment,
  getTransactions,
  deletePayment,
} from "../../services/paymentstatusRouter";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditPaymentModal from "./EditPaymentModal";

const PaymentAddModel = ({ customerId, productId }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [editPayment, setEditPayment] = useState(null);

  const userId = useSelector((state) => state.auth.user?.id);
  const queryClient = useQueryClient();

  // ✅ Fetch Transactions for this customer
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", customerId],
    queryFn: () => getTransactions(customerId),
    enabled: !!customerId,
  });

  const queryClientInvalidate = () =>
    queryClient.invalidateQueries(["transactions", customerId]);

  // ✅ Next payment date suggestion
  const nextPaymentDate = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [date]);

  // ✅ Add Payment
  const { mutate: addPaymentFn } = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      alert("✅ Payment added successfully!");
      queryClientInvalidate();
      resetForm();
    },
    onError: (error) => {
      alert(
        `❌ Error: ${error.response?.data?.message || "Something went wrong"}`
      );
    },
  });

  // ✅ Delete Payment
  const { mutate: deletePaymentFn } = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      alert("✅ Payment deleted!");
      queryClientInvalidate();
    },
  });

  const resetForm = () => {
    setAmount("");
    setDate("");
    setPaymentMode("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !date || !paymentMode)
      return alert("⚠️ Please fill all fields.");

    const payload = {
      productId,
      customerId,
      paidAmount: Number(amount),
      transactionDate: new Date(date).toISOString(),
      paymentMode,
      transactionRecordBy: userId,
    };
    addPaymentFn(payload);
  };

  const handleDelete = (id) => {
    if (window.confirm("🗑️ Confirm delete?")) deletePaymentFn(id);
  };

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

        {nextPaymentDate && (
          <div className="text-gray-600 italic mt-1 md:col-span-2">
            Next Payment Date:{" "}
            <span className="font-semibold text-blue-700">
              {nextPaymentDate.toLocaleDateString()}
            </span>
          </div>
        )}

        <button
          type="submit"
          className="col-span-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
        >
          Add Payment
        </button>
      </form>

      {/* Transactions Table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-blue-600 mb-3">
          💳 Payment Transactions
        </h2>

        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading transactions...</p>
        ) : transactions?.transactions?.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Mode</th>
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
                      ₹{item.paidAmount}
                    </td>
                    <td className="p-3 capitalize">{item.paymentMode}</td>
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

      {/* Edit Modal */}
      {editPayment && (
        <EditPaymentModal
          editPayment={editPayment}
          onClose={() => setEditPayment(null)}
          onUpdated={queryClientInvalidate}
        />
      )}
    </div>
  );
};

export default PaymentAddModel;
