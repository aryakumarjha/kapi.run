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
    {
      id: 588181,
      name: "Third Wave Coffee",
      rating: 4.7,
      provider: "swiggy",
    },
  ] satisfies Restaurant[];
};
