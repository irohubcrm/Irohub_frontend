import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as Yup from 'yup'
import { toggleaddcustomermodal } from '../redux/modalSlice'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { FaUserPlus } from 'react-icons/fa'
import { addcustomer } from '../services/customersRouter'
import Spinner from './Spinner'

function Addcustomermodal() {
    const dispatch = useDispatch()
    const queryclient = useQueryClient()

    const [showsuccess, setshowsuccess] = useState(false)

    const addingcustomer = useMutation({
        mutationKey: ['Adding customer'],
        mutationFn: addcustomer,
        onSuccess: () => {
            queryclient.invalidateQueries(['Adding customer'])
        }
    })

    const customerformvalidation = Yup.object({
        name: Yup.string().required("Name is required"),
        mobile: Yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Mobile number must be 10 digits"),
        alternativemobile: Yup.string().matches(/^\d{10}$/, "Alternative number must be 10 digits"),
        email: Yup.string().matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, "Invalid email format")
    })

    const addcustomerForm = useFormik({
        initialValues: {
            name: '',
            mobile: '',
            alternativemobile: '',
            email: ''
        },
        validationSchema: customerformvalidation,
        onSubmit: async (values) => {
            await addingcustomer.mutateAsync(values)
            setshowsuccess(true)
            setTimeout(() => {
                dispatch(toggleaddcustomermodal())
                setshowsuccess(false)
            }, 1000);
        }
    })

    return (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 sm:p-0'>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className='bg-white w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden'
            >
                <div className="bg-gradient-to-b from-[#00B5A6] to-[#1E6DB0] w-full md:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 text-white">
                    <FaUserPlus className='text-5xl sm:text-6xl md:text-[80px] mb-3 sm:mb-4' />
                    <h2 className='text-lg sm:text-xl md:text-2xl font-bold'>Add Customer</h2>
                    <p className='text-xs sm:text-sm mt-2 text-center'>
                        Register new customers to start managing their leads and communications.
                    </p>
                </div>

                <div className='relative w-full md:w-2/3 p-4 sm:p-6 md:p-8'>
                    <button
                        onClick={() => dispatch(toggleaddcustomermodal())}
                        className='absolute top-3 right-3 sm:top-4 sm:right-4 text-xl sm:text-2xl text-gray-400 hover:text-red-500 transition'
                    >
                        &times;
                    </button>

                    <h3 className='text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4'>Enter Customer Details</h3>
                    {addingcustomer.isPending && (
                        <Spinner />
                    )}
                    {addingcustomer.isError && (
                        <p className='text-red-600 bg-red-100 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base'>
                            {addingcustomer.error?.response?.data?.message}
                        </p>
                    )}

                    <form onSubmit={addcustomerForm.handleSubmit} className='space-y-3 sm:space-y-4'>
                        <div>
                            <input
                                type='text'
                                name='name'
                                value={addcustomerForm.values.name}
                                {...addcustomerForm.getFieldProps('name')}
                                className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
                                placeholder='Enter the name'
                            />
                            <span className='text-red-500 text-xs block mt-1'>* required</span>
                            {addcustomerForm.touched.name && addcustomerForm.errors.name && (
                                <p className='text-red-500 text-xs sm:text-sm mt-1'>{addcustomerForm.errors.name}</p>
                            )}
                        </div>
                        <div>
                            <input
                                type='text'
                                name='mobile'
                                value={addcustomerForm.values.mobile}
                                {...addcustomerForm.getFieldProps('mobile')}
                                className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
                                placeholder='Enter the mobile number'
                            />
                            <span className='text-red-500 text-xs block mt-1'>* required</span>
                            {addcustomerForm.touched.mobile && addcustomerForm.errors.mobile && (
                                <p className='text-red-500 text-xs sm:text-sm mt-1'>{addcustomerForm.errors.mobile}</p>
                            )}
                        </div>
                        <div>
                            <input
                                type='email'
                                name='email'
                                value={addcustomerForm.values.email}
                                {...addcustomerForm.getFieldProps('email')}
                                className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
                                placeholder='Enter the email'
                            />
                            {addcustomerForm.touched.email && addcustomerForm.errors.email && (
                                <p className='text-red-500 text-xs sm:text-sm mt-1'>{addcustomerForm.errors.email}</p>
                            )}
                        </div>
                        <div>
                            <input
                                type='text'
                                name='alternativemobile'
                                value={addcustomerForm.values.alternativemobile}
                                {...addcustomerForm.getFieldProps('alternativemobile')}
                                className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
                                placeholder='Enter the alternative mobile'
                            />
                            {addcustomerForm.touched.alternativemobile && addcustomerForm.errors.alternativemobile && (
                                <p className='text-red-500 text-xs sm:text-sm mt-1'>{addcustomerForm.errors.alternativemobile}</p>
                            )}
                        </div>
                        <button
                            type='submit'
                            className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base'
                        >
                            Add Customer
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
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            ✅ Customer added successfully!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Addcustomermodal