"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import avatarImage from "@/app/avatarImage.jpeg";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Users", icon: Users, href: "/admin/users" },
  { name: "Attendance", icon: CalendarDays, href: "/admin/attendence" },
  // { name: "Leave", icon: PlaneTakeoff, href: "/admin/leave" },
  { name: "Reports", icon: FileText, href: "/admin/reports" },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock user data
  const user = {
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

  // Fix: Changed useState to useEffect for initial dark mode setting
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
        initial={false}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
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
                  src={user.avatar}
                  alt={user.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-800 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role}
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
            onClick={() => {}}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              >
                <Menu size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                Welcome, {user.name}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? (
                  <Sun size={20} className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <Moon size={20} className="text-gray-500" />
                )}
              </button>

              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <Bell size={20} className="text-gray-500 dark:text-gray-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                    {user.email}
                  </span>
                  <ChevronRight
                    size={16}
                    className={`text-gray-500 dark:text-gray-400 transition-transform ${
                      showProfileMenu ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Profile Settings
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Account Settings
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Log Out
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

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
