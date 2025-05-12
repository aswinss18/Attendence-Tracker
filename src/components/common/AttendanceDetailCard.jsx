"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Save,
  CheckCircle,
  XCircle,
  Home,
  Edit2,
  FileText,
  Calendar as CalendarIcon,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

// Status Icon Component with Lucide icons
const StatusIcon = ({ status, size = 20 }) => {
  switch (status) {
    case "present":
      return <CheckCircle size={size} className="text-green-500" />;
    case "remote":
      return <Home size={size} className="text-blue-500" />;
    case "absent":
      return <XCircle size={size} className="text-red-500" />;
    default:
      return <Calendar size={size} className="text-gray-400" />;
  }
};

// Time Picker Component
const TimePicker = ({ value, onChange, label }) => {
  // Convert datetime string to hours and minutes
  const getTimeValues = () => {
    if (!value) return { hours: "09", minutes: "00" };
    const date = new Date(value);
    return {
      hours: String(date.getHours()).padStart(2, "0"),
      minutes: String(date.getMinutes()).padStart(2, "0"),
    };
  };

  const { hours, minutes } = getTimeValues();

  // Handle time change and update the full datetime
  const handleTimeChange = (type, newValue) => {
    const date = value ? new Date(value) : new Date();

    if (type === "hours") {
      date.setHours(parseInt(newValue, 10));
    } else {
      date.setMinutes(parseInt(newValue, 10));
    }

    onChange(date.toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <Clock size={18} className="text-gray-500 dark:text-gray-400" />
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-md p-1">
          <select
            value={hours}
            onChange={(e) => handleTimeChange("hours", e.target.value)}
            className="bg-transparent border-none text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-0 appearance-none cursor-pointer px-1"
          >
            {Array.from({ length: 24 }, (_, i) =>
              String(i).padStart(2, "0")
            ).map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
          <span className="text-gray-500 dark:text-gray-400">:</span>
          <select
            value={minutes}
            onChange={(e) => handleTimeChange("minutes", e.target.value)}
            className="bg-transparent border-none text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-0 appearance-none cursor-pointer px-1"
          >
            {Array.from({ length: 60 }, (_, i) =>
              String(i).padStart(2, "0")
            ).map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Radio Option for Status Selection
const StatusRadioOption = ({
  id,
  value,
  currentValue,
  label,
  icon,
  onChange,
}) => {
  const isSelected = currentValue === value;

  return (
    <div
      onClick={() => onChange({ target: { name: "status", value } })}
      className={`flex-1 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
      } border rounded-lg p-3 flex flex-col items-center justify-center`}
    >
      <input
        type="radio"
        id={id}
        name="status"
        value={value}
        checked={isSelected}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={`p-2 rounded-full mb-2 ${
          isSelected
            ? "bg-blue-100 dark:bg-blue-900/50"
            : "bg-gray-100 dark:bg-gray-700"
        }`}
      >
        {icon}
      </div>
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-800 dark:text-white cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
};

// Main Component
export default function AttendanceDetailCard({
  selectedDay,
  isEditMode,
  setIsEditMode,
  editedAttendance,
  handleInputChange,
  handleEditClick,
  handleSaveAttendance,
}) {
  // Mock data for demo

  return (
    <motion.div
      className="w-2/5 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
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
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <CalendarIcon size={18} className="text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  {new Date(selectedDay.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
              </div>

              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeft size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowRight size={16} />
                </motion.button>

                {!isEditMode && (
                  <motion.button
                    onClick={handleEditClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center"
                  >
                    <Edit2 size={16} className="mr-1" />
                    <span className="text-sm">Edit</span>
                  </motion.button>
                )}
              </div>
            </div>

            <div className="p-4 flex-1">
              {isEditMode ? (
                <div className="space-y-6">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Attendance Status
                    </label>
                    <div className="flex space-x-3">
                      <StatusRadioOption
                        id="status-present"
                        value="present"
                        currentValue={editedAttendance.status}
                        label="Present"
                        icon={
                          <CheckCircle size={22} className="text-green-500" />
                        }
                        onChange={handleInputChange}
                      />
                      <StatusRadioOption
                        id="status-remote"
                        value="remote"
                        currentValue={editedAttendance.status}
                        label="Remote"
                        icon={<Home size={22} className="text-blue-500" />}
                        onChange={handleInputChange}
                      />
                      <StatusRadioOption
                        id="status-absent"
                        value="absent"
                        currentValue={editedAttendance.status}
                        label="Absent"
                        icon={<XCircle size={22} className="text-red-500" />}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <TimePicker
                      label="Check In Time"
                      value={editedAttendance.checkIn}
                      onChange={(value) =>
                        setEditedAttendance((prev) => ({
                          ...prev,
                          checkIn: value,
                        }))
                      }
                    />
                    <TimePicker
                      label="Check Out Time"
                      value={editedAttendance.checkOut}
                      onChange={(value) =>
                        setEditedAttendance((prev) => ({
                          ...prev,
                          checkOut: value,
                        }))
                      }
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FileText size={16} className="mr-2" />
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={editedAttendance.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      placeholder="Optional notes about this day..."
                    ></textarea>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveAttendance}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center shadow-sm"
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-3 rounded-full ${
                          selectedDay.status === "present"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : selectedDay.status === "remote"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        <StatusIcon status={selectedDay.status} size={24} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-800 dark:text-white capitalize">
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
                  </motion.div>

                  {/* Time Details */}
                  {selectedDay.status !== "no-data" &&
                    (selectedDay.checkIn || selectedDay.checkOut) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm"
                      >
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                          <Clock size={16} className="mr-2 text-blue-500" />
                          Time Details
                        </h4>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            {selectedDay.checkIn && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Check In
                                </div>
                                <div className="text-sm font-medium text-gray-800 dark:text-white">
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
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Check Out
                                </div>
                                <div className="text-sm font-medium text-gray-800 dark:text-white">
                                  {new Date(
                                    selectedDay.checkOut
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {selectedDay.checkIn && selectedDay.checkOut && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-2">
                              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                                Total Duration
                              </div>
                              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                {(() => {
                                  const checkIn = new Date(selectedDay.checkIn);
                                  const checkOut = new Date(
                                    selectedDay.checkOut
                                  );
                                  const diff = checkOut - checkIn;
                                  const hours = Math.floor(
                                    diff / (1000 * 60 * 60)
                                  );
                                  const minutes = Math.floor(
                                    (diff % (1000 * 60 * 60)) / (1000 * 60)
                                  );
                                  return `${hours}h ${minutes}m`;
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                  {/* Notes */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm"
                  >
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <FileText size={16} className="mr-2 text-blue-500" />
                      Notes
                    </h4>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg min-h-24">
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
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full mb-4">
            <Calendar size={48} className="opacity-70" />
          </div>
          <p className="text-lg">Select a day to view details</p>
        </div>
      )}
    </motion.div>
  );
}
