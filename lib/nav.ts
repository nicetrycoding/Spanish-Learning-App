import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  Library,
  SpellCheck2,
  Headphones,
  Mic,
  PenLine,
  MessagesSquare,
  BookMarked,
  AlertTriangle,
  LineChart,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Practice", href: "/practice", icon: Dumbbell },
  { label: "Vocabulary", href: "/vocabulary", icon: Library },
  { label: "Grammar", href: "/grammar", icon: SpellCheck2 },
  { label: "Listening", href: "/listening", icon: Headphones },
  { label: "Speaking", href: "/speaking", icon: Mic },
  { label: "Writing", href: "/writing", icon: PenLine },
  { label: "Conversation", href: "/conversation", icon: MessagesSquare },
  { label: "Stories", href: "/stories", icon: BookMarked },
  { label: "Mistakes", href: "/mistakes", icon: AlertTriangle },
  { label: "Progress", href: "/progress", icon: LineChart },
  { label: "Settings", href: "/settings", icon: Settings },
];
