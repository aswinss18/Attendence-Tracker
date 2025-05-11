"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Calendar,
  Clock,
  AlertCircle,
  Monitor,
  ChevronsUpDown,
  CheckCircle2,
  PlusCircle,
  Moon,
  Sun,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllUsers,
  getAttendanceByUserId,
  updateAttendance,
} from "@/controllers/functions";

export default function EmployeeAttendance() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userAttendance, setUserAttendance] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAttendance, setEditedAttendance] = useState({
    status: "",
    checkIn: "",
    checkOut: "",
    notes: "",
  });

  // Today's date for highlighting
  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  // Filter users based on search query
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        console.log(response);
        setUsersData(response);
      } catch (error) {
        toast.error("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  // Add this additional useEffect to keep selected day in sync
  useEffect(() => {
    if (selectedDay && userAttendance && userAttendance.attendances) {
      // Find the current data for this day in our attendance records
      const currentDayData = userAttendance.attendances.find((record) =>
        record.date.startsWith(selectedDay.date)
      );

      // If we found updated data for the selected day, update the selectedDay state
      if (currentDayData) {
        setSelectedDay((prevDay) => ({
          ...prevDay,
          status: currentDayData.status,
          checkIn: currentDayData.checkIn,
          checkOut: currentDayData.checkOut,
          notes: currentDayData.notes,
          _id: currentDayData._id,
        }));

        // Also update the edit form if we're in edit mode
        if (isEditMode) {
          setEditedAttendance({
            status: currentDayData.status,
            checkIn: currentDayData.checkIn
              ? new Date(currentDayData.checkIn).toISOString().slice(0, 16)
              : "",
            checkOut: currentDayData.checkOut
              ? new Date(currentDayData.checkOut).toISOString().slice(0, 16)
              : "",
            notes: currentDayData.notes || "",
          });
        }
      }
    }
  }, [userAttendance, selectedDay?.date, isEditMode]);

  const filteredUsers = useMemo(() => {
    return usersData.filter(
      (user) =>
        user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, usersData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("user-dropdown");
      if (dropdown && !dropdown.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Effect to fetch attendance data when user is selected
  useEffect(() => {
    const fetchAttendance = async () => {
      if (selectedUser && selectedUser._id) {
        try {
          console.log("starting");
          const attendanceData = await getAttendanceByUserId(selectedUser._id);
          console.log(attendanceData, " attendanceData?.attendances);");
          setUserAttendance(attendanceData || null);
        } catch (error) {
          console.error("Error fetching attendance:", error);
          setUserAttendance(null);
        }
      } else {
        setUserAttendance(null);
      }
    };

    fetchAttendance();
  }, [selectedUser]);

  // Generate calendar data for contribution graph
  // Modified calendarData calculation with better dependency tracking
  const calendarData = useMemo(() => {
    if (!userAttendance) return [];

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sunday

    // Add empty cells for days before the 1st of month
    const calendar = Array(firstDayOfMonth).fill({ empty: true });

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${selectedYear}-${String(selectedMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;

      // Find attendance for this day - adding an extra check for userAttendance.attendances
      const attendance =
        userAttendance.attendances && userAttendance.attendances.length > 0
          ? userAttendance.attendances.find((a) => a.date.startsWith(date))
          : null;

      calendar.push({
        date,
        day,
        status: attendance ? attendance.status : "no-data",
        checkIn: attendance?.checkIn || null,
        checkOut: attendance?.checkOut || null,
        notes: attendance?.notes || null,
        _id: attendance?._id || null,
        isToday: date === today,
      });
    }

    return calendar;
  }, [
    userAttendance,
    selectedMonth,
    selectedYear,
    today,
    userAttendance?.attendances,
  ]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        setHighlightedIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
        e.preventDefault();
        break;
      case "ArrowUp":
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        e.preventDefault();
        break;
      case "Enter":
        if (filteredUsers[highlightedIndex]) {
          setSelectedUser(filteredUsers[highlightedIndex]);
          setIsOpen(false);
          setSearchQuery("");
        }
        break;
      default:
        break;
    }
  };

  // Get status icon
  const StatusIcon = ({ status, size = 16 }) => {
    switch (status) {
      case "present":
        return <CheckCircle2 size={size} className="text-emerald-500" />;
      case "remote":
        return <Monitor size={size} className="text-sky-500" />;
      case "absent":
        return <AlertCircle size={size} className="text-rose-500" />;
      default:
        return null;
    }
  };

  // Handle day selection
  // Modified handleDayClick function with better state handling
  const handleDayClick = (day) => {
    if (day.empty) return;

    // Make a copy to ensure we're not modifying the calendar data directly
    const selectedDayData = { ...day };
    setSelectedDay(selectedDayData);
    setIsEditMode(false);

    // Initialize the edit form with the current values
    setEditedAttendance({
      status:
        selectedDayData.status === "no-data"
          ? "present"
          : selectedDayData.status,
      checkIn: selectedDayData.checkIn
        ? new Date(selectedDayData.checkIn).toISOString().slice(0, 16)
        : "",
      checkOut: selectedDayData.checkOut
        ? new Date(selectedDayData.checkOut).toISOString().slice(0, 16)
        : "",
      notes: selectedDayData.notes || "",
    });
  };
  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAttendance((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save attendance record
  // Modified handleSaveAttendance function with proper state updates
  const handleSaveAttendance = async () => {
    if (!selectedUser || !selectedDay) return;

    try {
      const payload = {
        userId: selectedUser._id,
        date: selectedDay.date,
        status: editedAttendance.status,
        notes: editedAttendance.notes,
        checkIn: editedAttendance.checkIn || null,
        checkOut: editedAttendance.checkOut || null,
        _id: selectedDay._id || undefined,
      };

      const result = await updateAttendance(payload);

      // Create a deep copy of the current attendance data
      const updatedAttendanceData = {
        ...userAttendance,
        attendances: [...(userAttendance.attendances || [])],
      };

      // Find if this date already exists in the attendance records
      const existingIndex = updatedAttendanceData.attendances.findIndex((a) =>
        a.date.startsWith(selectedDay.date)
      );

      // Update or add the record in our state
      if (existingIndex >= 0) {
        // Update existing record
        updatedAttendanceData.attendances[existingIndex] = {
          ...updatedAttendanceData.attendances[existingIndex],
          status: editedAttendance.status,
          notes: editedAttendance.notes,
          checkIn: editedAttendance.checkIn || null,
          checkOut: editedAttendance.checkOut || null,
          _id:
            result._id || updatedAttendanceData.attendances[existingIndex]._id,
        };
      } else {
        // Add new record
        updatedAttendanceData.attendances.push({
          _id: result._id || Date.now().toString(),
          date: selectedDay.date,
          status: editedAttendance.status,
          notes: editedAttendance.notes,
          checkIn: editedAttendance.checkIn || null,
          checkOut: editedAttendance.checkOut || null,
        });
      }

      // Update the state with the new data
      setUserAttendance(updatedAttendanceData);

      // Update the selected day to reflect changes immediately
      setSelectedDay({
        ...selectedDay,
        status: editedAttendance.status,
        notes: editedAttendance.notes,
        checkIn: editedAttendance.checkIn || null,
        checkOut: editedAttendance.checkOut || null,
        _id: result._id || selectedDay._id,
      });

      setIsEditMode(false);
      toast.success("Attendance updated successfully");

      // Force a refresh of the calendar data
      // This is an extra measure to ensure the UI updates
      const refreshedAttendance = await getAttendanceByUserId(selectedUser._id);
      if (refreshedAttendance) {
        setUserAttendance(refreshedAttendance);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance");
    }
  };

  // Get month name
  const getMonthName = (monthIndex) => {
    return new Date(0, monthIndex).toLocaleString("default", { month: "long" });
  };

  // Calculate attendance stats
  const attendanceStats = useMemo(() => {
    if (!userAttendance) return { present: 0, remote: 0, absent: 0 };

    return {
      present: userAttendance.attendances.filter((a) => a.status === "present")
        .length,
      remote: userAttendance.attendances.filter((a) => a.status === "remote")
        .length,
      absent: userAttendance.attendances.filter((a) => a.status === "absent")
        .length,
    };
  }, [userAttendance]);

  return (
    <div className="overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header with theme toggle */}
      <motion.div
        className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Employee Attendance Dashboard
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 max-h-[calc(100vh-64px)]">
        {/* Left panel - Employee Selection */}
        <motion.div
          className="w-1/4 p-4 border-r border-gray-200 dark:border-gray-700 min-h-[45rem]"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="h-full flex flex-col">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Employee
            </label>
            <div
              id="user-dropdown"
              className="relative"
              onKeyDown={handleKeyDown}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border dark:border-gray-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {selectedUser ? (
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mr-3">
                      {selectedUser.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium dark:text-white">
                        {selectedUser.fullName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedUser.role}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    Choose an employee...
                  </span>
                )}
                <ChevronsUpDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 ${
                    isOpen ? "transform rotate-180" : ""
                  }`}
                />
              </motion.button>

              {/* Dropdown */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-lg z-20 overflow-hidden"
                  >
                    {/* Search */}
                    <div className="p-2 border-b dark:border-gray-700">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="Search employees..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setHighlightedIndex(0);
                          }}
                          className="w-full pl-10 pr-10 py-2 border dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 dark:bg-gray-700 dark:text-white"
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* User List */}
                    <div className="max-h-[45rem] overflow-y-auto">
                      {filteredUsers.length > 0 ? (
                        <ul>
                          {filteredUsers.map((user, index) => (
                            <motion.li
                              key={user._id}
                              whileHover={{
                                backgroundColor: darkMode
                                  ? "#1e40af20"
                                  : "#3b82f620",
                              }}
                              onClick={() => {
                                setSelectedUser(user);
                                setIsOpen(false);
                                setSearchQuery("");
                              }}
                              className={`px-4 py-3 cursor-pointer flex items-center transition-colors dark:text-white ${
                                highlightedIndex === index
                                  ? darkMode
                                    ? "bg-blue-900/20"
                                    : "bg-blue-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mr-3">
                                {user.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.role}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </motion.li>
                          ))}
                        </ul>
                      ) : (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No employees found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recent Activity */}
            {selectedUser && (
              <div className="mt-4 flex-1 overflow-y-auto">
                <motion.h3
                  className="font-semibold text-lg mb-3 flex items-center dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Clock className="mr-2" size={18} />
                  Recent Activity
                </motion.h3>

                {userAttendance && userAttendance.attendances.length > 0 ? (
                  <div className="space-y-2">
                    {userAttendance.attendances
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 3)
                      .map((record, index) => (
                        <motion.div
                          key={record._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * (index + 1) }}
                          className="p-3 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm flex items-center"
                        >
                          <div className="mr-3">
                            <StatusIcon status={record.status} size={18} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm dark:text-white">
                                {new Date(record.date).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {record.status}
                              </div>
                            </div>

                            {(record.checkIn || record.checkOut) && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {record.checkIn && (
                                  <span>
                                    In:{" "}
                                    {new Date(
                                      record.checkIn
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                                {record.checkIn && record.checkOut && (
                                  <span className="mx-1">•</span>
                                )}
                                {record.checkOut && (
                                  <span>
                                    Out:{" "}
                                    {new Date(
                                      record.checkOut
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                            )}

                            {record.notes && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                                {record.notes}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-2 px-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-sm"
                    >
                      <PlusCircle size={14} className="mr-2" />
                      View all activity
                    </motion.button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No attendance records found
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right panel - Attendance Details */}
        <div className="w-3/4 flex flex-col">
          {selectedUser ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedUser._id}
                className="flex flex-col h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Employee Header */}
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex items-center"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center justify-center h-12 w-12 rounded-full bg-white text-blue-600 text-xl font-bold mr-4"
                  >
                    {selectedUser.fullName.charAt(0)}
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedUser.fullName}
                    </h2>
                    <div className="flex text-sm text-blue-100">
                      <span>{selectedUser.role}</span>
                      <span className="mx-2">•</span>
                      <span>{selectedUser.email}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Joined:{" "}
                        {new Date(selectedUser.joinedDate).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short" }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="ml-auto flex space-x-6">
                    <motion.div
                      className="text-center"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="text-2xl font-bold flex items-center justify-center">
                        <CheckCircle2 size={16} className="mr-1" />{" "}
                        {attendanceStats.present}
                      </div>
                      <div className="text-xs text-blue-100">Present</div>
                    </motion.div>
                    <motion.div
                      className="text-center"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="text-2xl font-bold flex items-center justify-center">
                        <Monitor size={16} className="mr-1" />{" "}
                        {attendanceStats.remote}
                      </div>
                      <div className="text-xs text-blue-100">Remote</div>
                    </motion.div>
                    <motion.div
                      className="text-center"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="text-2xl font-bold flex items-center justify-center">
                        <AlertCircle size={16} className="mr-1" />{" "}
                        {attendanceStats.absent}
                      </div>
                      <div className="text-xs text-blue-100">Absent</div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Content Area */}
                <div className="flex-1 p-4 flex space-x-4 overflow-hidden">
                  {/* Calendar Panel */}
                  <motion.div
                    className="w-3/5 bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-hidden"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {/* Month Selector */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-lg font-semibold text-gray-800 dark:text-white">
                        <Calendar className="mr-2" size={18} />
                        Attendance Calendar
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={selectedMonth}
                          onChange={(e) =>
                            setSelectedMonth(parseInt(e.target.value))
                          }
                          className="px-3 py-1 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                              {getMonthName(i)}
                            </option>
                          ))}
                        </select>
                        <select
                          value={selectedYear}
                          onChange={(e) =>
                            setSelectedYear(parseInt(e.target.value))
                          }
                          className="px-3 py-1 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white"
                        >
                          {[2024, 2025].map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Calendar Grid */}
                    <div>
                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                          <div
                            key={day}
                            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar days */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarData.map((day, index) => {
                          if (day.empty) {
                            return (
                              <div
                                key={`empty-${index}`}
                                className="aspect-square"
                              ></div>
                            );
                          }

                          // Determine cell styling based on status
                          let bgColor = "bg-gray-100 dark:bg-gray-700"; // no data
                          let textColor = "text-gray-400 dark:text-gray-500";

                          if (day.status === "present") {
                            bgColor =
                              "bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/40";
                            textColor =
                              "text-emerald-700 dark:text-emerald-300";
                          } else if (day.status === "remote") {
                            bgColor =
                              "bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-200 dark:hover:bg-sky-800/40";
                            textColor = "text-sky-700 dark:text-sky-300";
                          } else if (day.status === "absent") {
                            bgColor =
                              "bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-800/40";
                            textColor = "text-rose-700 dark:text-rose-300";
                          } else if (day.status === "no-data") {
                            bgColor =
                              "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600";
                            textColor = "text-gray-500 dark:text-gray-400";
                          }

                          // Handle today's date
                          if (day.isToday) {
                            bgColor +=
                              " ring-2 ring-blue-500 dark:ring-blue-400";
                          }

                          // Handle selected day
                          const isSelected =
                            selectedDay && selectedDay.date === day.date;
                          if (isSelected) {
                            bgColor +=
                              " ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400";
                          }

                          return (
                            <motion.button
                              key={day.date}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`aspect-square rounded-lg ${bgColor} p-1 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200`}
                              onClick={() => handleDayClick(day)}
                            >
                              <span
                                className={`text-sm font-medium ${textColor}`}
                              >
                                {day.day}
                              </span>
                              {day.status !== "no-data" && (
                                <StatusIcon status={day.status} size={14} />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex justify-center mt-4 space-x-6 text-xs">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <div className="w-3 h-3 rounded-full bg-emerald-200 dark:bg-emerald-700 mr-1"></div>
                          Present
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <div className="w-3 h-3 rounded-full bg-sky-200 dark:bg-sky-700 mr-1"></div>
                          Remote
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <div className="w-3 h-3 rounded-full bg-rose-200 dark:bg-rose-700 mr-1"></div>
                          Absent
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 mr-1"></div>
                          No Data
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Details Panel */}
                  <motion.div
                    className="w-2/5 bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-hidden"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {selectedDay ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedDay.date}
                          className="h-full flex flex-col"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                              {new Date(selectedDay.date).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </h3>
                            {!isEditMode && (
                              <button
                                onClick={handleEditClick}
                                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
                              >
                                Edit
                              </button>
                            )}
                          </div>

                          {isEditMode ? (
                            <div className="flex-1 space-y-4">
                              {/* Edit Form */}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                  </label>
                                  <select
                                    name="status"
                                    value={editedAttendance.status}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  >
                                    <option value="present">Present</option>
                                    <option value="remote">Remote</option>
                                    <option value="absent">Absent</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Check In Time
                                  </label>
                                  <input
                                    type="datetime-local"
                                    name="checkIn"
                                    value={editedAttendance.checkIn}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Check Out Time
                                  </label>
                                  <input
                                    type="datetime-local"
                                    name="checkOut"
                                    value={editedAttendance.checkOut}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes
                                  </label>
                                  <textarea
                                    name="notes"
                                    value={editedAttendance.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Optional notes about this day..."
                                  ></textarea>
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2 pt-4">
                                <button
                                  onClick={() => setIsEditMode(false)}
                                  className="px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleSaveAttendance}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                                >
                                  <Save size={16} className="mr-2" />
                                  Save Changes
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1">
                              {/* View Mode */}
                              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 mb-4 flex items-center">
                                <StatusIcon
                                  status={
                                    selectedDay.status === "no-data"
                                      ? "absent"
                                      : selectedDay.status
                                  }
                                  size={24}
                                />
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                                    {selectedDay.status === "no-data"
                                      ? "No record"
                                      : selectedDay.status}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedDay.status === "no-data"
                                      ? "No attendance data recorded for this day"
                                      : selectedDay.status === "present"
                                      ? "Employee was present at the office"
                                      : selectedDay.status === "remote"
                                      ? "Employee worked remotely"
                                      : "Employee was absent"}
                                  </div>
                                </div>
                              </div>

                              {/* Check-in/Check-out details */}
                              {selectedDay.status !== "no-data" &&
                                (selectedDay.checkIn ||
                                  selectedDay.checkOut) && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Time Details
                                    </h4>
                                    <div className="space-y-2">
                                      {selectedDay.checkIn && (
                                        <div className="flex items-center text-sm">
                                          <Clock
                                            size={14}
                                            className="text-gray-500 dark:text-gray-400 mr-2"
                                          />
                                          <span className="text-gray-600 dark:text-gray-300 w-20">
                                            Check In:
                                          </span>
                                          <span className="text-gray-800 dark:text-white">
                                            {new Date(
                                              selectedDay.checkIn
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      )}
                                      {selectedDay.checkOut && (
                                        <div className="flex items-center text-sm">
                                          <Clock
                                            size={14}
                                            className="text-gray-500 dark:text-gray-400 mr-2"
                                          />
                                          <span className="text-gray-600 dark:text-gray-300 w-20">
                                            Check Out:
                                          </span>
                                          <span className="text-gray-800 dark:text-white">
                                            {new Date(
                                              selectedDay.checkOut
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      )}
                                      {selectedDay.checkIn &&
                                        selectedDay.checkOut && (
                                          <div className="flex items-center text-sm">
                                            <span className="ml-6 text-gray-600 dark:text-gray-300 w-20">
                                              Duration:
                                            </span>
                                            <span className="text-gray-800 dark:text-white">
                                              {(() => {
                                                const checkIn = new Date(
                                                  selectedDay.checkIn
                                                );
                                                const checkOut = new Date(
                                                  selectedDay.checkOut
                                                );
                                                const diff = checkOut - checkIn;
                                                const hours = Math.floor(
                                                  diff / (1000 * 60 * 60)
                                                );
                                                const minutes = Math.floor(
                                                  (diff % (1000 * 60 * 60)) /
                                                    (1000 * 60)
                                                );
                                                return `${hours}h ${minutes}m`;
                                              })()}
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                )}

                              {/* Notes */}
                              {selectedDay.status !== "no-data" && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notes
                                  </h4>
                                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600 min-h-24">
                                    {selectedDay.notes ? (
                                      <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {selectedDay.notes}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                        No notes for this day
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <Calendar size={48} className="mb-2 opacity-30" />
                        <p>Select a day to view details</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Search size={48} className="mx-auto mb-4" />
                </motion.div>
                <p className="text-xl">Select an employee to view attendance</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
