import Link from "next/link";
import { Coffee } from "lucide-react";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Coffee className="h-6 w-6" />
          <span>Kapi.run</span>
        </Link>
      </div>
    </header>
  );
}
