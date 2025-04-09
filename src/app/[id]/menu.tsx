"use client";

import React from "react";
import { MenuResponse } from "@/types/menu";
import { MenuList } from "./menu-list";
import { CartSummary } from "./cart-summary";

interface MenuProps {
  menu: MenuResponse;
}

export default function Menu({ menu }: MenuProps) {
  return (
    <div className="md:flex md:gap-6">
      <MenuList menu={menu.menu} />
      <CartSummary />
    </div>
  );
}
