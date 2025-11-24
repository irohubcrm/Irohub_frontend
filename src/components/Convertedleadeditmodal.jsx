import { useFormik } from "formik";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { AnimatePresence, motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";
import { toggleconvertedleadeditModal } from "../redux/modalSlice";
import Spinner from "./Spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { editcustomerdetails } from "../services/customersRouter";
import { getProducts } from "../services/paymentstatusRouter";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

function Convertedleadeditmodal() {
  const selectedlead = useSelector((state) => state.modal.selectedLead);

  const dispatch = useDispatch();
  const queryclient = useQueryClient();

  const [showsuccess, setshowsuccess] = useState(false);

  const getProduct = useQuery({
    queryKey: ["get products"],
    queryFn: getProducts,
  });

  const getSelectedProduct = getProduct?.data?.getProduct;

  const updatingcustomerdetails = useMutation({
    mutationKey: ["Edit customer details"],
    mutationFn: editcustomerdetails,
    onSuccess: () => {
      queryclient.invalidateQueries(["List converted customers"]);
    },
  });

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
      .required("Phone number is required"),

    email: Yup.string().matches(/.+@.+\..+/, "Invalid email format"),
    whatsapp: Yup.string().test(
        "is-valid-phone",
        "Phone number is not valid",
        (value) => !value || isValidPhoneNumber(value)
      )
      .required("whatsapp number is required"),
    product: Yup.string(),
    description: Yup.string().max(
      200,
      "Description cannot exceed 200 characters"
    ),
    address: Yup.string().max(200, "Address cannot exceed 200 characters"),
  });

  const convertedleadeditForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: selectedlead?.name || "",
      mobile: selectedlead?.mobile || "",
      alternativemobile: selectedlead?.alternativemobile || "",
      email: selectedlead?.email || "",
      product: selectedlead?.product || "",
    },
    validationSchema: editcustomervalidation,

    onSubmit: async (values) => {
      // console.log("Selected Lead:", selectedlead);
      // console.log("Values:", values);
      await updatingcustomerdetails.mutateAsync({
        customerId: selectedlead._id,
        customerData: values,
      });
      setshowsuccess(true);
      setTimeout(() => {
        dispatch(toggleconvertedleadeditModal(null));
        setshowsuccess(false);
      }, 1000);
    },
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 sm:p-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="bg-white w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
      >
        <div className="bg-gradient-to-b from-[#00B5A6] to-[#1E6DB0] w-full md:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 text-white">
          <FaUserPlus className="text-5xl sm:text-6xl md:text-[80px] mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            Edit Customer
          </h2>
          <p className="text-xs sm:text-sm mt-2 text-center">
            Update details of Sub-admins or Agents as needed.
          </p>
        </div>

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
          {updatingcustomerdetails.isPending && <Spinner />}
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
                className="border-2 border-solid border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Enter the name"
              />
              {convertedleadeditForm.touched.name &&
                convertedleadeditForm.errors.name && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {convertedleadeditForm.errors.name}
                  </p>
                )}
            </div>
            <div>
              <input
                type="email"
                name="email"
                {...convertedleadeditForm.getFieldProps("email")}
                className="border-2 border-solid border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Enter the email"
              />
              {convertedleadeditForm.touched.email &&
                convertedleadeditForm.errors.email && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {convertedleadeditForm.errors.email}
                  </p>
                )}
            </div>
            {/* Mobile Number */}
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
              {convertedleadeditForm.touched.mobile &&
                convertedleadeditForm.errors.mobile && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {convertedleadeditForm.errors.mobile}
                  </p>
                )}
            </div>

            {/* Alternative Mobile Number */}
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
              {convertedleadeditForm.touched.alternativemobile &&
                convertedleadeditForm.errors.alternativemobile && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {convertedleadeditForm.errors.alternativemobile}
                  </p>
                )}
            </div>

            <div>
              <select
                name="product"
                value={convertedleadeditForm.values.product}
                {...convertedleadeditForm.getFieldProps("product")}
                className="border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base text-black"
              >
                <option value="">-- Select Product --</option>

                {getSelectedProduct?.length > 0 &&
                  getSelectedProduct.map((product) => {
                    return (
                      <option key={product._id} value={product._id}>
                        {product.title}
                      </option>
                    );
                  })}
              </select>

              {convertedleadeditForm.touched.product &&
                convertedleadeditForm.errors.product && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {convertedleadeditForm.errors.product}
                  </p>
                )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base"
            >
              Update
            </button>
          </form>
        </div>
      </motion.div>
      <AnimatePresence>
        {showsuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black opacity-30" />
            <motion.div
              className="relative z-10 bg-green-200 text-green-800 px-6 sm:px-10 py-4 sm:py-6 rounded-xl shadow-xl text-sm sm:text-base font-semibold w-full max-w-xs sm:max-w-sm h-[100px] sm:h-[120px] flex items-center justify-center text-center"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              ✅ Customer edited successfully!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Convertedleadeditmodal;
