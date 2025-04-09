import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { SimplifiedMenuItem, type Addon } from "@/types/menu";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "./ui/label";
import { useCart } from "@/lib/store/cart";
import { Badge } from "./ui/badge";

interface ItemCustomizationDialogProps {
  item: SimplifiedMenuItem;
  open: boolean;
  onClose: () => void;
}

export function ItemCustomizationDialog({
  item,
  open,
  onClose,
}: ItemCustomizationDialogProps) {
  // Sort and preselect lowest price addons when dialog opens
  const [selectedAddons, setSelectedAddons] = useState<{
    [groupId: string]: Addon[];
  }>(() => {
    const initialSelections: { [groupId: string]: Addon[] } = {};

    item.customizations?.forEach((group) => {
      const sortedChoices = [...group.choices].sort(
        (a, b) => a.price - b.price
      );
      // Only preselect if there's a minimum requirement and the first choice is available
      if (
        group.minAddons &&
        group.minAddons > 0 &&
        sortedChoices[0]?.inStock !== false
      ) {
        initialSelections[group.groupId] = [sortedChoices[0]];
      }
    });

    return initialSelections;
  });

  const { addItem } = useCart();

  const formatInr = (price: number) => {
    if (isNaN(price)) {
      price = 0;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const handleAddonChange = (
    groupId: string,
    addon: Addon,
    isMultiSelect: boolean
  ) => {
    setSelectedAddons((prev) => {
      const currentGroupAddons = prev[groupId] || [];

      if (isMultiSelect) {
        const exists = currentGroupAddons.some((a) => a.id === addon.id);
        if (exists) {
          return {
            ...prev,
            [groupId]: currentGroupAddons.filter((a) => a.id !== addon.id),
          };
        } else {
          return {
            ...prev,
            [groupId]: [...currentGroupAddons, addon],
          };
        }
      } else {
        // Radio button behavior
        return {
          ...prev,
          [groupId]: [addon],
        };
      }
    });
  };

  const handleAddToCart = () => {
    const formattedAddons = Object.entries(selectedAddons).map(
      ([groupId, addons]) => ({
        groupId,
        addons,
      })
    );

    addItem({
      menuItem: item,
      quantity: 1,
      selectedAddons: formattedAddons,
    });

    onClose();
    setSelectedAddons({});
  };

  const calculateTotal = () => {
    const addonsTotal = Object.values(selectedAddons)
      .flat()
      .reduce((sum, addon) => sum + (isNaN(addon.price) ? 0 : addon.price), 0);
    return item.basePrice + addonsTotal;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.name}
            {item.isVeg !== undefined && (
              <span
                className={`h-4 w-4 rounded-full ${
                  item.isVeg ? "bg-green-500" : "bg-red-500"
                }`}
              />
            )}
          </DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {item.customizations?.map((group) => {
            const sortedChoices = [...group.choices].sort(
              (a, b) => a.price - b.price
            );
            return (
              <div key={group.groupId} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{group.groupName}</h3>
                  {group.minAddons && group.maxAddons && (
                    <Badge variant="outline" className="text-xs">
                      {group.minAddons === group.maxAddons
                        ? `Select ${group.minAddons}`
                        : `Select ${group.minAddons}-${group.maxAddons}`}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {group.maxAddons === 1 ? (
                    <RadioGroup
                      onValueChange={(value: string) => {
                        const addon = sortedChoices.find((c) => c.id === value);
                        if (addon) {
                          handleAddonChange(group.groupId, addon, false);
                        }
                      }}
                      value={selectedAddons[group.groupId]?.[0]?.id}
                    >
                      {sortedChoices.map((choice) => (
                        <div
                          key={choice.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={choice.id}
                            id={choice.id}
                            disabled={
                              !choice.inStock || choice.isEnabled === false
                            }
                          />
                          <Label htmlFor={choice.id} className="flex-1">
                            {choice.name}
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            {formatInr(choice.price)}
                          </span>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    sortedChoices.map((choice) => (
                      <div
                        key={choice.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={choice.id}
                          checked={selectedAddons[group.groupId]?.some(
                            (a) => a.id === choice.id
                          )}
                          onCheckedChange={() =>
                            handleAddonChange(group.groupId, choice, true)
                          }
                          disabled={
                            !choice.inStock ||
                            choice.isEnabled === false ||
                            (selectedAddons[group.groupId]?.length ===
                              group.maxAddons &&
                              !selectedAddons[group.groupId]?.some(
                                (a) => a.id === choice.id
                              ))
                          }
                        />
                        <Label htmlFor={choice.id} className="flex-1">
                          {choice.name}
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {formatInr(choice.price)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="font-medium">
            Total: {formatInr(calculateTotal())}
          </div>
          <Button onClick={handleAddToCart}>Add to Cart</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
