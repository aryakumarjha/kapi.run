/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import {
  MenuCategory,
  MenuResponse,
  SimplifiedMenuItem,
  AddonGroup,
  Addon,
  VariantGroup,
  Variant,
} from "@/types/menu";
import { cache } from "react";

const getImageUrl = (imageId?: string): string | undefined =>
  imageId
    ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/${imageId}`
    : undefined;

// Helper to extract price from a dish info object
const getBasePrice = (info: any): number => {
  let basePrice = 0;
  if (info.price) {
    basePrice = Math.floor(info.price);
  } else if (info.defaultPrice) {
    basePrice = Math.floor(info.defaultPrice);
  } else if (
    info.variantsV2?.pricingModels?.length > 0 &&
    info.variantsV2.pricingModels[0]?.price
  ) {
    basePrice = Math.floor(info.variantsV2.pricingModels[0].price);
  } else if (
    info.variants?.variantGroups?.length > 0 &&
    info.variants.variantGroups[0]?.variations?.length > 0 &&
    info.variants.variantGroups[0].variations[0]?.price
  ) {
    basePrice = Math.floor(
      info.variants.variantGroups[0].variations[0].price * 100
    );
  }
  return basePrice;
};

// Helper to process a dish item
const processDish = (info: any): SimplifiedMenuItem | null => {
  if (!info?.name) return null;
  const basePrice = getBasePrice(info);
  if (basePrice === 0) return null;

  const dish: SimplifiedMenuItem = {
    id: info.id?.toString() || "",
    name: info.name,
    description: info.description || undefined,
    isVeg: typeof info.isVeg !== "undefined" ? Boolean(info.isVeg) : undefined,
    imageUrl: getImageUrl(info.imageId),
    basePrice,
  };

  // Handle variants
  if (
    info.variantsV2?.variantGroups &&
    Array.isArray(info.variantsV2.variantGroups)
  ) {
    dish.variants = info.variantsV2.variantGroups.map(
      (group: any): VariantGroup => ({
        groupId: group.groupId?.toString() || "",
        groupName: group.name || "",
        variants: (group.variations || []).map(
          (variation: any): Variant => ({
            id: variation.id?.toString() || "",
            name: variation.name || "",
            price: variation.price ? Math.floor(variation.price * 100) : 0,
            inStock:
              typeof variation.inStock !== "undefined"
                ? Boolean(variation.inStock)
                : undefined,
            isVeg:
              typeof variation.isVeg !== "undefined"
                ? Boolean(variation.isVeg)
                : undefined,
            isEnabled:
              typeof variation.isEnabled !== "undefined"
                ? Boolean(variation.isEnabled)
                : undefined,
          })
        ),
        defaultVariantId: group.defaultVariationId?.toString(),
      })
    );
  }

  // Handle addons
  if (info.addons && Array.isArray(info.addons)) {
    dish.addons = info.addons.map(
      (group: any): AddonGroup => ({
        groupId: group.groupId?.toString() || "",
        groupName: group.name || "",
        choices: (group.choices || []).map(
          (addon: any): Addon => ({
            id: addon.id?.toString() || "",
            name: addon.name || "",
            price: addon.price ? Math.floor(addon.price) : 0,
            inStock:
              typeof addon.inStock !== "undefined"
                ? Boolean(addon.inStock)
                : undefined,
            isVeg:
              typeof addon.isVeg !== "undefined"
                ? Boolean(addon.isVeg)
                : undefined,
            isEnabled:
              typeof addon.isEnabled !== "undefined"
                ? Boolean(addon.isEnabled)
                : undefined,
          })
        ),
        maxAddons: group.maxAddons,
        minAddons: group.minAddons,
      })
    );
  }
  return dish;
};

// Processes category cards based on given cardData. Returns a MenuCategory object.
const processCategoryCard = (cardData: any): MenuCategory | null => {
  const categoryName = cardData.title || "Uncategorized";
  const category: MenuCategory = {
    name: categoryName,
    imageUrl: getImageUrl(cardData.imageId),
    items: [],
  };

  // Process immediate items (for both normal and nested categories)
  (cardData.itemCards || []).forEach((wrapper: any) => {
    const info = wrapper?.card?.info || wrapper?.info;
    const dish = processDish(info);
    if (dish) category.items.push(dish);
  });

  // Handle nested subcategories if present
  if (
    cardData["@type"]?.includes("NestedItemCategory") &&
    Array.isArray(cardData.categories)
  ) {
    category.subcategories = {};
    cardData.categories.forEach((subCat: any) => {
      if (!subCat?.title) return;
      const subcatName = subCat.title;
      category.subcategories![subcatName] = [];
      (subCat.itemCards || []).forEach((wrapper: any) => {
        const info = wrapper?.card?.info || wrapper?.info;
        const dish = processDish(info);
        if (dish) category.subcategories![subcatName].push(dish);
      });
      if (category.subcategories![subcatName].length === 0) {
        delete category.subcategories![subcatName];
      }
    });
    if (Object.keys(category.subcategories).length === 0) {
      delete category.subcategories;
    }
  }
  return category;
};

// Processes carousel (recommended) cards.
const processCarouselCard = (cardData: any): MenuCategory | null => {
  const categoryName = cardData.title || "Recommended";
  const category: MenuCategory = {
    name: categoryName,
    imageUrl: getImageUrl(cardData.imageId),
    items: [],
  };
  (cardData.carousel || []).forEach((item: any) => {
    const dishInfo = item?.dish?.info;
    const dish = processDish(dishInfo);
    if (dish) category.items.push(dish);
  });
  return category;
};

const fetchMenu = async (restaurantId: string, lat: number, lng: number) => {
  if (process.env.NODE_ENV === "development") {
    return (await import("../../../sample.alt.json")).default;
  }

  const url = `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${restaurantId}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch menu: ${response.statusText}`);
  }
  return await response.json();
};

export const getMenu = cache(
  async (
    restaurantId: string,
    lat: number,
    lng: number
  ): Promise<MenuResponse> => {
    try {
      const data = await fetchMenu(restaurantId, lat, lng);
      const cards = data?.data?.cards || [];

      // Extract restaurant name.
      let restaurantName = "Unknown Restaurant";
      for (const card of cards) {
        if (
          card?.card?.card?.["@type"] ===
          "type.googleapis.com/swiggy.presentation.food.v2.Restaurant"
        ) {
          restaurantName = card.card.card.info.name;
          break;
        }
      }
      if (restaurantName === "Unknown Restaurant") {
        const txt = cards.find((card: any) =>
          card?.card?.card?.["@type"]?.includes("TextBoxV2")
        );
        if (txt?.card?.card?.text) restaurantName = txt.card.card.text;
      }

      // Build menu from grouped cards.
      const menu: Record<string, MenuCategory> = {};
      let menuCards: any[] = [];
      const groupedCard = cards.find(
        (card: any) => card.groupedCard?.cardGroupMap?.REGULAR
      );
      if (groupedCard) {
        menuCards = groupedCard.groupedCard.cardGroupMap.REGULAR.cards || [];
      }

      // Process each menu card.
      menuCards.forEach((groupCard: any) => {
        if (!groupCard?.card?.card) return;
        const cardData = groupCard.card.card;
        const cardType = cardData["@type"] || "";

        if (
          cardType.includes("ItemCategory") ||
          cardType.includes("MenuCategory") ||
          cardType.includes("NestedItemCategory")
        ) {
          const category = processCategoryCard(cardData);
          if (category) {
            menu[category.name] = category;
          }
        } else if (cardType.includes("MenuCarousel")) {
          const carouselCategory = processCarouselCard(cardData);
          if (carouselCategory) {
            menu[carouselCategory.name] = carouselCategory;
          }
        }
      });

      // Combine sorting and cleanup: sort items and remove empty categories.
      Object.keys(menu).forEach((key) => {
        const cat = menu[key];
        if (cat.items && cat.items.length > 0) {
          cat.items.sort((a, b) => a.name.localeCompare(b.name));
        }
        if (cat.subcategories) {
          Object.values(cat.subcategories).forEach((itemList) => {
            itemList.sort((a, b) => a.name.localeCompare(b.name));
          });
        }
        if (
          (!cat.items || cat.items.length === 0) &&
          (!cat.subcategories || Object.keys(cat.subcategories).length === 0)
        ) {
          delete menu[key];
        }
      });

      const menuResponse: MenuResponse = { restaurantName, menu };
      return menuResponse;
    } catch (error) {
      console.error("Error fetching menu:", error);
      throw error;
    }
  }
);
