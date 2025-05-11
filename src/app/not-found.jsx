"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ghost } from "lucide-react";
import Link from "next/link";

const messages = [
  "Looks like you're lost in the matrix.",
  "This page took a break. Try heading home.",
  "404: Code not found, like a missing semicolon.",
  "The page you're looking for doesn't exist… yet.",
  "Oops! That route seems to have vanished.",
];

export default function NotFound() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const random = Math.floor(Math.random() * messages.length);
    setMessage(messages[random]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-background text-foreground px-4">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mb-6"
      >
        <Ghost size={64} className="text-red-500 dark:text-red-400" />
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">404 – Page Not Found</h2>
      <p className="text-sm max-w-md text-gray-500 dark:text-gray-400 italic mb-6">
        "{message}"
      </p>
      <Link
        href="/"
        className="text-indigo-600 dark:text-indigo-400 font-medium underline hover:opacity-80 transition"
      >
        Go back home
      </Link>
    </div>
  );
}
