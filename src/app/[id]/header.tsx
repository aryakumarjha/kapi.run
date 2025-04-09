"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Session } from "@prisma/client";
import { format } from "date-fns";
import { Clock, Share2 } from "lucide-react";
import { useState } from "react";

interface MenuHeaderProps {
  session: Session;
}

export default function MenuHeader({ session }: MenuHeaderProps) {
  const [showFinalOrder, setShowFinalOrder] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Share2 className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Share"}
              </Button>
              <Dialog open={showFinalOrder} onOpenChange={setShowFinalOrder}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Final Order</DialogTitle>
                  </DialogHeader>
                  {/* <FinalOrderView session={session} /> */}
                </DialogContent>
              </Dialog>
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
