import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BioListen VN | Hệ thống Giám sát Âm thanh & Đa dạng Sinh học VQG Cúc Phương",
  description: "Hệ thống giám sát đa dạng sinh học và phát hiện mối đe dọa (tiếng súng, cưa máy) thời gian thực tại Vườn quốc gia Cúc Phương sử dụng Trí tuệ nhân tạo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground scanlines grid-bg">
        {children}
      </body>
    </html>
  );
}
