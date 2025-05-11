"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  PlaneTakeoff,
  FileText,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bell,
  Moon,
  Sun,
  CheckCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import avatarImage from "@/app/avatarImage.jpeg";
import { signOut, subscribeToAuthChanges } from "@/lib/auth";
import { useRouter } from "next/navigation";
import CustomToast from "@/components/common/Toast";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Users", icon: Users, href: "/admin/users" },
  { name: "Attendance", icon: CalendarDays, href: "/admin/attendance" },
  { name: "Punch In", icon: Clock, href: "/punchin" },
  { name: "Reports", icon: FileText, href: "/admin/reports" },
];

// Sample notification data
const initialNotifications = [
  {
    id: 1,
    title: "New User Registration",
    message: "John Smith has registered as a new employee",
    time: "5 minutes ago",
    read: false,
    type: "info",
  },
  {
    id: 2,
    title: "Leave Request",
    message: "Sarah Johnson has requested leave from 15-18 May",
    time: "2 hours ago",
    read: false,
    type: "action",
  },
  {
    id: 3,
    title: "Attendance Report",
    message: "Weekly attendance report is ready for review",
    time: "1 day ago",
    read: false,
    type: "system",
  },
  {
    id: 4,
    title: "System Update",
    message: "Checkmate will undergo maintenance on Sunday at 2AM",
    time: "2 days ago",
    read: true,
    type: "system",
  },
  {
    id: 5,
    title: "Task Completed",
    message: "Q1 financial reports have been generated",
    time: "3 days ago",
    read: true,
    type: "success",
  },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Calculate unread notifications count
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    setNotificationCount(unreadCount);
  }, [notifications]);

  // Authentication listener setup
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    setIsLoading(true);

    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      // Redirect to home if not authenticated and not in loading state
      if (!currentUser && !isLoading) {
        router.push("/");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]); // Only depend on router

  // Fallback user data when real auth data is unavailable
  const displayUser = user
    ? {
        name: user.displayName || "User",
        email: user.email || "user@example.com",
        avatar: user.photoURL || avatarImage,
        role: "Administrator",
      }
    : {
        name: "Aswin S S",
        email: "ssaswin18@checkmate.com",
        avatar: avatarImage,
        role: "Administrator",
      };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Apply dark mode to document element for Tailwind dark mode to work
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
      // You can display the toast here if needed
      // CustomToast({ message: "Logged out successfully", type: "success" });
    } catch (error) {
      console.error("Logout error:", error);
      // CustomToast({ message: "Logout failed", type: "error" });
    }
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
  };

  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initial dark mode setting
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Handle loading or unauthenticated state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "info":
        return (
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <Bell size={14} className="text-blue-500 dark:text-blue-300" />
          </div>
        );
      case "action":
        return (
          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
            <Clock size={14} className="text-amber-500 dark:text-amber-300" />
          </div>
        );
      case "success":
        return (
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
            <CheckCheck
              size={14}
              className="text-green-500 dark:text-green-300"
            />
          </div>
        );
      case "system":
      default:
        return (
          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
            <Bell size={14} className="text-purple-500 dark:text-purple-300" />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      {user && (
        <motion.div
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static`}
          initial={false}
        >
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2"
            >
              <div className="flex items-center space-x-2">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  priority
                />
                <span className="font-poppins font-semibold text-2xl text-[#f27c1d] tracking-wide">
                  Checkmate
                </span>
              </div>
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-4">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={displayUser.avatar}
                    alt={displayUser.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-800 dark:text-white">
                    {displayUser.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {displayUser.role}
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map(({ name, icon: Icon, href }, idx) => (
                <Link
                  key={name}
                  href={href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-gray-600 transition-colors">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-gray-600 transition-colors">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Log Out
              </span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Top Header */}
        {user && (
          <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                >
                  <Menu
                    size={20}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </button>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Welcome, {displayUser.name}
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? (
                    <Sun
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  ) : (
                    <Moon size={20} className="text-gray-500" />
                  )}
                </button>

                {/* Notification Button */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                  >
                    <Bell
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full transform scale-90">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Panel */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
                      >
                        <div className="p-3 border-b dark:border-gray-700 flex items-center justify-between">
                          <h3 className="font-medium text-gray-800 dark:text-white">
                            Notifications
                          </h3>
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          >
                            Mark all as read
                          </button>
                        </div>

                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length > 0 ? (
                            <div>
                              {notifications.map((notification) => (
                                <motion.div
                                  key={notification.id}
                                  initial={{ x: -10, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                  className={`p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                                    !notification.read
                                      ? "bg-indigo-50 dark:bg-gray-750"
                                      : ""
                                  }`}
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <div className="flex items-start space-x-3">
                                    {getNotificationIcon(notification.type)}
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm font-medium ${
                                          !notification.read
                                            ? "text-gray-900 dark:text-white"
                                            : "text-gray-700 dark:text-gray-300"
                                        }`}
                                      >
                                        {notification.title}
                                      </p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        {notification.time}
                                      </p>
                                    </div>
                                    {!notification.read && (
                                      <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></span>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                              No notifications
                            </div>
                          )}
                        </div>

                        <div className="p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-center">
                          <Link
                            href="/admin/notifications"
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          >
                            View all notifications
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Menu */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={displayUser.avatar}
                        alt={displayUser.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                        priority
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                      {displayUser.email}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`text-gray-500 dark:text-gray-400 transition-transform ${
                        showProfileMenu ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {displayUser.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {displayUser.email}
                          </p>
                        </div>
                        <Link
                          href="/admin/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Profile Settings
                        </Link>
                        <Link
                          href="/admin/account"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Account Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 h-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
