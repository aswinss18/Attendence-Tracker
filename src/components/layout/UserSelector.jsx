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
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllUsers } from "@/controllers/functions";

// Simulated data - would be imported in real app
const users = [
  {
    _id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "Product Manager",
    joinedDate: "2023-05-12",
  },
  {
    _id: "2",
    name: "David Chen",
    email: "david@example.com",
    role: "Developer",
    joinedDate: "2023-08-22",
  },
  {
    _id: "3",
    name: "Michelle Garcia",
    email: "michelle@example.com",
    role: "UI/UX Designer",
    joinedDate: "2024-01-05",
  },
  {
    _id: "4",
    name: "Alex Thompson",
    email: "alex@example.com",
    role: "Data Analyst",
    joinedDate: "2023-11-15",
  },
  {
    _id: "5",
    name: "Jordan Smith",
    email: "jordan@example.com",
    role: "Marketing Specialist",
    joinedDate: "2023-07-03",
  },
];

const usersAttendance = [
  {
    userId: "1",
    attendances: [
      {
        _id: "a1",
        date: "2025-04-29",
        status: "present",
        checkIn: "2025-04-29T09:05:00",
        checkOut: "2025-04-29T17:15:00",
      },
      {
        _id: "a2",
        date: "2025-04-28",
        status: "present",
        checkIn: "2025-04-28T08:55:00",
        checkOut: "2025-04-28T17:30:00",
      },
      {
        _id: "a3",
        date: "2025-04-27",
        status: "remote",
        checkIn: "2025-04-27T09:30:00",
        checkOut: "2025-04-27T18:00:00",
      },
      {
        _id: "a4",
        date: "2025-04-26",
        status: "absent",
        notes: "Family emergency",
      },
    ],
  },
  {
    userId: "2",
    attendances: [
      { _id: "b1", date: "2025-04-29", status: "absent", notes: "Sick leave" },
      {
        _id: "b2",
        date: "2025-04-28",
        status: "remote",
        checkIn: "2025-04-28T09:25:00",
        checkOut: "2025-04-28T17:45:00",
      },
      {
        _id: "b3",
        date: "2025-04-27",
        status: "remote",
        checkIn: "2025-04-27T09:15:00",
        checkOut: "2025-04-27T18:10:00",
      },
      {
        _id: "b4",
        date: "2025-04-26",
        status: "present",
        checkIn: "2025-04-26T09:00:00",
        checkOut: "2025-04-26T17:00:00",
      },
      {
        _id: "b5",
        date: "2025-03-03",
        status: "present",
        checkIn: "2025-03-03T14:45:00",
        checkOut: "2025-03-03T23:15:00",
      },
    ],
  },
  {
    userId: "3",
    attendances: [
      {
        _id: "c1",
        date: "2025-04-29",
        status: "present",
        checkIn: "2025-04-29T08:50:00",
        checkOut: "2025-04-29T16:50:00",
      },
      {
        _id: "c2",
        date: "2025-04-28",
        status: "present",
        checkIn: "2025-04-28T08:45:00",
        checkOut: "2025-04-28T16:55:00",
      },
    ],
  },
];

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

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return usersData.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
    if (selectedUser) {
      const attendanceData = usersAttendance.find(
        (data) => data.userId === selectedUser._id
      );
      setUserAttendance(attendanceData || null);
    } else {
      setUserAttendance(null);
    }
  }, [selectedUser]);

  // Generate calendar data for contribution graph
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
      const attendance = userAttendance.attendances.find((a) =>
        a.date.startsWith(date)
      );

      calendar.push({
        date,
        day,
        status: attendance ? attendance.status : "no-data",
        checkIn: attendance?.checkIn || null,
        checkOut: attendance?.checkOut || null,
        notes: attendance?.notes || null,
      });
    }

    return calendar;
  }, [userAttendance, selectedMonth, selectedYear]);

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
  const handleDayClick = (day) => {
    if (day.empty) return;
    setSelectedDay(day);
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
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 max-h-[calc(100vh-64px)]">
        {/* Left panel - Employee Selection */}
        <motion.div
          className="w-1/4 p-4 border-r border-gray-200 dark:border-gray-700"
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
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium dark:text-white">
                        {selectedUser.name}
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
                    <div className="max-h-64 overflow-y-auto">
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
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
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
                    {selectedUser.name.charAt(0)}
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedUser.name}</h2>
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
                          }

                          const isSelected = selectedDay?.date === day.date;

                          return (
                            <motion.div
                              key={day.date}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDayClick(day)}
                              className={`aspect-square ${bgColor} rounded-md flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? "ring-2 ring-blue-500 transform scale-105"
                                  : ""
                              }`}
                            >
                              <div
                                className={`text-xs font-medium ${textColor}`}
                              >
                                {day.day}
                              </div>
                              {day.status !== "no-data" && (
                                <div className="mt-1">
                                  <StatusIcon status={day.status} size={12} />
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded bg-emerald-100 dark:bg-emerald-900/30 mr-1"></span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Present
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded bg-sky-100 dark:bg-sky-900/30 mr-1"></span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Remote
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded bg-rose-100 dark:bg-rose-900/30 mr-1"></span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Absent
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded bg-gray-100 dark:bg-gray-700 mr-1"></span>
                          <span className="text-gray-600 dark:text-gray-400">
                            No Data
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Detail Panel */}
                  <motion.div
                    className="w-2/5 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {selectedDay && selectedDay.status !== "no-data" ? (
                      <div className="h-full flex flex-col">
                        <div
                          className={`p-4 ${
                            selectedDay.status === "present"
                              ? "bg-emerald-500"
                              : selectedDay.status === "remote"
                              ? "bg-sky-500"
                              : "bg-rose-500"
                          } text-white`}
                        >
                          <h3 className="font-bold text-lg flex items-center">
                            <Calendar className="mr-2" size={18} />
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
                          <div className="flex items-center mt-1">
                            <StatusIcon status={selectedDay.status} size={16} />
                            <span className="ml-1 capitalize">
                              {selectedDay.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 flex-1">
                          {(selectedDay.checkIn || selectedDay.checkOut) && (
                            <div className="space-y-4">
                              {selectedDay.checkIn && (
                                <div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    Check-in Time
                                  </div>
                                  <div className="text-xl font-semibold flex items-center text-gray-800 dark:text-white">
                                    <Clock
                                      size={18}
                                      className="mr-2 text-blue-500"
                                    />
                                    {new Date(
                                      selectedDay.checkIn
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              )}

                              {selectedDay.checkOut && (
                                <div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    Check-out Time
                                  </div>
                                  <div className="text-xl font-semibold flex items-center text-gray-800 dark:text-white">
                                    <Clock
                                      size={18}
                                      className="mr-2 text-blue-500"
                                    />
                                    {new Date(
                                      selectedDay.checkOut
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              )}

                              {selectedDay.checkIn && selectedDay.checkOut && (
                                <div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    Total Hours
                                  </div>
                                  <div className="text-xl font-semibold text-gray-800 dark:text-white">
                                    {(() => {
                                      const checkIn = new Date(
                                        selectedDay.checkIn
                                      );
                                      const checkOut = new Date(
                                        selectedDay.checkOut
                                      );
                                      const diffMs = checkOut - checkIn;
                                      const diffHrs = Math.floor(
                                        diffMs / (1000 * 60 * 60)
                                      );
                                      const diffMins = Math.floor(
                                        (diffMs % (1000 * 60 * 60)) /
                                          (1000 * 60)
                                      );
                                      return `${diffHrs}h ${diffMins}m`;
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {selectedDay.notes && (
                            <div className="mt-4">
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Notes
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
                                {selectedDay.notes}
                              </div>
                            </div>
                          )}

                          {!selectedDay.checkIn &&
                            !selectedDay.checkOut &&
                            !selectedDay.notes && (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No additional details available
                              </div>
                            )}
                        </div>

                        <div className="border-t dark:border-gray-700 p-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200"
                          >
                            Edit Attendance Record
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                          <Calendar
                            size={28}
                            className="text-gray-400 dark:text-gray-500"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {selectedDay
                            ? "No attendance data for this day"
                            : "Select a day to view details"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                          {selectedDay
                            ? `There is no recorded attendance for ${new Date(
                                selectedDay.date
                              ).toLocaleDateString()}.`
                            : "Click on a day in the calendar to view attendance details."}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Monitor size={32} className="text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Select an Employee
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose an employee from the dropdown menu on the left to view
                  their attendance records and details.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
