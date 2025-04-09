/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { MenuResponse, SimplifiedMenuItem } from "@/types/menu";
import { cache } from "react";

const getImageUrl = (imageId?: string) => {
  if (!imageId) return undefined;
  return `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/${imageId}`;
};

export const getMenu = cache(
  async (restaurantId: string, lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${restaurantId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch menu: ${response.statusText}`);
      }

      const data = await response.json();
      const cards = data?.data?.cards || [];

      // Find restaurant info
      const restaurantCard = cards.find(
        (card: any) =>
          card?.card?.card?.["@type"] ===
          "type.googleapis.com/swiggy.presentation.food.v2.Restaurant"
      );
      const restaurantName =
        restaurantCard?.card?.card?.info?.name || "Unknown Restaurant";

      // Find menu items
      const menuCard = cards.find((card: any) =>
        card?.groupedCard?.cardGroupMap?.REGULAR?.cards?.some((card: any) =>
          card?.card?.card?.["@type"]?.includes("ItemCategory")
        )
      );

      const menu: { [category: string]: SimplifiedMenuItem[] } = {};
      const menuCards =
        menuCard?.groupedCard?.cardGroupMap?.REGULAR?.cards || [];

      // Process menu items
      for (const card of menuCards) {
        if (
          card?.card?.card?.["@type"]?.includes("ItemCategory") ||
          card?.card?.card?.["@type"]?.includes("NestedItemCategory")
        ) {
          const categoryData = card.card.card;

          // Handle nested categories
          if (categoryData.categories) {
            for (const category of categoryData.categories) {
              if (!menu[category.title]) {
                menu[category.title] = [];
              }

              category.itemCards?.forEach((itemCard: any) => {
                const item = itemCard?.card?.info;
                if (item) {
                  const customizations = item.addons?.map(
                    (addonGroup: any) => ({
                      groupId: addonGroup.groupId,
                      groupName: addonGroup.groupName,
                      choices:
                        addonGroup.choices?.map((choice: any) => ({
                          id: choice.id,
                          name: choice.name,
                          price: choice.price,
                          inStock: choice.inStock,
                          isVeg: choice.isVeg,
                          isEnabled: choice.isEnabled,
                        })) || [],
                      maxAddons: addonGroup.maxAddons,
                      minAddons: addonGroup.minAddons,
                    })
                  );

                  menu[category.title].push({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    isVeg: item.isVeg === 1,
                    imageUrl: getImageUrl(item.imageId),
                    basePrice: item.price || 0,
                    customizations: customizations?.length
                      ? customizations
                      : undefined,
                  });
                }
              });
            }
          }
          // Handle flat categories
          else if (categoryData.itemCards) {
            if (!menu[categoryData.title]) {
              menu[categoryData.title] = [];
            }

            categoryData.itemCards.forEach((itemCard: any) => {
              const item = itemCard?.card?.info;
              if (item) {
                const customizations = item.addons?.map((addonGroup: any) => ({
                  groupId: addonGroup.groupId,
                  groupName: addonGroup.groupName,
                  choices:
                    addonGroup.choices?.map((choice: any) => ({
                      id: choice.id,
                      name: choice.name,
                      price: choice.price,
                      inStock: choice.inStock,
                      isVeg: choice.isVeg,
                      isEnabled: choice.isEnabled,
                    })) || [],
                  maxAddons: addonGroup.maxAddons,
                  minAddons: addonGroup.minAddons,
                }));

                menu[categoryData.title].push({
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  isVeg: item.isVeg === 1,
                  imageUrl: getImageUrl(item.imageId),
                  basePrice: item.price || 0,
                  customizations: customizations?.length
                    ? customizations
                    : undefined,
                });
              }
            });
          }
        }
      }

      // Remove empty categories
      Object.keys(menu).forEach((category) => {
        if (menu[category].length === 0) {
          delete menu[category];
        }
      });

      const response_data: MenuResponse = {
        restaurantName,
        menu,
      };

      return response_data;
    } catch (error) {
      console.error("Error fetching menu:", error);
      throw error;
    }
  }
);
