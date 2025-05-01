"use client"; // for App Router

import { motion } from "framer-motion";

export default function UpcomingPage() {
  return (
    <main className="flex min-h-[49rem] flex-col items-center justify-center bg-background text-foreground px-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="mt-24 text-4xl md:text-4xl font-bold text-gray-800 dark:text-white text-center">
          Something Cool is Coming...
        </h1>
        <p className="text-lg mt-10 text-gray-600 dark:text-gray-300 text-center">
          We're crafting something special for you. Stay tuned!
        </p>
      </motion.div>

      {/* Animated graphic below */}
      <motion.div
        className="relative mt-16 w-64 h-64"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-green-400 blur-2xl opacity-40" />
        <motion.div
          className="absolute inset-8 rounded-full border-[6px] border-dashed border-gray-300 dark:border-gray-600"
          animate={{
            rotate: [-15, 15, -15],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 3,
          }}
        />
        <div className="absolute inset-20 rounded-full bg-white dark:bg-gray-900 shadow-xl flex items-center justify-center">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            🔧 Building...
          </span>
        </div>
      </motion.div>
    </main>
  );
}
