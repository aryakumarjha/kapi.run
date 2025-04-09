export interface Addon {
  id: string;
  name: string;
  price: number;
  inStock?: boolean;
  isVeg?: boolean;
  isEnabled?: boolean;
}

export interface AddonGroup {
  groupId: string;
  groupName: string;
  choices: Addon[];
  maxAddons?: number;
  minAddons?: number;
}

export interface SimplifiedMenuItem {
  id: string;
  name: string;
  description?: string;
  isVeg?: boolean;
  imageUrl?: string;
  basePrice: number;
  customizations?: AddonGroup[];
}

export interface MenuResponse {
  restaurantName: string;
  menu: {
    [category: string]: SimplifiedMenuItem[];
  };
}
