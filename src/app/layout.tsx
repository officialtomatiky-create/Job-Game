import type { Metadata } from "next";
import { Cairo } from "next/font/google"; // قمنا بتغيير الخط إلى Cairo لدعم العربية
import "./globals.css";
import Navbar from "@/components/Navbar"; // تأكد أن ملف Navbar موجود في components

// إعداد خط القاهرة بجميع الأوزان المطلوبة
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Job_Game Platform",
  description: "Automate your hiring process via WhatsApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-gray-50`}>
        {/* الناف بار سيظهر الآن في جميع الصفحات */}
        <Navbar />
        
        {/* المحتوى الرئيسي للصفحة */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}