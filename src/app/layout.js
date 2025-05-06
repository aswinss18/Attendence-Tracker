import localFont from "next/font/local";
import "./globals.css";
import AdminLayout from "@/components/layout/AdminLayout";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "CheckMate",
  description:
    "CheckMate is your go-to attendance tracker, designed to ensure punctuality and efficiency in schools, workplaces, and events. Track attendance in real-time with ease and accuracy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AdminLayout>{children}</AdminLayout>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              padding: "1rem 1.5rem",
              borderRadius: "1rem",
              fontWeight: "500",
              fontSize: "0.95rem",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 15px 25px rgba(0, 0, 0, 0.1)",
              transition: "all 0.4s ease",
              transform: "translateY(-10px)",
            },
            success: {
              style: {
                backgroundColor: "rgb(34 197 94)", // Tailwind green-500
                color: "white",
              },
            },
            error: {
              style: {
                backgroundColor: "rgb(239 68 68)", // Tailwind red-500
                color: "white",
              },
            },
            info: {
              style: {
                backgroundColor: "rgb(59 130 246)", // Tailwind blue-500
                color: "white",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
