import type { ThemeProviderProps } from "next-themes";

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

export const THEME_CONFIG: ThemeProviderProps = {
  attribute: "class",
  defaultTheme: "system",
  enableSystem: true,
  disableTransitionOnChange: true,
} as const;
