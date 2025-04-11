import { memo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { SimplifiedMenuItem, Variant, type Addon } from "@/types/menu";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "./ui/label";
import { useCart } from "@/lib/store/cart";
import { Badge } from "./ui/badge";
import { Plus, Minus } from "lucide-react";
import { formatInr } from "@/lib/format-inr";

interface ItemCustomizationDialogProps {
  item: SimplifiedMenuItem;
  open: boolean;
  onClose: () => void;
}

function ItemCustomizationDialog({
  item,
  open,
  onClose,
}: ItemCustomizationDialogProps) {
  // Track selected variants
  const [selectedVariants, setSelectedVariants] = useState<{
    [groupId: string]: Variant;
  }>(() => {
    const initialVariants: { [groupId: string]: Variant } = {};

    item.variants?.forEach((group) => {
      const availableVariants = group.variants.filter(
        (variant) => variant.inStock !== false && variant.isEnabled !== false
      );

      if (availableVariants.length > 0) {
        // If there's a default variant, use it
        if (group.defaultVariantId) {
          const defaultVariant = availableVariants.find(
            (v) => v.id === group.defaultVariantId
          );
          if (defaultVariant) {
            initialVariants[group.groupId] = defaultVariant;
            return;
          }
        }
        // Otherwise select the cheapest available option
        const sortedVariants = [...availableVariants].sort(
          (a, b) => (a.price || 0) - (b.price || 0)
        );
        initialVariants[group.groupId] = sortedVariants[0];
      }
    });

    return initialVariants;
  });

  // Track selected addons
  const [selectedAddons, setSelectedAddons] = useState<{
    [groupId: string]: Addon[];
  }>(() => {
    const initialSelections: { [groupId: string]: Addon[] } = {};

    item.addons?.forEach((group) => {
      // Only preselect if there's a minimum requirement
      if (group.minAddons && group.minAddons > 0) {
        const availableChoices = group.choices.filter(
          (choice) => choice.inStock !== false && choice.isEnabled !== false
        );

        if (availableChoices.length > 0) {
          // Sort by price ascending and select the cheapest available option
          const sortedChoices = [...availableChoices].sort(
            (a, b) => (a.price || 0) - (b.price || 0)
          );
          initialSelections[group.groupId] = [sortedChoices[0]];
        }
      }
    });

    return initialSelections;
  });

  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleVariantChange = (groupId: string, variant: Variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [groupId]: variant,
    }));
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
    // Format variants
    const formattedVariants = Object.entries(selectedVariants).map(
      ([groupId, variant]) => ({
        groupId,
        groupName: item.variants?.find((group) => group.groupId === groupId)!
          .groupName as string,
        variant,
      })
    );

    // Format addons
    const formattedAddons = Object.entries(selectedAddons).map(
      ([groupId, addons]) => ({
        groupId,
        groupName: item.addons?.find((group) => group.groupId === groupId)!
          .groupName as string,
        addons,
      })
    );

    addItem({
      menuItem: item,
      quantity,
      selectedVariants: formattedVariants,
      selectedAddons: formattedAddons,
    });

    onClose();
    setSelectedVariants({});
    setSelectedAddons({});
    setQuantity(1);
  };

  const calculateTotal = () => {
    // Calculate variants total
    const variantsTotal = Object.values(selectedVariants).reduce(
      (sum, variant) => sum + (isNaN(variant.price) ? 0 : variant.price),
      0
    );

    // Calculate addons total
    const addonsTotal = Object.values(selectedAddons)
      .flat()
      .reduce((sum, addon) => sum + (isNaN(addon.price) ? 0 : addon.price), 0);

    // If any variant is selected, use variants total as base price, otherwise use item's base price
    const basePrice =
      Object.keys(selectedVariants).length > 0 ? variantsTotal : item.basePrice;
    return (basePrice + addonsTotal) * quantity;
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
          {/* Variants Section */}
          {item.variants?.map((group) => {
            const sortedVariants = [...group.variants].sort((a, b) => {
              const priceA = isNaN(a.price) ? 0 : a.price;
              const priceB = isNaN(b.price) ? 0 : b.price;
              return priceA - priceB;
            });
            return (
              <div key={group.groupId} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{group.groupName}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                </div>

                <div className="space-y-2">
                  <RadioGroup
                    onValueChange={(value: string) => {
                      const variant = sortedVariants.find(
                        (v) => v.id === value
                      );
                      if (variant) {
                        handleVariantChange(group.groupId, variant);
                      }
                    }}
                    value={selectedVariants[group.groupId]?.id}
                  >
                    {sortedVariants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={variant.id} id={variant.id} />
                        <Label htmlFor={variant.id} className="flex-1">
                          {variant.name}
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          +{formatInr(variant.price)}
                        </span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            );
          })}

          {/* Addons Section */}
          {item.addons?.map((group) => {
            const sortedChoices = [...group.choices].sort((a, b) => {
              const priceA = isNaN(a.price) ? 0 : a.price;
              const priceB = isNaN(b.price) ? 0 : b.price;
              return priceA - priceB;
            });
            return (
              <div key={group.groupId} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{group.groupName || "Add On"}</h3>
                  {group.minAddons && group.maxAddons && (
                    <Badge variant="outline" className="text-xs">
                      {group.minAddons === group.maxAddons
                        ? `Select ${group.minAddons}`
                        : `Select ${group.minAddons}-${group.maxAddons}`}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {group.maxAddons === 1 || !group.maxAddons ? (
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
                          <RadioGroupItem value={choice.id} id={choice.id} />
                          <Label htmlFor={choice.id} className="flex-1">
                            {choice.name}
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            +{formatInr(choice.price)}
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
                            selectedAddons[group.groupId]?.length ===
                              group.maxAddons &&
                            !selectedAddons[group.groupId]?.some(
                              (a) => a.id === choice.id
                            )
                          }
                        />
                        <Label htmlFor={choice.id} className="flex-1">
                          {choice.name}
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          +{formatInr(choice.price)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-6 gap-4">
          <div className="font-medium">
            Total: {formatInr(calculateTotal())}
          </div>
          <span className="flex-1" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={quantity <= 1}
              onClick={() => setQuantity((prev) => prev - 1)}
              aria-label="Decrease quantity"
            >
              <Minus />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              size="icon"
              onClick={() => setQuantity((prev) => prev + 1)}
              aria-label="Increase quantity"
            >
              <Plus />
            </Button>
          </div>
          <Button onClick={handleAddToCart}>Add to Cart</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(ItemCustomizationDialog);
