export interface Restaurant {
  id: number;
  name: string;
  rating?: number;
  provider?: "swiggy" | "zomato";
}
