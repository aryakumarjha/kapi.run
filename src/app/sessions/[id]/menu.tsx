"use client";

import React from "react";
import { MenuResponse } from "@/types/menu";
import { MenuList } from "@/components/features/menu/menu-list";
import { CartSummary } from "@/components/features/cart/cart-summary";
import { Session } from "@prisma/client";

interface MenuProps {
  menu: MenuResponse;
  session: Session;
}

export default function Menu({ menu, session }: MenuProps) {
  return (
    <div className="md:flex md:gap-6">
      <MenuList menu={menu.menu} />
      <CartSummary session={session} />
    </div>
  );
}
