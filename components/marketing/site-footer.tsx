import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-xs space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              An adaptive Spanish learning platform — from your first "hola" to arguing politics
              at a dinner table in Buenos Aires.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Learn</p>
              <Link href="/#curriculum" className="block text-muted-foreground hover:text-foreground">
                Curriculum
              </Link>
              <Link href="/#features" className="block text-muted-foreground hover:text-foreground">
                Features
              </Link>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Account</p>
              <Link href="/login" className="block text-muted-foreground hover:text-foreground">
                Log in
              </Link>
              <Link href="/signup" className="block text-muted-foreground hover:text-foreground">
                Sign up
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sendero. Built as a demonstration learning platform.
        </p>
      </div>
    </footer>
  );
}
