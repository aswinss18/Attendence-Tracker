"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      console.log("User Added", formData);
      // Redirect to manage users page or show success message
      router.push("/admin/manage-users");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Enter full name"
          />
          {errors.fullName && <p className="text-red-500">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Enter email"
          />
          {errors.email && <p className="text-red-500">{errors.email}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border p-2 w-full"
          >
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="HR">HR</option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Enter password"
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Confirm password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Joining Date */}
        <div>
          <label htmlFor="joiningDate" className="block">
            Joining Date
          </label>
          <input
            type="date"
            id="joiningDate"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        {/* Profile Picture */}
        <div>
          <label htmlFor="profilePicture" className="block">
            Profile Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            onChange={handleFileChange}
            className="border p-2 w-full"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Enter any additional notes"
          />
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save User
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/manage-users")}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
