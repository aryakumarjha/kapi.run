"use server";

import { Restaurant } from "@/types/restaurants";

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  return [
    {
      id: 966182,
      name: "Blue Tokai Coffee Roasters",
      rating: 4.8,
      provider: "swiggy",
    },
  ] satisfies Restaurant[];
};
