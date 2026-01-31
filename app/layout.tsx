import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElectroIoT - Electronics & IoT E-Commerce Platform",
  description: "Discover cutting-edge electronics and IoT solutions from trusted vendors. Shop the latest technology with secure payments and fast delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

