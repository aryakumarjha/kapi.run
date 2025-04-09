import type { Session } from "@prisma/client";
import usePosition from "./use-position";
import { getMenu } from "../actions/menu";
import { useCallback, useEffect } from "react";

export default function useMenu(session: Session) {
  const { lat, lng } = usePosition();

  const fetchMenu = useCallback(async () => {
    if (lat && lng) {
      const menu = await getMenu(session!.restaurantId, lat, lng);
      return menu;
    }
    return null;
  }, [lat, lng, session]);

  useEffect(() => {
    const fetchData = async () => {
      const menu = await fetchMenu();
      if (menu) {
        console.log("Fetched menu:", menu);
      } else {
        console.log("No menu available");
      }
    };

    fetchData();
  }, [fetchMenu, lat, lng]);

  return { lat, lng };
}
