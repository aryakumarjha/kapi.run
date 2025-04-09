export interface Variant {
  id: string;
  name: string;
  price: number;
  inStock?: boolean;
  isVeg?: boolean;
  isEnabled?: boolean;
}

export interface VariantGroup {
  groupId: string;
  groupName: string;
  variants: Variant[];
  defaultVariantId?: string;
}

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
  variants?: VariantGroup[];
  addons?: AddonGroup[];
}

export interface MenuCategory {
  name: string;
  imageUrl?: string;
  items: SimplifiedMenuItem[];
  subcategories?: {
    [subcategory: string]: SimplifiedMenuItem[];
  };
}

export type Menu = Record<string, MenuCategory>;

export interface MenuResponse {
  restaurantName: string;
  menu: Menu;
}
