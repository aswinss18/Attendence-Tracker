"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithGoogle, subscribeToAuthChanges } from "@/lib/auth";

// List of allowed email addresses
const ALLOWED_EMAILS = ["aswinss0018@gmail.com", "exapmple@dffg.com"];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        // Check if the logged-in user's email is in the allowed list
        if (ALLOWED_EMAILS.includes(user.email)) {
          router.push("/admin/dashboard");
        } else {
          // Sign out unauthorized users
          import("@/lib/auth").then(({ signOut }) => {
            signOut();
            setError(
              "Access denied. You are not authorized to access this site."
            );
          });
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithGoogle();

      // Check if the user's email is in the allowed list
      if (result?.user && !ALLOWED_EMAILS.includes(result.user.email)) {
        // Sign out unauthorized users
        const { signOut } = await import("@/lib/auth");
        await signOut();
        setError("Access denied. You are not authorized to access this site.");
      }
      // If authorized, the redirect will happen automatically via useEffect
    } catch (error) {
      setError("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    },
    tap: { scale: 0.95 },
  };

  return (
    <div className="flex items-center justify-center h-[49rem] bg-gray-100 dark:bg-gray-900 dark:to-gray p-4">
      <motion.div
        className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Image
            src="/icon.png"
            alt="Next.js logo"
            width={120}
            height={25}
            priority
          />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-2xl font-bold mb-6 text-gray-800 dark:text-white"
        >
          Welcome Back
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-gray-600 dark:text-gray-300 text-center mb-8"
        >
          Sign in to access your dashboard
        </motion.p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white text-gray-700 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-70"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-gray-700 dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  fill="#FFC107"
                />
                <path
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  fill="#FF3D00"
                />
                <path
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  fill="#4CAF50"
                />
                <path
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  fill="#1976D2"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </motion.button>

        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 mt-8 text-sm text-gray-500 dark:text-gray-400"
        >
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
          <span>Secure login</span>
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
