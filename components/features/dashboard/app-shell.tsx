"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LogOut, Menu, Settings, User, X, Zap } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/actions/logout-action";

interface AppShellProps {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null };
  streak: number;
  xp: number;
}

export function AppShell({ children, user, streak, xp }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <StatPills streak={streak} xp={xp} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:justify-end md:px-6">
          <button
            className="rounded-md p-2 hover:bg-secondary md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="md:hidden">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <StatPills streak={streak} xp={xp} compact />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar>
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logoutAction}>
                  <button type="submit" className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-destructive">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-72 flex-col bg-card p-4 shadow-xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <Logo />
              <button className="rounded-md p-2 hover:bg-secondary" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <div className="border-t border-border pt-3">
              <StatPills streak={streak} xp={xp} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

function StatPills({ streak, xp, compact }: { streak: number; xp: number; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", compact ? "" : "justify-between")}>
      <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
        <Flame className="h-3.5 w-3.5" /> {streak}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
        <Zap className="h-3.5 w-3.5" /> {xp} XP
      </div>
    </div>
  );
}
