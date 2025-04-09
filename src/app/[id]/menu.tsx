"use client";
import useMenu from "@/lib/hooks/use-menu";
import type { Session } from "@prisma/client";

interface MenuProps {
  session: Session;
}

export default function Menu({ session }: MenuProps) {
  useMenu(session);

  return <div>{/* Render menu items here */}</div>;
}
