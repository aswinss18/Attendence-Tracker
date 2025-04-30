// components/CustomToast.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function CustomToast(message, type = "info", onClose) {
  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg text-white ${bgColors[type]} z-50`}
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
}
