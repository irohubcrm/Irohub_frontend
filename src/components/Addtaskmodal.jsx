import { useFormik } from 'formik'
import React, { useState } from 'react'
import * as Yup from 'yup'
import { AnimatePresence, motion } from 'framer-motion'
import { toggleaddtasksmodal } from '../redux/modalSlice'
import { FaTasks } from 'react-icons/fa'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { liststaffs } from '../services/staffRouter'
import { addtasks } from '../services/tasksRouter'
import Spinner from './Spinner'

function Addtaskmodal() {
  const dispatch = useDispatch()
  const queryclient = useQueryClient()

  const userlogged = useSelector((state) => state.auth.user)

  const [showsuccess, setshowsuccess] = useState(false)

  const liststaff = useQuery({
    queryKey: ['List staffs'],
    queryFn: liststaffs
  })

  const addingtask = useMutation({
    mutationKey: ['Adding task'],
    mutationFn: addtasks,
    onSuccess: () => {
      queryclient.invalidateQueries(['Adding task'])
    }
  })

  const addtaskvalidation = Yup.object({
    name: Yup.string().required("Task name is required"),
    assignedTo: Yup.string().required("You need to assign task to a staff"),
    deadline: Yup.date().min(new Date(new Date().setHours(0, 0, 0, 0)), "Deadline cannot be in the past"),
    description: Yup.string()
  })

  const addtaskForm = useFormik({
    initialValues: {
      assignedTo: '',
      name: '',
      deadline: '',
      description: ''
    },
    validationSchema: addtaskvalidation,
    onSubmit: async (values) => {
      await addingtask.mutateAsync(values)
      setshowsuccess(true)
      setTimeout(() => {
        dispatch(toggleaddtasksmodal())
        setshowsuccess(false)
      }, 1000);
    }
  })

  const assignedstaffs = liststaff?.data?.filter((staffs) => staffs.assignedTo === userlogged.id)

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className='bg-white w-full max-w-[90%] sm:max-w-3xl mx-auto my-4 sm:my-8 rounded-2xl shadow-2xl flex flex-col sm:flex-row overflow-hidden'
      >
        {liststaff.isLoading &&
          <Spinner />
        }
        <div className="bg-gradient-to-b from-[#00B5A6] to-[#1E6DB0] w-full sm:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 text-white">
          <FaTasks className='text-[60px] sm:text-[80px] mb-4' />
          <h2 className='text-xl sm:text-2xl font-bold'>New Tasks</h2>
          <p className='text-xs sm:text-sm mt-2 text-center'>
            Register new customers to start managing their leads and communications.
          </p>
        </div>

        <div className='relative w-full sm:w-2/3 p-4 sm:p-8'>
          <button
            onClick={() => dispatch(toggleaddtasksmodal())}
            className='absolute top-3 right-4 text-xl sm:text-2xl text-gray-400 hover:text-red-500 transition'
          >
            &times;
          </button>

          <h3 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-4'>New Task</h3>

          {addingtask.isPending && (
            <Spinner />
          )}
          {addingtask.isError && (
            <p className='text-red-600 bg-red-100 p-2 sm:p-3 rounded-md mb-4 text-sm'>
              {addingtask.error?.response?.data?.message}
            </p>
          )}

          <form onSubmit={addtaskForm.handleSubmit} className='space-y-4'>
            <div>
              <input
                type='text'
                name='name'
                value={addtaskForm.values.name}
                {...addtaskForm.getFieldProps('name')}
                className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
                placeholder='Enter the Taskname'
              />
              <span className='text-red-500 text-xs block mt-1'>* required</span>
              {addtaskForm.touched.name && addtaskForm.errors.name && (
                <p className='text-red-500 text-xs sm:text-sm mt-1'>{addtaskForm.errors.name}</p>
              )}
            </div>

            <div>
              <select
                name='assignedTo'
                value={addtaskForm.values.assignedTo}
                {...addtaskForm.getFieldProps('assignedTo')}
                className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
              >
                <option value=''>--Select Staff--</option>
                {userlogged.role === 'Admin' ? (
                  liststaff?.data?.map((staff) => (
                    <option key={staff._id} value={staff._id}>{staff.name} ({staff.role})</option>
                  ))
                ) : (
                  assignedstaffs?.map((staff) => (
                    <option key={staff._id} value={staff._id}>{staff.name} ({staff.role})</option>
                  ))
                )}
              </select>
              <span className='text-red-500 text-xs block mt-1'>* required</span>
              {addtaskForm.touched.assignedTo && addtaskForm.errors.assignedTo && (
                <p className='text-red-500 text-xs sm:text-sm mt-1'>{addtaskForm.errors.assignedTo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type='date'
                name='deadline'
                value={addtaskForm.values.deadline}
                {...addtaskForm.getFieldProps('deadline')}
                className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
              />
              {addtaskForm.touched.deadline && addtaskForm.errors.deadline && (
                <p className='text-red-500 text-xs sm:text-sm mt-1'>{addtaskForm.errors.deadline}</p>
              )}
            </div>

            <div>
              <textarea
                name='description'
                value={addtaskForm.values.description}
                {...addtaskForm.getFieldProps('description')}
                className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
                rows='4'
                placeholder='Enter task description'
              ></textarea>
              {addtaskForm.touched.description && addtaskForm.errors.description && (
                <p className='text-red-500 text-xs sm:text-sm mt-1'>{addtaskForm.errors.description}</p>
              )}
            </div>

            <button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base'
            >
              Assign Task
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
              ✅ Task added successfully!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Addtaskmodal