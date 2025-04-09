"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coffee } from "lucide-react";
import { Label } from "@/components/ui/label";
import { joinSession } from "@/lib/actions/session";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="space-y-2">
            <Coffee className="size-8" />
            <span>Start your team&apos;s food order now</span>
          </CardTitle>
          <CardDescription>
            Simplify group food ordering with Kapi.run.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/create">Create a New Session</Link>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or join a session
              </span>
            </div>
          </div>

          <form name="join-session" action={joinSession}>
            <div className="flex gap-2">
              <Label htmlFor="kapi-session-link" className="sr-only">
                Session Link
              </Label>
              <Input
                placeholder="e.g. https://kapi.run/abc123"
                className="flex-1"
                name="kapi-session-link"
                required
              />
              <Button
                variant="secondary"
                type="submit"
                className="cursor-pointer"
              >
                Join
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
