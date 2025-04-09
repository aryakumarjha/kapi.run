import { Menu, MenuCategory, SimplifiedMenuItem } from "@/types/menu";
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
import { MenuItemCard } from "./item-card";
import { Search } from "lucide-react";

export const MenuList = ({ menu }: { menu: Menu }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  console.log("MenuList rendered with menu:", menu);
  const filteredMenu = React.useMemo(() => {
    if (!searchQuery.trim()) return menu;

    const filtered: Record<string, MenuCategory> = {};
    Object.entries(menu).forEach(([category, menuCategory]) => {
      const matchingItems = menuCategory.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchingSubcategories: Record<string, SimplifiedMenuItem[]> = {};
      if (menuCategory.subcategories) {
        Object.entries(menuCategory.subcategories).forEach(
          ([subcat, items]) => {
            const matchingSubItems = items.filter(
              (item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())
            );
            if (matchingSubItems.length > 0) {
              matchingSubcategories[subcat] = matchingSubItems;
            }
          }
        );
      }

      if (
        matchingItems.length > 0 ||
        Object.keys(matchingSubcategories).length > 0
      ) {
        filtered[category] = {
          ...menuCategory,
          items: matchingItems,
          subcategories:
            Object.keys(matchingSubcategories).length > 0
              ? matchingSubcategories
              : undefined,
        };
      }
    });
    return filtered;
  }, [menu, searchQuery]);

  const getTotalItemCount = (category: MenuCategory) => {
    let count = category.items.length;
    if (category.subcategories) {
      Object.values(category.subcategories).forEach((items) => {
        count += items.length;
      });
    }
    return count;
  };

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
              name="search"
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
              {Object.entries(filteredMenu).map(([category, menuCategory]) => (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border-b"
                >
                  <AccordionTrigger className="py-3 hover:no-underline cursor-pointer">
                    <div className="flex items-center text-left">
                      <span className="font-medium">{category}</span>
                      <Badge className="ml-2">
                        {getTotalItemCount(menuCategory)}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {/* Main category items */}
                      {menuCategory.items.length > 0 && (
                        <div className="grid grid-cols-1 gap-3">
                          {menuCategory.items.map((item) => (
                            <MenuItemCard key={item.id} item={item} />
                          ))}
                        </div>
                      )}

                      {/* Subcategories */}
                      {menuCategory.subcategories &&
                        Object.entries(menuCategory.subcategories).map(
                          ([subcat, items]) => (
                            <div key={subcat} className="pt-2">
                              <div className="flex items-center mb-2">
                                <h3 className="text-sm font-medium">
                                  {subcat}
                                </h3>
                                <Badge variant="secondary" className="ml-2">
                                  {items.length}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {items.map((item) => (
                                  <MenuItemCard key={item.id} item={item} />
                                ))}
                              </div>
                            </div>
                          )
                        )}
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
