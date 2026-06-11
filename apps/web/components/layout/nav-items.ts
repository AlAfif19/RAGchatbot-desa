import {
  Bot,
  Database,
  Gauge,
  HelpCircle,
  MessageSquareText,
  Settings
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/chatbot-number", label: "Nomor Chatbot", icon: Bot },
  { href: "/data-source", label: "Sumber Data", icon: Database },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/chat-log", label: "Chat Log", icon: MessageSquareText },
  { href: "/settings", label: "Pengaturan AI", icon: Settings }
];
