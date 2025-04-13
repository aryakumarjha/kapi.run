import { Card } from "@/components/ui/card";
import { SimplifiedMenuItem } from "@/types/menu";
import Image from "next/image";
import { useState } from "react";
import ItemCustomizationDialog from "@/components/features/cart/item-customization-dialog";
import { Badge } from "@/components/ui/badge";
import { nanoid } from "nanoid";
import { formatInr } from "@/lib/format-inr";

export const MenuItemCard = ({ item }: { item: SimplifiedMenuItem }) => {
  const [isDialogOpen, setIsDialogOpen] = useState({
    open: false,
    id: "",
  });

  const handleItemClick = () => {
    setIsDialogOpen({ open: true, id: nanoid() });
  };

  return (
    <>
      <Card
        className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors duration-200"
        onClick={handleItemClick}
      >
        <div className="flex justify-between">
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{item.name}</h3>
              {item.isVeg !== undefined && (
                <span
                  className={`h-4 w-4 rounded-full ${
                    item.isVeg ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              )}
              {(Array.isArray(item.addons) || Array.isArray(item.variants)) && (
                <Badge variant="outline" className="text-xs">
                  Customizable
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
            <p className="mt-2 font-medium">{formatInr(item.basePrice)}</p>
          </div>
          {item.imageUrl && (
            <div className="ml-4">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={80}
                height={80}
                className="object-cover rounded-md w-auto"
              />
            </div>
          )}
        </div>
      </Card>

      <ItemCustomizationDialog
        key={isDialogOpen.id}
        item={item}
        open={isDialogOpen.open}
        onClose={() => setIsDialogOpen({ open: false, id: "" })}
      />
    </>
  );
};
