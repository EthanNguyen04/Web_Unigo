import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";


export const metadata: Metadata = {
  title: "Admin Panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
