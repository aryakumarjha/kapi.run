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
import { useUserStore } from "@/lib/store/user";
import { createUser } from "@/lib/actions/user";

interface UserNameFormProps {
  onComplete: () => void;
  sessionId: string;
}

export default function UserNameForm({
  onComplete,
  sessionId,
}: UserNameFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const userId = nanoid();

    try {
      await createUser({
        id: userId,
        name: name.trim(),
        sessionId,
      });

      setUser(userId, name.trim());
      onComplete();
    } catch (error) {
      console.error("Failed to create user:", error);
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
            <span>Welcome!</span>
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
