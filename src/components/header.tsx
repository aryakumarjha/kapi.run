import Link from "next/link";
import { Coffee } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center mx-auto">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <Coffee className="h-5 w-5" />
          <span>Kapi.run</span>
        </Link>
        <div className="flex-1" /> {/** Spacer */}
        <ThemeSwitcher />
      </div>
    </header>
  );
}
