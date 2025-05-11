"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getUserById,
  getAttendanceByUserIdAndDate,
  updateAttendance,
} from "@/controllers/functions"; // Assuming you have an auth context
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  LogIn,
  LogOut,
  Monitor,
  Briefcase,
  Users,
  PalmtreeIcon,
} from "lucide-react";
import { getAuth } from "firebase/auth";

const AttendancePage = () => {
  const { user } = getAuth();
  const [userData, setUserData] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Format today's date as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Format for display
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Time formatting function
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate work hours
  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";

    const startTime = new Date(checkIn);
    const endTime = new Date(checkOut);
    const diffInMs = endTime - startTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    const hours = Math.floor(diffInHours);
    const minutes = Math.floor((diffInHours - hours) * 60);

    return `${hours}h ${minutes}m`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30";
      case "remote":
        return "text-sky-500 bg-sky-100 dark:bg-sky-900/30";
      case "leave":
        return "text-amber-500 bg-amber-100 dark:bg-amber-900/30";
      case "absent":
        return "text-rose-500 bg-rose-100 dark:bg-rose-900/30";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <Briefcase size={16} />;
      case "remote":
        return <Monitor size={16} />;
      case "leave":
        return <PalmtreeIcon size={16} />;
      case "absent":
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!user?.uid) return;

        setLoading(true);

        // Fetch user data
        const userDetails = await getUserById(user.uid);
        setUserData(userDetails);

        // Fetch today's attendance
        const attendanceData = await getAttendanceByUserIdAndDate(
          user.uid,
          today
        );
        setTodayAttendance(attendanceData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Set up a timer to refresh at midnight
    const setMidnightRefresh = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const timeUntilMidnight = tomorrow - now;

      return setTimeout(() => {
        window.location.reload();
      }, timeUntilMidnight);
    };

    const midnightRefresh = setMidnightRefresh();

    return () => clearTimeout(midnightRefresh);
  }, [user?.uid, today]);

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);

      // If no attendance record exists for today, create one
      if (!todayAttendance || todayAttendance.isDefaultRecord) {
        const newAttendance = {
          date: today,
          status: "present", // Default status when checking in
          checkIn: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add the attendance record
        const attendanceId = await updateAttendance(
          todayAttendance?._id || `${user.uid}_${today}`,
          newAttendance
        );

        setTodayAttendance({
          ...newAttendance,
          _id: attendanceId || `${user.uid}_${today}`,
        });
      } else {
        // Update existing record
        const updatedAttendance = {
          ...todayAttendance,
          status: "present",
          checkIn: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await updateAttendance(todayAttendance._id, updatedAttendance);
        setTodayAttendance(updatedAttendance);
      }
    } catch (error) {
      console.error("Error checking in:", error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true);

      if (!todayAttendance) {
        console.error("No attendance record found for today");
        return;
      }

      const updatedAttendance = {
        ...todayAttendance,
        checkOut: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateAttendance(todayAttendance._id, updatedAttendance);
      setTodayAttendance(updatedAttendance);
    } catch (error) {
      console.error("Error checking out:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setStatusUpdating(true);

      if (!todayAttendance) {
        console.error("No attendance record found for today");
        return;
      }

      const updatedAttendance = {
        ...todayAttendance,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      await updateAttendance(todayAttendance._id, updatedAttendance);
      setTodayAttendance(updatedAttendance);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading attendance data...
          </p>
        </div>
      </div>
    );
  }

  const canCheckIn = !todayAttendance?.checkIn;
  const canCheckOut = !!todayAttendance?.checkIn && !todayAttendance?.checkOut;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="bg-white dark:bg-gray-800 shadow-sm p-4 rounded-lg mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Attendance Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar
                size={18}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <div className="text-sm font-medium text-gray-800 dark:text-white">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* User Attendance Card */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6 overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* User info */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-blue-600 text-2xl font-bold">
              {userData?.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {userData?.fullName || "User"}
              </h2>
              <p className="text-blue-100">{userData?.role || "Employee"}</p>
            </div>
          </div>
        </div>

        {/* Today's status */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Today's Attendance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </span>
                <div
                  className={`px-3 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(
                    todayAttendance?.status || "absent"
                  )}`}
                >
                  {getStatusIcon(todayAttendance?.status || "absent")}
                  <span className="text-sm font-medium">
                    {todayAttendance?.status
                      ? todayAttendance.status.charAt(0).toUpperCase() +
                        todayAttendance.status.slice(1)
                      : "Not Marked"}
                  </span>
                </div>
              </div>

              {/* Check-in time */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Check-in
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {todayAttendance?.checkIn
                    ? formatTime(todayAttendance.checkIn)
                    : "Not checked in"}
                </span>
              </div>

              {/* Check-out time */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Check-out
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {todayAttendance?.checkOut
                    ? formatTime(todayAttendance.checkOut)
                    : "Not checked out"}
                </span>
              </div>

              {/* Work hours */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Work Hours
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {calculateWorkHours(
                    todayAttendance?.checkIn,
                    todayAttendance?.checkOut
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCheckIn}
                  disabled={!canCheckIn || isCheckingIn}
                  className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-white ${
                    canCheckIn
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  <LogIn size={18} />
                  <span>{isCheckingIn ? "Checking In..." : "Check In"}</span>
                </button>

                <button
                  onClick={handleCheckOut}
                  disabled={!canCheckOut || isCheckingOut}
                  className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-white ${
                    canCheckOut
                      ? "bg-indigo-500 hover:bg-indigo-600"
                      : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  <LogOut size={18} />
                  <span>{isCheckingOut ? "Checking Out..." : "Check Out"}</span>
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Update Status
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus("present")}
                    disabled={
                      statusUpdating || todayAttendance?.status === "present"
                    }
                    className={`flex items-center justify-center space-x-1 py-1 px-2 rounded text-sm ${
                      todayAttendance?.status === "present"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                    }`}
                  >
                    <Briefcase size={14} />
                    <span>Present</span>
                  </button>

                  <button
                    onClick={() => updateStatus("remote")}
                    disabled={
                      statusUpdating || todayAttendance?.status === "remote"
                    }
                    className={`flex items-center justify-center space-x-1 py-1 px-2 rounded text-sm ${
                      todayAttendance?.status === "remote"
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 font-medium"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/10"
                    }`}
                  >
                    <Monitor size={14} />
                    <span>Remote</span>
                  </button>

                  <button
                    onClick={() => updateStatus("leave")}
                    disabled={
                      statusUpdating || todayAttendance?.status === "leave"
                    }
                    className={`flex items-center justify-center space-x-1 py-1 px-2 rounded text-sm ${
                      todayAttendance?.status === "leave"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                    }`}
                  >
                    <PalmtreeIcon size={14} />
                    <span>Leave</span>
                  </button>

                  <button
                    onClick={() => updateStatus("absent")}
                    disabled={
                      statusUpdating || todayAttendance?.status === "absent"
                    }
                    className={`flex items-center justify-center space-x-1 py-1 px-2 rounded text-sm ${
                      todayAttendance?.status === "absent"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-medium"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/10"
                    }`}
                  >
                    <AlertCircle size={14} />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Summary */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Your Weekly Summary
        </h3>

        <div className="relative h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: "55%" }}
            ></div>
            <div className="bg-sky-500 h-full" style={{ width: "20%" }}></div>
            <div className="bg-amber-500 h-full" style={{ width: "15%" }}></div>
            <div className="bg-rose-500 h-full" style={{ width: "10%" }}></div>
          </div>

          <div className="absolute inset-0 flex justify-between items-center px-4">
            <div className="text-xs font-medium text-white flex items-center">
              <CheckCircle2 size={12} className="mr-1" />
              <span>55% Present</span>
            </div>
            <div className="text-xs font-medium text-white flex items-center">
              <Monitor size={12} className="mr-1" />
              <span>20% Remote</span>
            </div>
            <div className="text-xs font-medium text-white flex items-center">
              <PalmtreeIcon size={12} className="mr-1" />
              <span>15% Leave</span>
            </div>
            <div className="text-xs font-medium text-white flex items-center">
              <AlertCircle size={12} className="mr-1" />
              <span>10% Absent</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Avg. Check-in
            </div>
            <div className="text-lg font-medium text-gray-800 dark:text-white">
              09:15 AM
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Avg. Check-out
            </div>
            <div className="text-lg font-medium text-gray-800 dark:text-white">
              05:45 PM
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Avg. Work Hours
            </div>
            <div className="text-lg font-medium text-gray-800 dark:text-white">
              8h 30m
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Work Hours
            </div>
            <div className="text-lg font-medium text-gray-800 dark:text-white">
              42h 30m
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AttendancePage;
