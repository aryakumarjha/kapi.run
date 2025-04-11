import { Button } from "@/components/ui/button";
import type { Session } from "@prisma/client";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import CopySession from "./copy-session";
import Link from "next/link";

interface MenuHeaderProps {
  session: Session;
}

export default function MenuHeader({ session }: MenuHeaderProps) {
  return (
    <div className="border-b sticky top-0 z-10 bg-background">
      <div className="container mx-auto py-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium">{session.restaurantName}</h1>
              <div className="flex items-center text-sm text-neutral-500">
                <span>Created by {session.creatorName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopySession />
              <Button variant="outline" size="sm" asChild>
                <Link href={`/orders/${session.id}`}>View Order</Link>
              </Button>
            </div>
          </div>

          {session.cutoffTime && (
            <div className="flex items-center rounded-md">
              <Clock className="mr-2 h-4 w-4" />
              <span className="text-sm">
                Cutoff: {format(new Date(session.cutoffTime), "hh:mm a")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
