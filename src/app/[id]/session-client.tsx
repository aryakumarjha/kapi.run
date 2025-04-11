"use client";

import { Session } from "@prisma/client";
import { useEffect, useState } from "react";
import { isUserInSession, getCurrentUser } from "@/lib/actions/user";
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

  useEffect(() => {
    const checkUserParticipation = async () => {
      const user = await getCurrentUser();

      if (!user) {
        setNeedsNameForm(true);
        setIsLoading(false);
        return;
      }

      try {
        const isParticipating = await isUserInSession(user.id, session.id);
        setNeedsNameForm(!isParticipating);
      } catch (error) {
        console.error("Error checking user participation:", error);
        setNeedsNameForm(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserParticipation();
  }, [session.id]);

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
        <Menu menu={menu} session={session} />
      </main>
    </div>
  );
}
