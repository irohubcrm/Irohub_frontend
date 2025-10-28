import React, { useState } from "react";
import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import * as Yup from "yup";
import { updatecustomerdetails } from "../services/leadsRouter";
import {
  toggleCustomerdetailmodal,
  toggleCustomereditmodal,
} from "../redux/modalSlice";
import { listleadsourcesettings } from "../services/settingservices/leadSourceSettingsRouter";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faDollarSign,
  faTimes 
} from "@fortawesome/free-solid-svg-icons";
import PersonalDetails from "./PersonalDetails";

function CustomereditModal() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const selectedLead = useSelector((state) => state.modal.selectedLead);
  const [updatesuccessmodal, setupdatesuccessmodal] = useState(false);

  // Fetch lead sources
  const fetchleadsource = useQuery({
    queryKey: ["List leadsource"],
    queryFn: listleadsourcesettings,
  });

  // Mutation to update customer
  const updatingcustomers = useMutation({
    mutationKey: ["Update customers"],
    mutationFn: updatecustomerdetails,
    onSuccess: () => {
      queryClient.invalidateQueries(["Listleads"]);
      setupdatesuccessmodal(true);
      setTimeout(() => {
        setupdatesuccessmodal(false);
        dispatch(toggleCustomereditmodal());
        dispatch(toggleCustomerdetailmodal());
      }, 2000);
    },
  });

  // Form validation
  const customerEditformvalidation = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    mobile: Yup.string()
      .matches(/^\d{10}$/, "Invalid mobile number")
      .required("Mobile is required"),
    source: Yup.string(),
    location: Yup.string(),
    interestedproduct: Yup.string(),
    leadvalue: Yup.number(),
  });

  // Formik form
  const customereditForm = useFormik({
    initialValues: {
      name: selectedLead?.name || "",
      email: selectedLead?.email || "",
      mobile: selectedLead?.mobile || "",
      source: selectedLead?.source?.title || "",
      location: selectedLead?.location || "",
      interestedproduct: selectedLead?.interestedproduct || "",
      leadvalue: selectedLead?.leadvalue || "",
    },
    validationSchema: customerEditformvalidation,
    onSubmit: async (values) => {
      await updatingcustomers.mutateAsync({
        customerId: selectedLead._id,
        customerData: values,
      });
    },
  });

  const filteredsource = fetchleadsource?.data?.getLeadsource?.filter(
    (source) => source.active
  );

  const InputField = ({ icon, label, name, type = "text", placeholder, error, value, onChange, onBlur }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <FontAwesomeIcon icon={icon} className="text-gray-400 w-4 h-4" />
        {label}
      </label>
      <div className="relative">
        <FontAwesomeIcon 
          icon={icon} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
        />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-200 hover:border-gray-300 bg-white'
            }
          `}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );

  const SelectField = ({ icon, label, name, options, value, onChange, onBlur, error }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <FontAwesomeIcon icon={icon} className="text-gray-400 w-4 h-4" />
        {label}
      </label>
      <div className="relative">
        <FontAwesomeIcon 
          icon={icon} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
        />
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`
            w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-200 hover:border-gray-300 bg-white'
            }
            appearance-none bg-white
          `}
        >
          <option value="">{`Select ${label}`}</option>
          {options?.map((option, idx) => (
            <option key={idx} value={option.title}>
              {option.title}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-white/20"
      >
        {/* Spinner Overlay */}
        <AnimatePresence>
          {(fetchleadsource.isLoading || updatingcustomers.isPending) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-40"
            >
              <Spinner />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Edit Lead Details</h2>
              <p className="text-sm text-gray-500">Update customer information</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch(toggleCustomereditmodal())}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {updatingcustomers.isError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              {updatingcustomers.error?.response?.data?.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {updatesuccessmodal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
              <span className="font-medium">Updated successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={customereditForm.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <InputField
                icon={faUser}
                label="Full Name"
                name="name"
                placeholder="Enter full name"
                error={customereditForm.touched.name && customereditForm.errors.name}
                {...customereditForm.getFieldProps("name")}
              />

              <InputField
                icon={faEnvelope}
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter email address"
                error={customereditForm.touched.email && customereditForm.errors.email}
                {...customereditForm.getFieldProps("email")}
              />

              <InputField
                icon={faPhone}
                label="Mobile Number"
                name="mobile"
                placeholder="Enter 10-digit mobile number"
                error={customereditForm.touched.mobile && customereditForm.errors.mobile}
                {...customereditForm.getFieldProps("mobile")}
              />

              <SelectField
                icon={faMapMarkerAlt}
                label="Lead Source"
                name="source"
                options={filteredsource}
                error={customereditForm.touched.source && customereditForm.errors.source}
                {...customereditForm.getFieldProps("source")}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <InputField
                icon={faMapMarkerAlt}
                label="Location"
                name="location"
                placeholder="Enter location"
                error={customereditForm.touched.location && customereditForm.errors.location}
                {...customereditForm.getFieldProps("location")}
              />

              <InputField
                icon={faDollarSign}
                label="Lead Value"
                name="leadvalue"
                type="number"
                placeholder="Enter lead value"
                error={customereditForm.touched.leadvalue && customereditForm.errors.leadvalue}
                {...customereditForm.getFieldProps("leadvalue")}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={updatingcustomers.isPending}
              className="w-full bg-gradient-to-r from-[#00B5A6] via-[#00D4B6] to-[#1E6DB0] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />
              {updatingcustomers.isPending ? "Updating..." : "Update Lead"}
            </motion.button>
          </motion.div>
        </form>

        {/* Personal Details Component */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <PersonalDetails />
        </div>
      </motion.div>
    </div>
  );
}

export default CustomereditModal;