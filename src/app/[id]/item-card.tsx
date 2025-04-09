import { Card } from "@/components/ui/card";
import { SimplifiedMenuItem } from "@/types/menu";
import Image from "next/image";

export const MenuItemCard = ({ item }: { item: SimplifiedMenuItem }) => {
  const formatInr = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  return (
    <Card className="px-6 py-4">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{item.name}</h3>
            {item.isVeg !== undefined && (
              <span
                className={`h-4 w-4 rounded-full ${
                  item.isVeg ? "bg-green-500" : "bg-red-500"
                }`}
              />
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
              className="object-cover rounded-md"
            />
          </div>
        )}
      </div>
    </Card>
  );
};
