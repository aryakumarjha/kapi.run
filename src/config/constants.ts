export const APP_CONSTANTS = {
  MAX_SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_RECENTLY_VIEWED: 5,
} as const;

export const CURRENCY = {
  CODE: "INR",
  SYMBOL: "₹",
} as const;
