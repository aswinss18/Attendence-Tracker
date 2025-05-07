"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

import { User, Mail, Key, Calendar, FileText, Save, X } from "lucide-react";
import { addUser } from "@/controllers/functions";
import toast from "react-hot-toast";

const AddUser = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "Employee",
    password: "",
    confirmPassword: "",
    joiningDate: "",
    profilePicture: null,
    notes: "",
  });

  const roles = ["Employee", "Manager", "HR"];

  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      profilePicture: file,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        console.log(formData);
        const response = await addUser(formData);
        toast.success("User added successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to add user");
      }
    }
  };

  const formVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="mx-auto p-6 transition-colors duration-300 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-[80vh]">
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Add New User
        </motion.h1>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-8xl mx-auto bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md flex justify-center items-start gap-12"
        variants={formVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={itemVariants} className="relative w-full">
          <motion.div variants={itemVariants} className="relative ">
            <div className="flex items-center mb-2">
              <User
                size={18}
                className="mr-2 text-blue-500 dark:text-blue-400"
              />
              <label htmlFor="fullName" className="font-medium">
                Full Name
              </label>
            </div>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="border dark:border-gray-600 p-3 w-full rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <motion.p
                className="text-red-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.fullName}
              </motion.p>
            )}
          </motion.div>
          {/* Email */}
          <motion.div variants={itemVariants} className="relative  mt-6">
            <div className="flex items-center mb-2">
              <Mail
                size={18}
                className="mr-2 text-blue-500 dark:text-blue-400"
              />
              <label htmlFor="email" className="font-medium">
                Email Address
              </label>
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border dark:border-gray-600 p-3 w-full rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Enter email"
            />
            {errors.email && (
              <motion.p
                className="text-red-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.email}
              </motion.p>
            )}
          </motion.div>
          {/* Role */}
          <motion.div variants={itemVariants} className="relative  mt-6">
            <div className="flex items-center mb-2">
              <FileText
                size={18}
                className="mr-2 text-blue-500 dark:text-blue-400"
              />
              <label htmlFor="role" className="font-medium">
                Role
              </label>
            </div>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border dark:border-gray-600 p-3 w-full rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </motion.div>
          {/* Password */}
          <motion.div variants={itemVariants} className="relative  mt-6">
            <div className="flex items-center mb-2">
              <Key
                size={18}
                className="mr-2 text-blue-500 dark:text-blue-400"
              />
              <label htmlFor="password" className="font-medium">
                Password
              </label>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="border dark:border-gray-600 p-3 w-full rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Enter password"
            />
            {errors.password && (
              <motion.p
                className="text-red-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.password}
              </motion.p>
            )}
          </motion.div>
          {/* Confirm Password */}
          <motion.div variants={itemVariants} className="relative  mt-6">
            <div className="flex items-center mb-2">
              <Key
                size={18}
                className="mr-2 text-blue-500 dark:text-blue-400"
              />
              <label htmlFor="confirmPassword" className="font-medium">
                Confirm Password
              </label>
            </div>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="border dark:border-gray-600 p-3 w-full rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Confirm password"
            />
            {errors.confirmPassword && (
              <motion.p
                className="text-red-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.confirmPassword}
              </motion.p>
            )}
          </motion.div>
          {/* Joining Date */}
          <motion.div variants={itemVariants} className="relative  mt-6">
            <div className="flex items-center mb-2">
              <Calendar
                size={18}
                className="mr-2 text-blue-500 dark:text-blue-400"
              />
              <label htmlFor="joiningDate" className="font-medium">
                Joining Date
              </label>
            </div>
            <input
              type="date"
              id="joiningDate"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="border dark:border-gray-600 p-3 w-full rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </motion.div>
        </motion.div>
        {/* Full Name */}

        <motion.div variants={itemVariants} className="relative w-full">
          <motion.div variants={itemVariants} className="relative">
            <div className="flex items-center mb-2">
              <User
                size={18}
                className="mr-2 text-blue-500 dark:text-blue-400"
              />
              <label htmlFor="profilePicture" className="font-medium">
                Profile Picture
              </label>
            </div>
            <div className="flex items-center">
              <label className="w-full flex items-center justify-center border dark:border-gray-600 p-3 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span>
                  {formData.profilePicture
                    ? formData.profilePicture.name
                    : "Choose a file"}
                </span>
              </label>
            </div>
          </motion.div>
          {/* Notes */}
          <motion.div variants={itemVariants} className="relative ">
            <div className="flex items-center mb-2">
              <FileText
                size={18}
                className="mr-2 text-blue-500 dark:text-blue-400"
              />
              <label htmlFor="notes" className="font-medium">
                Additional Notes
              </label>
            </div>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="border dark:border-gray-600 p-3 w-full rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-32"
              placeholder="Enter any additional notes"
            />
          </motion.div>
          {/* Submit Button */}
          <motion.div
            variants={itemVariants}
            className="flex space-x-4 pt-4 justify-end mt-64"
          >
            <motion.button
              type="submit"
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Save size={18} className="mr-2" />
              Save User
            </motion.button>
            <motion.button
              type="button"
              onClick={() => router.push("/admin/manage-users")}
              className="flex items-center justify-center bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 rounded-md font-medium transition-colors duration-200"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <X size={18} className="mr-2" />
              Cancel
            </motion.button>
          </motion.div>
        </motion.div>
        {/* Profile Picture */}
      </motion.form>
    </div>
  );
};

export default AddUser;
