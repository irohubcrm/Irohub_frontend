import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { toggleaddcustomermodal } from "../redux/modalSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";
import { addcustomer } from "../services/customersRouter";
import Spinner from "./Spinner";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

function Addcustomermodal() {
  const dispatch = useDispatch();
  const queryclient = useQueryClient();
  const [showsuccess, setshowsuccess] = useState(false);

  // Main phone handler
  const handlePhoneChange = (phone, country) => {
    addcustomerForm.setFieldValue("mobile", `+${phone}`);
    addcustomerForm.setFieldValue("countryCode", country.dialCode);
  };

  // Alternative phone handler
  const handleAltPhoneChange = (phone, country) => {
    addcustomerForm.setFieldValue("alternativemobile", `+${phone}`);
    addcustomerForm.setFieldValue("altCountryCode", country.dialCode);
  };

  const addingcustomer = useMutation({
    mutationKey: ["Adding customer"],
    mutationFn: addcustomer,
    onSuccess: () => {
      queryclient.invalidateQueries(["customers"]);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to add customer. Try again."
      );
    },
  });

  // VALIDATION FIXED
  const customerformvalidation = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required")
      // CRM_70 Fix: Only allow letters and spaces
      .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
      .test('no-numeric', 'Name cannot contain numbers', value => {
        return !/\d/.test(value);
      }),

    mobile: Yup.string()
      .required("Mobile number is required")
      // CRM_71 Fix: Stricter validation for international phone numbers
      .matches(/^\+\d{1,15}$/, "Enter a valid international phone number")
      .test(
        "no-leading-zero",
        "Mobile number cannot start with 0",
        function (value) {
          if (!value) return true;
          const { countryCode } = this.parent;
          const cleanPhone = value.replace("+", "");
          const cleanCountry = countryCode ? countryCode.toString().replace("+", "") : "";
          if (cleanCountry && cleanPhone.startsWith(cleanCountry)) {
            const national = cleanPhone.slice(cleanCountry.length);
            return !national.startsWith("0");
          }
          // Fallback: if no country code tracking, try to guess or skip
          // But since we track it, this should work.
          return true;
        }
      ),

    alternativemobile: Yup.string()
      // CRM_73 Fix: Stricter validation for alternate mobile
      .matches(/^\+\d{1,15}$/, "Enter a valid alternate phone number")
      .nullable()
      .notRequired()
      .test(
        "no-leading-zero-alt",
        "Mobile number cannot start with 0",
        function (value) {
          if (!value) return true;
          const { altCountryCode } = this.parent;
          const cleanPhone = value.replace("+", "");
          const cleanCountry = altCountryCode ? altCountryCode.toString().replace("+", "") : "";
          if (cleanCountry && cleanPhone.startsWith(cleanCountry)) {
            const national = cleanPhone.slice(cleanCountry.length);
            return !national.startsWith("0");
          }
          return true;
        }
      ),

    email: Yup.string()
      // CRM_72 Fix: More robust email validation regex
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format"
      )
      .nullable(),
  });

  const addcustomerForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      mobile: "",
      countryCode: "91", // Default to India dial code if initial state is IN
      alternativemobile: "",
      altCountryCode: "91",
      email: "",
    },
    validationSchema: customerformvalidation,
    onSubmit: async (values, { setSubmitting }) => {
      const errors = await addcustomerForm.validateForm(values);
      if (Object.keys(errors).length > 0) {
        addcustomerForm.setTouched(errors);
        setSubmitting(false);
        return;
      }
      try {
        await addingcustomer.mutateAsync(values);

        setshowsuccess(true);
        setTimeout(() => {
          dispatch(toggleaddcustomermodal());
          setshowsuccess(false);
        }, 1200);
      } catch (err) {
        console.log(err);
      } finally {
        setSubmitting(false);
      }
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
        {/* LEFT SIDE */}
        <div className="bg-gradient-to-b from-[#00B5A6] to-[#1E6DB0] w-full md:w-1/3 flex flex-col items-center justify-center p-6 text-white">
          <FaUserPlus className="text-6xl mb-4" />
          <h2 className="text-xl font-bold">Add Customer</h2>
          <p className="text-sm mt-2 text-center">
            Register new customers to manage leads and interactions.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative w-full md:w-2/3 p-6 md:p-8">
          <button
            onClick={() => dispatch(toggleaddcustomermodal())}
            className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500"
          >
            &times;
          </button>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Enter Customer Details
          </h3>

          {addingcustomer.isPending && (
            <div className="flex justify-center mb-4">
              <Spinner />
            </div>
          )}

          <form onSubmit={addcustomerForm.handleSubmit} className="space-y-4">
            {/* NAME */}
            {/* NAME */}
            <div>
              <label className="text-gray-700 font-medium mb-1 block">
                Customer Name
              </label>

              <input
                type="text"
                {...addcustomerForm.getFieldProps("name")}
                className="border border-gray-300 p-3 w-full rounded-lg 
               focus:ring-2 focus:ring-blue-400 
               placeholder-gray-400 placeholder:text-sm"
                placeholder="Enter full name"
              />

              {addcustomerForm.touched.name && addcustomerForm.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {addcustomerForm.errors.name}
                </p>
              )}
            </div>

            {/* PRIMARY MOBILE */}
            <div>
              <label className="text-gray-700 font-medium mb-1 block">
                Primary Mobile Number
              </label>

              <PhoneInput
                country={"in"}
                value={addcustomerForm.values.mobile.replace("+", "")}
                onChange={handlePhoneChange}
                enableSearch
                inputClass="!w-full !pl-17 !py-3 
                !text-gray-800 !border !border-gray-300 !rounded-lg 
                !placeholder-gray-400 !placeholder:text-sm"
                buttonClass="!border-gray-300 !bg-white"
                containerClass="!w-full"
                inputProps={{
                  placeholder: "Enter primary mobile number",
                }}
              />

              {addcustomerForm.touched.mobile &&
                addcustomerForm.errors.mobile && (
                  <p className="text-red-500 text-sm mt-2">
                    {addcustomerForm.errors.mobile}
                  </p>
                )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-gray-700 font-medium mb-1 block">
                Email Address
              </label>

              <input
                type="email"
                {...addcustomerForm.getFieldProps("email")}
                className="border border-gray-300 p-3 w-full rounded-lg 
               focus:ring-2 focus:ring-blue-400 
               placeholder-gray-400 placeholder:text-sm"
                placeholder="Enter your email"
              />

              {addcustomerForm.touched.email &&
                addcustomerForm.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {addcustomerForm.errors.email}
                  </p>
                )}
            </div>

            {/* ALT MOBILE */}
            <div>
              <label className="text-gray-700 font-medium mb-1 block">
                Alternate Mobile Number
              </label>

              <PhoneInput
                country={"in"}
                value={addcustomerForm.values.alternativemobile.replace(
                  "+",
                  ""
                )}
                onChange={handleAltPhoneChange}
                enableSearch
                inputClass="!w-full !pl-17 !py-3 
                !text-gray-800 !border !border-gray-300 !rounded-lg 
                !placeholder-gray-400 !placeholder:text-sm"
                buttonClass="!border-gray-300 !bg-white"
                containerClass="!w-full"
                inputProps={{
                  placeholder: "Enter alternate mobile number",
                }}
              />

              {addcustomerForm.touched.alternativemobile &&
                addcustomerForm.errors.alternativemobile && (
                  <p className="text-red-500 text-sm mt-2">
                    {addcustomerForm.errors.alternativemobile}
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={addingcustomer.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Customer
            </button>
          </form>
        </div>
      </motion.div>

      {/* SUCCESS */}
      <AnimatePresence>
        {showsuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black opacity-30" />

            <motion.div
              className="relative z-10 bg-green-200 text-green-800 px-8 py-6 rounded-xl shadow-xl text-center font-semibold"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              ✅ Customer added successfully!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Addcustomermodal;
