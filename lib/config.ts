export const ALLOWED_NETWORKS = ["mtn", "telecel", "airteltigo"] as const;
export type AllowedNetwork = (typeof ALLOWED_NETWORKS)[number];

// iDATA API resilience
export const IDATA_TIMEOUT_MS = 10_000;
export const IDATA_MAX_RETRIES = 2;
export const IDATA_RETRY_DELAY_MS = 1_000;

// Wallet monitoring
export const WALLET_LOW_BALANCE_THRESHOLD_GHS = 50;

// Customer-facing prices (GHS) keyed by network → data_size in GB.
// These are the prices shown and charged to customers.
// Only bundles listed here will appear on the site; others are hidden.
export const CUSTOMER_PRICING: Record<AllowedNetwork, Record<number, number>> = {
  mtn: {
    1: 5,
    2: 9,
    3: 14,
    4: 18,
    5: 22,
    6: 27,
    8: 35,
    10: 44,
    15: 60,
    20: 80,
    25: 100,
    30: 120,
    40: 158,
    50: 199,
  },
  telecel: {
    10: 42,
    15: 60,
    20: 78,
    25: 98,
    30: 117,
    40: 149,
    50: 188,
    100: 360,
  },
  airteltigo: {
    1: 5,
    2: 9,
    3: 13,
    4: 17,
    5: 21,
    6: 25,
    7: 32,
    8: 35,
    10: 43,
    15: 64,
    20: 68,
    30: 82,
    40: 88,
    50: 100,
    60: 134,
    80: 167,
    100: 187,
  },
};

// Estimated profit margin used for analytics reporting only.
// Not used for pricing — customer prices are fixed in CUSTOMER_PRICING above.
export const PROFIT_MARGIN = 0.15;

// Rate limiting on payment initialization
export const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window
export const RATE_LIMIT_MAX_REQUESTS = 5;   // max 5 initializations per IP per window
