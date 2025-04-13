"use client";

import { useState } from "react";
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
import { nanoid } from "nanoid";
import { createUser, joinSession, getCurrentUser } from "@/lib/actions/user";

export interface UserNameFormProps {
  onComplete: () => void;
  sessionId: string;
}

export function UserNameForm({ onComplete, sessionId }: UserNameFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const existingUser = await getCurrentUser();
    const userId = existingUser?.id || nanoid();

    try {
      if (!existingUser) {
        await createUser({
          id: userId,
          name: name.trim(),
        });
      }

      await joinSession(userId, sessionId);
      onComplete();
    } catch (error) {
      console.error("Failed to create user or join session:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="space-y-2">
            <Coffee className="size-8" />
            <span>Join Session</span>
          </CardTitle>
          <CardDescription>
            Please enter your name to join the session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
