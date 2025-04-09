import { beforeEach, describe, expect, test, vi, Mock } from "vitest";
import sampleMenu from "../../../../sample.json";
import sampleAltMenu from "../../../../sample.alt.json";
import { getMenu } from "../menu";

// Mock fetch for tests
global.fetch = vi.fn();

describe("Menu Processing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("processes original menu format correctly", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => sampleMenu,
    });

    const result = await getMenu("123", 12.9, 77.6);

    // Verify restaurant name
    expect(result.restaurantName).toBe("Blue Tokai Coffee Roasters");

    // Verify menu structure
    expect(result.menu).toBeDefined();
    expect(Object.keys(result.menu).length).toBeGreaterThan(0);

    // Check for specific categories
    const categories = Object.keys(result.menu);
    expect(categories).toContain("Recommended");

    // Test category structure
    for (const category of Object.values(result.menu)) {
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("items");
      expect(Array.isArray(category.items)).toBe(true);
    }
  });

  test("processes alternate menu format with subcategories correctly", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => sampleAltMenu,
    });

    const result = await getMenu("123", 12.9, 77.6);

    // Verify restaurant name
    expect(result.restaurantName).toBe("Third Wave Coffee");

    // Verify menu structure
    expect(result.menu).toBeDefined();
    expect(Object.keys(result.menu).length).toBeGreaterThan(0);

    // Check for Cold Beverages category and its subcategories
    const coldBeverages = result.menu["Cold Beverages"];
    expect(coldBeverages).toBeDefined();
    expect(coldBeverages.subcategories).toBeDefined();

    if (coldBeverages.subcategories) {
      // Check specific subcategories
      const subcategoryNames = Object.keys(coldBeverages.subcategories);
      expect(subcategoryNames).toContain("Frappe");
      expect(subcategoryNames).toContain("Iced Classics");
      expect(subcategoryNames).toContain("Cold Brews");

      // Verify items in subcategories
      const frappeItems = coldBeverages.subcategories["Frappe"];
      expect(Array.isArray(frappeItems)).toBe(true);
      expect(frappeItems.length).toBeGreaterThan(0);
    }
  });

  test("handles price variants correctly", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => sampleAltMenu,
    });

    const result = await getMenu("123", 12.9, 77.6);

    // Find Classic Cold Coffee in Recommended category
    const recommended = result.menu["Recommended"];
    expect(recommended).toBeDefined();
    
    const classicColdCoffee = recommended.items.find(
      item => item.name === "Classic Cold Coffee"
    );
    expect(classicColdCoffee).toBeDefined();
    expect(classicColdCoffee?.basePrice).toBeDefined();
    expect(classicColdCoffee?.basePrice).toBe(26000);
  });

  test("handles missing or malformed data gracefully", async () => {
    const malformedData = {
      data: {
        cards: []
      }
    };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => malformedData,
    });

    const result = await getMenu("123", 12.9, 77.6);

    // Should still have basic structure
    expect(result).toHaveProperty("restaurantName");
    expect(result).toHaveProperty("menu");
    expect(typeof result.menu).toBe("object");
  });
});
