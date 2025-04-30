import localFont from "next/font/local";
import "./globals.css";
import AdminLayout from "@/components/layout/AdminLayout";

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
      </body>
    </html>
  );
}
