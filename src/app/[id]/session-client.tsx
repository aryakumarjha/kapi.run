"use client";

import { Session } from "@prisma/client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/store/user";
import { getUserBySession } from "@/lib/actions/user";
import UserNameForm from "@/components/user-name-form";
import Menu from "./menu";
import MenuHeader from "./header";
import type { MenuResponse } from "@/types/menu";

interface SessionClientProps {
  session: Session;
  menu: MenuResponse;
}

export default function SessionClient({ session, menu }: SessionClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [needsNameForm, setNeedsNameForm] = useState(false);
  const { id: userId } = useUserStore();

  useEffect(() => {
    const checkUser = async () => {
      // await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate a delay
      if (!userId) {
        setNeedsNameForm(true);
        setIsLoading(false);
        return;
      }

      try {
        const user = await getUserBySession(session.id, userId);
        if (!user) {
          console.log("User not found for session:", session.id);
          setNeedsNameForm(true);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setNeedsNameForm(true);
      } finally {
        setIsLoading(false);
      }
    };

    console.log("Checking user for session:", session.id);

    checkUser();
  }, [session.id, userId]);

  if (isLoading) {
    return null; // Or show a loading spinner
  }

  if (needsNameForm) {
    return (
      <UserNameForm
        sessionId={session.id}
        onComplete={() => setNeedsNameForm(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <MenuHeader session={session} />
      <main className="@container/menu container mx-auto flex-1">
        <Menu menu={menu} />
      </main>
    </div>
  );
}
