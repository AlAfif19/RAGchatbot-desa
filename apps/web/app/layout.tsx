import type { Metadata } from "next";
import { AppStoreProvider } from "@/lib/app-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chatbot Warga Admin",
  description: "Dashboard admin untuk Chatbot Warga WhatsApp AI RAG",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
