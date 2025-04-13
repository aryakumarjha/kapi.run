import Link from "next/link";
import { Coffee, Plus, User2 } from "lucide-react";
import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { getCurrentUser } from "@/lib/actions/user";
import { getUserSessions } from "@/lib/actions/user-sessions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site";
import FormattedTime from "./time";

export async function Header() {
  const user = await getCurrentUser();
  const sessions = user ? await getUserSessions(user.id) : [];

  return (
    <header className="border-b sticky top-0 z-10 bg-background px-4">
      <div className="container flex h-14 items-center mx-auto">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <Coffee className="h-5 w-5" />
          <span>{SITE_CONFIG.applicationName}</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-fit">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sessions.length > 0 ? (
                  <>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Your Sessions
                    </DropdownMenuLabel>
                    {sessions.map((session) => (
                      <DropdownMenuItem key={session.id} asChild>
                        <Link href={`/sessions/${session.id}`}>
                          <div className="w-full pr-4">
                            <div className="font-medium">
                              {session.restaurantName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <FormattedTime
                                input={session.createdAt!.toISOString()}
                                format="MMM d, h:mm a"
                              />
                              {" - "}
                              <FormattedTime
                                input={session.cutoffTime!.toISOString()}
                                format="h:mm a"
                              />
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link href="/create">
                    <Plus className="mr-1 size-4" />
                    Create New Session
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
