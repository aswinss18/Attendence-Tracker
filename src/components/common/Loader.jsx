"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader as LoaderIcon } from "lucide-react";

const quotes = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Dreams don't work unless you do.",
  "The only way to do great work is to love what you do.",
  "Hustle in silence and let your success make the noise.",
  "Loading... Stay focused, stay hungry.",
  "Every line of code is a step toward greatness.",
  "It always seems impossible until it's done.",
];

export default function Loader() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const random = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[random]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-background text-foreground px-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="mb-6"
      >
        <LoaderIcon
          size={64}
          className="text-indigo-600 dark:text-indigo-400"
        />
      </motion.div>
      <h2 className="text-xl font-semibold mb-2">Loading...</h2>
      <p className="text-sm max-w-md text-gray-500 dark:text-gray-400 italic">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}