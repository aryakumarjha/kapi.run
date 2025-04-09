"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenuResponse, SimplifiedMenuItem } from "@/types/menu";
import { Search } from "lucide-react";
import { MenuItemCard } from "./item-card";

interface MenuProps {
  menu: MenuResponse;
}

export default function Menu({ menu }: MenuProps) {
  return (
    <div className="md:flex md:gap-6">
      <MenuList menu={menu.menu} />
    </div>
  );
}

const MenuList = ({ menu }: { menu: Record<string, SimplifiedMenuItem[]> }) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredMenu = React.useMemo(() => {
    if (!searchQuery.trim()) return menu;

    const filtered: Record<string, SimplifiedMenuItem[]> = {};
    Object.entries(menu).forEach(([category, items]) => {
      const matchingItems = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingItems.length > 0) {
        filtered[category] = matchingItems;
      }
    });
    return filtered;
  }, [menu, searchQuery]);

  return (
    <div className="w-2/3">
      <Card>
        <CardHeader>
          <CardTitle className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue={
                Object.keys(filteredMenu).length > 0
                  ? Object.keys(filteredMenu)[0]
                  : ""
              }
            >
              {Object.keys(filteredMenu).map((category) => (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border-b"
                >
                  <AccordionTrigger className="py-3 hover:no-underline cursor-pointer">
                    <div className="flex items-center text-left">
                      <span className="font-medium">{category}</span>
                      <Badge className="ml-2">
                        {filteredMenu[category].length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-3 py-2">
                      {filteredMenu[category].map((item) => (
                        <MenuItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
