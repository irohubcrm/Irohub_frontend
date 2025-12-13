import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getProductPaymentDetails } from "../../services/paymentstatusRouter";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const ProductPaymentDetails = ({ startDate, endDate }) => {
  const role = useSelector((state) => state.auth.role);
  const userId = useSelector((state) => state.auth.user?.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ["productPaymentDetails", startDate, endDate, role, userId],
    queryFn: () => getProductPaymentDetails({ 
        startDate, 
        endDate,
        agentId: role === 'Agent' ? userId : undefined 
    }),
  });

  const [expandedProduct, setExpandedProduct] = useState(null);

  const rawPayments = data?.data ?? data?.getProductPayment ?? [];

  // ----------------------------------------------------------------
  // 🔥 Ultra-Optimized Processing with Maps + Single-Pass Reduction
  // ----------------------------------------------------------------
  const { productSummary, productCustomers, grandTotals } = useMemo(() => {
    // We'll avoid double-counting invoice totals by tracking unique payment IDs per product.
    // We also sum transaction-level paid amounts (tx.paidAmount) when available.
    const productMap = new Map();
    const customersByProduct = new Map();
    const globalPaidCustomers = new Set();

    let totalPayment = 0;
    let totalPaid = 0;

    rawPayments.forEach((tx) => {
      const payment = tx.payment || tx;
      const product = payment.product;
      const customer = tx.customer || payment.customer;

      if (!product || !customer) return;

      const productId = product._id;
      const customerId = customer._id;
      const title = product.title || product.name || "Unknown Product";

      // Determine unique invoice/payment ID. Fall back to a stable generated key
      // if payment._id is missing to avoid accidental de-dup issues.
      const invoiceId = payment._id || tx._id || `${productId}_${customerId}_${payment.totalAmount || 0}`;

      // Prefer transaction-level paid amount; fallback to payment.totalPaid
      const transactionPaid = Number(tx.paidAmount ?? tx.amount ?? 0);
      const invoicePaid = Number(payment.totalPaid ?? 0);
      const txPaid = transactionPaid || invoicePaid || 0;

      const invoiceTotal = Number(payment.totalAmount || 0);

      // Initialize product entry
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          title,
          total_payment: 0,
          payment_paid: 0,
          paidCustomerIds: new Set(),
          seenInvoiceIds: new Set(), // track unique invoices for this product
        });
        customersByProduct.set(productId, new Map());
      }

      const p = productMap.get(productId);

      // Only add the invoice's total amount once per invoice for the product
      if (invoiceId && !p.seenInvoiceIds.has(invoiceId)) {
        p.total_payment += invoiceTotal;
        p.seenInvoiceIds.add(invoiceId);
        totalPayment += invoiceTotal;
      }

      // Sum the paid amount from the transaction (or invoice fallback)
      p.payment_paid += txPaid;
      totalPaid += txPaid;

      if (txPaid > 0) {
        p.paidCustomerIds.add(customerId);
        globalPaidCustomers.add(customerId);
      }

      // Add or aggregate for this customer under this product
      const cMap = customersByProduct.get(productId);
      if (!cMap.has(customerId)) {
        cMap.set(customerId, {
          customerName: customer.name || "Unknown",
          totalAmount: 0,
          totalPaid: 0,
          seenInvoiceIds: new Set(),
        });
      }

      const c = cMap.get(customerId);

      // Add invoice total once per invoice for customer
      if (invoiceId && !c.seenInvoiceIds.has(invoiceId)) {
        c.totalAmount += invoiceTotal;
        c.seenInvoiceIds.add(invoiceId);
      }

      // transaction-level paid amounts add up
      c.totalPaid += txPaid;
    });

    // Convert Maps → Arrays / Objects and compute derived fields
    const summaryArr = Array.from(productMap.values()).map((p) => ({
      productId: p.productId,
      title: p.title,
      total_payment: p.total_payment,
      payment_paid: p.payment_paid,
      customersPaid: p.paidCustomerIds.size,
    }));

    // Convert customers map into arrays with computed due
    const customersObj = {};
    for (const [pid, cMap] of customersByProduct.entries()) {
      customersObj[pid] = Array.from(cMap.values()).map((c) => ({
        customerName: c.customerName,
        totalAmount: c.totalAmount,
        totalPaid: c.totalPaid,
        due: Math.max(0, c.totalAmount - c.totalPaid),
      }));
    }

    return {
      productSummary: summaryArr,
      productCustomers: customersObj,
      grandTotals: {
        totalPayment,
        totalPaid,
        totalCustomersPaid: globalPaidCustomers.size,
      },
    };
  }, [rawPayments]);

  const toggleExpand = (id) =>
    setExpandedProduct((prev) => (prev === id ? null : id));

  // ----------------------------------------------------------------
  // 🔥 UI States
  // ----------------------------------------------------------------
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-60 text-gray-500">
        Loading Product Payments…
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-60 text-red-600">
        Error loading product details.
      </div>
    );

  if (!productSummary.length)
    return (
      <div className="text-center py-10 text-gray-500">
        No product payment records available.
      </div>
    );

  // ----------------------------------------------------------------
  // 🔥 Render
  // ----------------------------------------------------------------
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 mt-8 border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Product Payment Summary
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Click on a product to view its customer-wise breakdown.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Product", "Total Amount", "Total Paid", "Due Amount", "Paid Customers"]
                .map((t, i) => (
                  <th
                    key={i}
                    className={`px-6 py-3 text-xs font-medium uppercase ${
                      i === 0 ? "text-left" : "text-right"
                    } text-gray-500`}
                  >
                    {t}
                  </th>
                ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {productSummary.map((p) => {
              const due = p.total_payment - p.payment_paid;

              return (
                <React.Fragment key={p.productId}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(p.productId)}
                  >
                    <td className="px-6 py-4 text-blue-600 underline font-semibold">
                      {p.title}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(p.total_payment)}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600 font-semibold">
                      {formatCurrency(p.payment_paid)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-semibold ${
                        due > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(due)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {p.customersPaid}
                    </td>
                  </tr>

                  {expandedProduct === p.productId && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-4 py-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Customers for {p.title}
                        </h3>

                        <table className="w-full text-sm border">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 border text-left">
                                Customer
                              </th>
                              <th className="px-4 py-2 border text-right">
                                Total
                              </th>
                              <th className="px-4 py-2 border text-right">
                                Paid
                              </th>
                              <th className="px-4 py-2 border text-right">
                                Due
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {(productCustomers[p.productId] ?? []).map((c, i) => (
                              <tr key={i} className="hover:bg-white">
                                <td className="px-4 py-2 border">
                                  {c.customerName}
                                </td>
                                <td className="px-4 py-2 border text-right">
                                  {formatCurrency(c.totalAmount)}
                                </td>
                                <td className="px-4 py-2 border text-green-600 text-right">
                                  {formatCurrency(c.totalPaid)}
                                </td>
                                <td
                                  className={`px-4 py-2 border text-right ${
                                    c.due > 0 ? "text-red-600" : "text-green-600"
                                  }`}
                                >
                                  {formatCurrency(c.due)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          <tfoot className="bg-gray-100">
            <tr className="font-semibold text-gray-700">
              <td className="px-6 py-4">Grand Total</td>
              <td className="px-6 py-4 text-right">
                {formatCurrency(grandTotals.totalPayment)}
              </td>
              <td className="px-6 py-4 text-right">
                {formatCurrency(grandTotals.totalPaid)}
              </td>
              <td
                className={`px-6 py-4 text-right ${
                  grandTotals.totalPayment - grandTotals.totalPaid > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {formatCurrency(
                  grandTotals.totalPayment - grandTotals.totalPaid
                )}
              </td>
              <td className="px-6 py-4 text-right text-blue-600">
                {grandTotals.totalCustomersPaid}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ProductPaymentDetails;
