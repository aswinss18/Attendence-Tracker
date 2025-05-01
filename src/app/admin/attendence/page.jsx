"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  CheckCircle2,
  Monitor,
  AlertCircle,
  Search,
  X,
  Calendar,
  ExternalLink,
} from "lucide-react";

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
  {
    _id: "6",
    name: "Emily Williams",
    email: "emily@example.com",
    role: "Frontend Developer",
    joinedDate: "2023-09-18",
  },
  {
    _id: "7",
    name: "Marcus Lee",
    email: "marcus@example.com",
    role: "Backend Developer",
    joinedDate: "2024-02-10",
  },
  {
    _id: "8",
    name: "Sophia Rodriguez",
    email: "sophia@example.com",
    role: "Project Coordinator",
    joinedDate: "2023-10-05",
  },
];

// Today's attendance data (simulated)
const todayAttendance = [
  {
    userId: "1",
    status: "present",
    checkIn: "2025-05-01T08:45:00",
    checkOut: null,
  },
  {
    userId: "2",
    status: "remote",
    checkIn: "2025-05-01T09:10:00",
    checkOut: null,
  },
  {
    userId: "3",
    status: "present",
    checkIn: "2025-05-01T08:30:00",
    checkOut: null,
  },
  { userId: "4", status: "absent", reason: "Sick leave" },
  {
    userId: "5",
    status: "present",
    checkIn: "2025-05-01T08:55:00",
    checkOut: null,
  },
  {
    userId: "6",
    status: "remote",
    checkIn: "2025-05-01T09:05:00",
    checkOut: null,
  },
  { userId: "7", status: "absent", reason: "Vacation" },
  {
    userId: "8",
    status: "present",
    checkIn: "2025-05-01T08:50:00",
    checkOut: null,
  },
];

export default function TodayAttendanceOverview() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Get current date
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Compute attendance statistics
  const stats = useMemo(() => {
    return {
      present: todayAttendance.filter((a) => a.status === "present").length,
      remote: todayAttendance.filter((a) => a.status === "remote").length,
      absent: todayAttendance.filter((a) => a.status === "absent").length,
      total: todayAttendance.length,
    };
  }, []);

  // Get attendance status with user details
  const attendanceWithUserDetails = useMemo(() => {
    return todayAttendance.map((attendance) => {
      const user = users.find((u) => u._id === attendance.userId);
      return { ...attendance, ...user };
    });
  }, []);

  // Filter and search
  const filteredAttendance = useMemo(() => {
    return attendanceWithUserDetails.filter((record) => {
      // Status filter
      if (filterStatus !== "all" && record.status !== filterStatus) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          record.name?.toLowerCase().includes(query) ||
          record.email?.toLowerCase().includes(query) ||
          record.role?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [attendanceWithUserDetails, filterStatus, searchQuery]);

  // Group by status
  const groupedByStatus = useMemo(() => {
    const groups = {
      present: [],
      remote: [],
      absent: [],
    };

    filteredAttendance.forEach((record) => {
      if (groups[record.status]) {
        groups[record.status].push(record);
      }
    });

    return groups;
  }, [filteredAttendance]);

  // Status icon component
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

  // Calculate percentage for stats
  const getPercentage = (count) => {
    return Math.round((count / stats.total) * 100);
  };

  // Get time passed since check in
  const getTimeElapsed = (checkInTime) => {
    if (!checkInTime) return "--";

    const checkIn = new Date(checkInTime);
    const now = new Date();
    const diffMs = now - checkIn;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        className="bg-white dark:bg-gray-800 shadow-sm p-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Today's Attendance Overview
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentDate}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="p-4">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Total employees card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-4">
              <Users
                size={24}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Employees
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.total}
              </div>
            </div>
          </div>

          {/* Present card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-4">
              <CheckCircle2
                size={24}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Present
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.present}{" "}
                <span className="text-sm font-normal text-emerald-500">
                  ({getPercentage(stats.present)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Remote card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mr-4">
              <Monitor size={24} className="text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Remote
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.remote}{" "}
                <span className="text-sm font-normal text-sky-500">
                  ({getPercentage(stats.remote)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Absent card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mr-4">
              <AlertCircle
                size={24}
                className="text-rose-600 dark:text-rose-400"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Absent
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.absent}{" "}
                <span className="text-sm font-normal text-rose-500">
                  ({getPercentage(stats.absent)}%)
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* Search */}
          <div
            className={`relative w-full sm:w-64 transition-all duration-200 ${
              isSearchFocused ? "sm:w-80" : ""
            }`}
          >
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-10 pr-10 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-white"
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

          {/* Filter */}
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("present")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                filterStatus === "present"
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <CheckCircle2 size={14} className="mr-1" /> Present
            </button>
            <button
              onClick={() => setFilterStatus("remote")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                filterStatus === "remote"
                  ? "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Monitor size={14} className="mr-1" /> Remote
            </button>
            <button
              onClick={() => setFilterStatus("absent")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                filterStatus === "absent"
                  ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <AlertCircle size={14} className="mr-1" /> Absent
            </button>
          </div>
        </motion.div>

        {/* Attendance lists */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Present employees */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${
              filterStatus !== "all" && filterStatus !== "present"
                ? "hidden lg:block"
                : ""
            }`}
          >
            <div className="bg-emerald-500 py-3 px-4 text-white flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 size={18} className="mr-2" />
                <h3 className="font-semibold">Present</h3>
              </div>
              <div className="text-sm">
                {groupedByStatus.present.length} employees
              </div>
            </div>

            <div className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
              {groupedByStatus.present.length > 0 ? (
                groupedByStatus.present.map((record, index) => (
                  <motion.div
                    key={record.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white mr-3">
                        {record.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {record.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {record.role}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Checked in
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {new Date(record.checkIn).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-emerald-500">
                          {getTimeElapsed(record.checkIn)} elapsed
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No present employees found
                </div>
              )}
            </div>
          </div>

          {/* Remote employees */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${
              filterStatus !== "all" && filterStatus !== "remote"
                ? "hidden lg:block"
                : ""
            }`}
          >
            <div className="bg-sky-500 py-3 px-4 text-white flex items-center justify-between">
              <div className="flex items-center">
                <Monitor size={18} className="mr-2" />
                <h3 className="font-semibold">Remote</h3>
              </div>
              <div className="text-sm">
                {groupedByStatus.remote.length} employees
              </div>
            </div>

            <div className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
              {groupedByStatus.remote.length > 0 ? (
                groupedByStatus.remote.map((record, index) => (
                  <motion.div
                    key={record.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white mr-3">
                        {record.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {record.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {record.role}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Checked in
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {new Date(record.checkIn).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-sky-500">
                          {getTimeElapsed(record.checkIn)} elapsed
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No remote employees found
                </div>
              )}
            </div>
          </div>

          {/* Absent employees */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${
              filterStatus !== "all" && filterStatus !== "absent"
                ? "hidden lg:block"
                : ""
            }`}
          >
            <div className="bg-rose-500 py-3 px-4 text-white flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle size={18} className="mr-2" />
                <h3 className="font-semibold">Absent</h3>
              </div>
              <div className="text-sm">
                {groupedByStatus.absent.length} employees
              </div>
            </div>

            <div className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
              {groupedByStatus.absent.length > 0 ? (
                groupedByStatus.absent.map((record, index) => (
                  <motion.div
                    key={record.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white mr-3">
                        {record.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {record.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {record.role}
                        </div>
                      </div>
                      {record.reason && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-xs px-2 py-1 rounded">
                          {record.reason}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No absent employees found
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mt-6 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors">
            <Calendar size={16} className="mr-2" />
            View Full History
          </button>
          <button className="ml-3 flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
            <ExternalLink size={16} className="mr-2" />
            Export Report
          </button>
        </motion.div>
      </div>
    </div>
  );
}
