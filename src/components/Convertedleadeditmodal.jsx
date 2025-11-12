import { useFormik } from "formik";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { AnimatePresence, motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";
import {
  toggleconvertedleadeditModal,
  setSelectedCustomer, // ✅ import this action
} from "../redux/modalSlice";
import Spinner from "./Spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { editcustomerdetails } from "../services/customersRouter";
import { getProducts } from "../services/paymentstatusRouter";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import toast, { Toaster } from "react-hot-toast";

function Convertedleadeditmodal() {
  const selectedlead = useSelector((state) => state.modal.selectedLead);
  const dispatch = useDispatch();
  const queryclient = useQueryClient();

  const getProduct = useQuery({
    queryKey: ["get products"],
    queryFn: getProducts,
  });

  const getSelectedProduct = getProduct?.data?.getProduct || [];

  // ✅ Mutation with optimistic updates + toasts
  const updatingcustomerdetails = useMutation({
    mutationFn: editcustomerdetails,

    onMutate: async (updatedCustomer) => {
      await queryclient.cancelQueries(["List converted customers"]);

      const previousData = queryclient.getQueryData(["List converted customers"]);

      // Optimistic UI update
      queryclient.setQueryData(["List converted customers"], (old) =>
        old?.map((customer) =>
          customer._id === updatedCustomer.customerId
            ? { ...customer, ...updatedCustomer.customerData }
            : customer
        )
      );

      toast.loading("Updating customer details...", { id: "updateCustomer" });

      return { previousData };
    },

    onError: (error, _, context) => {
      toast.error("Failed to update customer. Please try again.", {
        id: "updateCustomer",
      });

      if (context?.previousData) {
        queryclient.setQueryData(["List converted customers"], context.previousData);
      }
    },

    onSuccess: (data) => {
      toast.success("Customer updated successfully!", { id: "updateCustomer" });

      // ✅ Update Redux so the detail modal refreshes
      dispatch(setSelectedCustomer(data.updatedCustomer)); // backend must return updatedCustomer

      // ✅ Update React Query cache
      queryclient.setQueryData(["List converted customers"], (old) =>
        old?.map((customer) =>
          customer._id === data.updatedCustomer._id ? data.updatedCustomer : customer
        )
      );

      // ✅ Close edit modal
      dispatch(toggleconvertedleadeditModal(null));
    },

    onSettled: () => {
      queryclient.invalidateQueries(["List converted customers"]);
    },
  });

  // ✅ Validation Schema
  const editcustomervalidation = Yup.object({
    name: Yup.string(),
    mobile: Yup.string()
      .test(
        "is-valid-phone",
        "Phone number is not valid",
        (value) => !value || isValidPhoneNumber(value)
      )
      .required("Phone number is required"),
    alternativemobile: Yup.string()
      .test(
        "is-valid-phone",
        "Alternative Phone number is not valid",
        (value) => !value || isValidPhoneNumber(value)
      )
      .required("Alternative phone number is required"),
    email: Yup.string().matches(/.+@.+\..+/, "Invalid email format"),
    product: Yup.string(),
  });

  // ✅ Formik setup
  const convertedleadeditForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: selectedlead?.name || "",
      mobile: selectedlead?.mobile || "",
      alternativemobile: selectedlead?.alternativemobile || "+91",
      email: selectedlead?.email || "",
      product: selectedlead?.product || "",
    },
    validationSchema: editcustomervalidation,

    onSubmit: async (values) => {
      if (!selectedlead?._id) return;

      await updatingcustomerdetails.mutateAsync({
        customerId: selectedlead._id,
        customerData: values,
      });
    },
  });

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="bg-white w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
        >
          {/* Left Section */}
          <div className="bg-gradient-to-b from-[#00B5A6] to-[#1E6DB0] w-full md:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 text-white">
            <FaUserPlus className="text-5xl sm:text-6xl md:text-[80px] mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
              Edit Customer
            </h2>
            <p className="text-xs sm:text-sm mt-2 text-center">
              Update details of Sub-admins or Agents as needed.
            </p>
          </div>

          {/* Right Section (Form) */}
          <div className="relative w-full md:w-2/3 p-4 sm:p-6 md:p-8">
            <button
              onClick={() => dispatch(toggleconvertedleadeditModal(null))}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xl sm:text-2xl text-gray-400 hover:text-red-500 transition"
            >
              &times;
            </button>

            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Edit Customer Details
            </h3>

            {updatingcustomerdetails.isError && (
              <p className="text-red-600 bg-red-100 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
                {updatingcustomerdetails.error?.response?.data?.message}
              </p>
            )}

            <form
              onSubmit={convertedleadeditForm.handleSubmit}
              className="space-y-3 sm:space-y-4"
            >
              <div>
                <input
                  type="text"
                  name="name"
                  {...convertedleadeditForm.getFieldProps("name")}
                  className="border-2 border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  placeholder="Enter the name"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  {...convertedleadeditForm.getFieldProps("email")}
                  className="border-2 border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  placeholder="Enter the email"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center border-2 border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-400">
                  <PhoneInput
                    defaultCountry="IN"
                    name="mobile"
                    value={convertedleadeditForm.values.mobile}
                    onChange={(value) =>
                      convertedleadeditForm.setFieldValue("mobile", value)
                    }
                    placeholder="Enter mobile number"
                    className="w-full px-3 py-2 rounded-lg text-sm sm:text-base focus:outline-none"
                  />
                </div>
              </div>

              {/* Alternative */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternative Mobile Number
                </label>
                <div className="flex items-center border-2 border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-400">
                  <PhoneInput
                    defaultCountry="IN"
                    name="alternativemobile"
                    value={convertedleadeditForm.values.alternativemobile}
                    onChange={(value) =>
                      convertedleadeditForm.setFieldValue(
                        "alternativemobile",
                        value
                      )
                    }
                    placeholder="Enter alternative number"
                    className="w-full px-3 py-2 rounded-lg text-sm sm:text-base focus:outline-none"
                  />
                </div>
              </div>

              {/* Product */}
              <div>
                <select
                  name="product"
                  onChange={convertedleadeditForm.handleChange}
                  value={convertedleadeditForm.values.product}
                  className="border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base text-black"
                >
                  {getProduct.isLoading ? (
                    <option disabled>Loading products...</option>
                  ) : (
                    <>
                      <option value="">-- Select Product --</option>
                      {getSelectedProduct.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.title}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={updatingcustomerdetails.isPending}
                className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base ${
                  updatingcustomerdetails.isPending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {updatingcustomerdetails.isPending ? "Updating..." : "Update"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Toast Container */}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default Convertedleadeditmodal;
