import type { Metadata } from "next";
import { MockStoreProvider } from "@/lib/mock-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chatbot Warga Admin",
  description: "Dashboard admin frontend-only untuk Chatbot Warga WhatsApp AI RAG",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <MockStoreProvider>{children}</MockStoreProvider>
      </body>
    </html>
  );
}
