import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleCustomermodal } from "../redux/modalSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";
import { addleads } from "../services/leadsRouter";
import { listleadsourcesettings } from "../services/settingservices/leadSourceSettingsRouter";
import Spinner from "./Spinner";
import { getProducts } from "../services/paymentstatusRouter";

function Customermodal() {
  const dispatch = useDispatch();
  const queryclient = useQueryClient();

  const [showsuccess, setshowsuccess] = useState(false);

  const fetchleadsource = useQuery({
    queryKey: ["List leadsource"],
    queryFn: listleadsourcesettings,
  });

  const getProduct = useQuery({
    queryKey: ["get products"],
    queryFn: getProducts,
  });

  const getSelectedProduct = getProduct?.data?.getProduct;

  const addingcustomers = useMutation({
    mutationKey: ["Add Leads"],
    mutationFn: addleads,
    onSuccess: () => {
      queryclient.invalidateQueries(["Addingleads"]);
    },
  });

  const customerformvalidation = Yup.object({
    name: Yup.string().required("Name is mandatory"),
    email: Yup.string().matches(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
      "Invalid email format"
    ),
    mobile: Yup.string()
      .required("Mobile number is mandatory")
      .matches(/^\d{10}$/, "Invalid mobile number"),
    source: Yup.string(),
    location: Yup.string(),
    requiredProductType: Yup.string(),
    leadValue: Yup.string().matches(
      /^\d+$/,
      "Lead value must contain only digits"
    ),
  });

  const customerForm = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      source: "",
      location: "",
      requiredProductType: "",
      leadValue: "",
    },
    validationSchema: customerformvalidation,
    onSubmit: async (values) => {
      await addingcustomers.mutateAsync(values);
      setshowsuccess(true);
      setTimeout(() => {
        dispatch(toggleCustomermodal());
        setshowsuccess(false);
      }, 1000);
    },
  });

  const filteredsource = fetchleadsource?.data?.getLeadsource?.filter(
    (source) => source.active
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 sm:p-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="bg-white w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
      >
        {fetchleadsource.isLoading && <Spinner />}
        <div className="bg-gradient-to-b from-[#00B5A6] to-[#1E6DB0] w-full md:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 text-white">
          <FaUserPlus className="text-5xl sm:text-6xl md:text-[80px] mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            Add New Lead
          </h2>
          <p className="text-xs sm:text-sm mt-2 text-center">
            Fill in the customer details to generate a new lead.
          </p>
        </div>
        <div className="relative w-full md:w-2/3 p-4 sm:p-6 md:p-8">
          <button
            onClick={() => dispatch(toggleCustomermodal())}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xl sm:text-2xl text-gray-400 hover:text-red-500 transition"
          >
            &times;
          </button>
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
            Lead Details
          </h3>

          {addingcustomers.isPending && <Spinner />}
          {addingcustomers.isError && (
            <p className="text-red-600 bg-red-100 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
              {addingcustomers.error?.response?.data?.message}
            </p>
          )}

          <form
            onSubmit={customerForm.handleSubmit}
            className="space-y-3 sm:space-y-4"
          >
            <div>
              <input
                type="text"
                name="name"
                value={customerForm.values.name}
                {...customerForm.getFieldProps("name")}
                className="border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Enter the name"
              />
              <span className="text-red-500 text-xs block mt-1">
                * required
              </span>
              {customerForm.touched.name && customerForm.errors.name && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {customerForm.errors.name}
                </p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="mobile"
                value={customerForm.values.mobile}
                {...customerForm.getFieldProps("mobile")}
                className="border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Enter the mobile number"
              />
              <span className="text-red-500 text-xs block mt-1">
                * required
              </span>
              {customerForm.touched.mobile && customerForm.errors.mobile && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {customerForm.errors.mobile}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={customerForm.values.email}
                {...customerForm.getFieldProps("email")}
                className="border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Enter the email ID"
              />
              {customerForm.touched.email && customerForm.errors.email && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {customerForm.errors.email}
                </p>
              )}
            </div>

            <div>
              <select
                name="source"
                value={customerForm.values.source}
                {...customerForm.getFieldProps("source")}
                className="border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              >
                <option value="" label="Select Source" />
                {filteredsource?.map((source, index) => (
                  <option key={index} value={source.title}>
                    {source.title}
                  </option>
                ))}
              </select>
              {customerForm.touched.source && customerForm.errors.source && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {customerForm.errors.source}
                </p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="location"
                value={customerForm.values.location}
                {...customerForm.getFieldProps("location")}
                className="border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Enter the location"
              />
              {customerForm.touched.location &&
                customerForm.errors.location && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {customerForm.errors.location}
                  </p>
                )}
            </div>

            <div>
              <select
                name="requiredProductType"
                value={customerForm.values.requiredProductType}
                {...customerForm.getFieldProps("requiredProductType")}
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
            </div>

            <div>
              <input
                type="text"
                name="leadValue"
                value={customerForm.values.leadValue}
                {...customerForm.getFieldProps("leadValue")}
                className="border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Enter the lead value"
              />
              {customerForm.touched.leadValue &&
                customerForm.errors.leadValue && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {customerForm.errors.leadValue}
                  </p>
                )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base"
            >
              Add Lead
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
              ✅ Lead added successfully!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Customermodal;
