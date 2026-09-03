import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/shared/logo";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  );
}
