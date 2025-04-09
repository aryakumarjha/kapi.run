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
  const { id: userId, rehydrayted } = useUserStore();

  useEffect(() => {
    const checkUser = async () => {
      if (!rehydrayted) return;
      if (!userId) {
        console.log("No user ID found, showing name form");
        setNeedsNameForm(true);
        setIsLoading(false);
        return;
      }

      try {
        const user = await getUserBySession(session.id, userId);
        console.log("User found:", user);
        setNeedsNameForm(!!user);
      } catch (error) {
        console.error("Error checking user:", error);
        setNeedsNameForm(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [session.id, userId, rehydrayted]);

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
