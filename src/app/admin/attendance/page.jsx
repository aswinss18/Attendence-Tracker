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
  CalendarClock,
} from "lucide-react";
import { getTeamAttendanceOverview } from "@/controllers/functions";

export default function TodayAttendanceOverview() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Format today's date for API call
  const todayFormatted = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Fetch attendance data on component mount
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        const data = await getTeamAttendanceOverview(
          todayFormatted,
          todayFormatted
        );
        setAttendanceData(data);
      } catch (err) {
        console.error("Failed to fetch attendance data:", err);
        setError("Failed to load attendance data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [todayFormatted]);

  // Compute attendance statistics from real data
  const stats = useMemo(() => {
    if (!attendanceData) {
      return {
        total: 0,
        present: 0,
        remote: 0,
        absent: 0,
        leave: 0,
        presentPercentage: 0,
        remotePercentage: 0,
        absentPercentage: 0,
        leavePercentage: 0,
      };
    }

    return {
      total: attendanceData.totalEmployees || 0,
      present: attendanceData.userStats.filter((user) => user.present > 0)
        .length,
      remote: attendanceData.userStats.filter((user) => user.remote > 0).length,
      absent: attendanceData.userStats.filter((user) => user.absent > 0).length,
      leave: attendanceData.userStats.filter((user) => user.leave > 0).length,
      presentPercentage: attendanceData.presentPercentage || 0,
      remotePercentage: attendanceData.remotePercentage || 0,
      absentPercentage: attendanceData.absentPercentage || 0,
      leavePercentage: attendanceData.leavePercentage || 0,
    };
  }, [attendanceData]);

  // Map users to their attendance status for display
  const usersWithAttendance = useMemo(() => {
    if (!attendanceData) return [];

    // Create status objects for each user
    return attendanceData.userStats.map((user) => {
      // Determine primary status (prioritizing present > remote > leave > absent)
      let status = "not_marked";
      if (user.present > 0) status = "present";
      else if (user.remote > 0) status = "remote";
      else if (user.leave > 0) status = "leave";
      else if (user.absent > 0) status = "absent";

      return {
        userId: user.userId,
        fullName: user.fullName,
        role: user.role,
        status,
        workHours: user.workHours || 0,
        // We don't have check-in/check-out times in the data structure
        // You may need to add this if available in your actual implementation
      };
    });
  }, [attendanceData]);

  // Filter and search
  const filteredUsers = useMemo(() => {
    if (!usersWithAttendance.length) return [];

    return usersWithAttendance.filter((user) => {
      // Status filter
      if (filterStatus !== "all" && user.status !== filterStatus) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.fullName?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [usersWithAttendance, filterStatus, searchQuery]);

  // Group by status
  const groupedByStatus = useMemo(() => {
    const groups = {
      present: [],
      remote: [],
      absent: [],
      leave: [],
      not_marked: [],
    };

    filteredUsers.forEach((user) => {
      if (groups[user.status]) {
        groups[user.status].push(user);
      }
    });

    return groups;
  }, [filteredUsers]);

  // Get not marked users
  const notMarkedUsers = useMemo(() => {
    return attendanceData?.notMarkedToday || [];
  }, [attendanceData]);

  // Status icon component
  const StatusIcon = ({ status, size = 16 }) => {
    switch (status) {
      case "present":
        return <CheckCircle2 size={size} className="text-emerald-500" />;
      case "remote":
        return <Monitor size={size} className="text-sky-500" />;
      case "absent":
        return <AlertCircle size={size} className="text-rose-500" />;
      case "leave":
        return <CalendarClock size={size} className="text-amber-500" />;
      case "not_marked":
        return <Clock size={size} className="text-gray-400" />;
      default:
        return null;
    }
  };

  // Calculate percentage for stats
  const getPercentage = (count) => {
    return stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
  };

  // Format work hours
  const formatWorkHours = (hours) => {
    if (!hours || hours === 0) return "--";

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    return `${wholeHours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

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
          <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto py-1">
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
            <button
              onClick={() => setFilterStatus("not_marked")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                filterStatus === "not_marked"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Clock size={14} className="mr-1" /> Not Marked
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
                groupedByStatus.present.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white mr-3">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.role}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Work Hours
                        </div>
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {formatWorkHours(user.workHours)}
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
                groupedByStatus.remote.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white mr-3">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.role}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Work Hours
                        </div>
                        <div className="text-sm font-medium text-sky-600 dark:text-sky-400">
                          {formatWorkHours(user.workHours)}
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
                groupedByStatus.absent.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white mr-3">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.role}
                        </div>
                      </div>
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

        {/* Not Marked Today Section */}
        {filterStatus === "all" || filterStatus === "not_marked" ? (
          <motion.div
            className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-gray-200 dark:bg-gray-700 py-3 px-4 flex items-center justify-between">
              <div className="flex items-center">
                <Clock
                  size={18}
                  className="mr-2 text-gray-600 dark:text-gray-300"
                />
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  Not Marked Today
                </h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {notMarkedUsers.length} employees
              </div>
            </div>

            <div className="p-4">
              {notMarkedUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {notMarkedUsers.map((user, index) => (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.03 * index }}
                      className="bg-gray-50 dark:bg-gray-750 rounded p-3 flex items-center"
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 mr-3">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  All employees have marked their attendance today
                </div>
              )}
            </div>
          </motion.div>
        ) : null}

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
