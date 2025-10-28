import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as Yup from 'yup'
import { toggleleadsourceModal } from '../../redux/settingsmodalSlice'
import { AnimatePresence, motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addleadsourcesettings } from '../../services/settingservices/leadSourceSettingsRouter'
import Spinner from '../Spinner'

function Leadsourcemodal() {

    const dispatch = useDispatch()
    const queryclient = useQueryClient()

    const [showsuccess, setshowsuccess] = useState(false)

    const addingleadsource = useMutation({
        mutationKey: ['Adding Lead Source'],
        mutationFn: addleadsourcesettings,
        onSuccess: () => {
            queryclient.invalidateQueries(['List setting sources'])
        }
    })

    const leadsourcevalidation = Yup.object({
        title: Yup.string().required("Name is required")
    })

    const addleadsourceForm = useFormik({
        initialValues: {
            title: ''
        },
        validationSchema: leadsourcevalidation,

        onSubmit: async (values) => {
            await addingleadsource.mutateAsync(values)
            setshowsuccess(true)
            setTimeout(() => {
                dispatch(toggleleadsourceModal())
                setshowsuccess(false)
            }, 1000);
        }
    })

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-2 sm:px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white w-full max-w-md sm:max-w-lg rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 relative"
            >
                <button
                    onClick={() => dispatch(toggleleadsourceModal())}
                    className="absolute top-2 sm:top-3 right-3 sm:right-4 text-xl sm:text-2xl text-gray-400 hover:text-red-500 transition"
                >
                    &times;
                </button>

                {addingleadsource.isPending && (
                    <Spinner />
                )}
                {addingleadsource.isError && (
                    <p className='text-red-600 bg-red-100 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base'>
                        {addingleadsource.error?.response?.data?.message}
                    </p>
                )}

                <form onSubmit={addleadsourceForm.handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col">
                        <label className="text-gray-700 font-medium mb-1 text-sm sm:text-base">
                            Source
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={addleadsourceForm.values.title}
                            {...addleadsourceForm.getFieldProps('title')}
                            className="border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            placeholder="Enter source name"
                        />
                        {addleadsourceForm.errors.title && addleadsourceForm.touched.title && (
                            <span className="text-red-500 text-xs sm:text-sm mt-1">{addleadsourceForm.errors.title}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-2.5 rounded-lg font-semibold transition text-sm sm:text-base"
                    >
                        Submit
                    </button>
                </form>
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
                            ✅ Lead source added successfully!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Leadsourcemodal