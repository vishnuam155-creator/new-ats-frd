import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE, authHeaders } from '@/lib/api';

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];
export type PlanName = 'basic' | 'premium' | 'pro';

type PlanRecord = Record<PlanName, number>;
export type PriceTable = Record<CurrencyCode, PlanRecord>;

export const DEFAULT_PRICE_TABLE: PriceTable = {
  INR: { basic: 0, premium: 30000, pro: 65000 },
  USD: { basic: 0, premium: 78, pro: 140 },
  EUR: { basic: 0, premium: 499, pro: 1199 },
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW']);

export interface LimitedTimeOffer {
  id?: string | number;
  label?: string | null;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  currency?: CurrencyCode | null;
  plan?: PlanName | null;
  overrides?: Partial<PlanRecord>;
  percentOff?: number | null;
  flatOffMinor?: number | null;
  perPlanFlatOff?: Partial<PlanRecord>;
  priceMinor?: number | null;
  isActive?: boolean;
  raw?: Record<string, unknown> | null;
}

export interface PricingState {
  currency: CurrencyCode;
  symbol: string;
  basePrices: PlanRecord;
  prices: PlanRecord;
  table: PriceTable;
  activeOffer: LimitedTimeOffer | null;
  lastUpdated: string | null;
}

export interface UsePricingResult extends PricingState {
  requestedCurrency: CurrencyCode;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<PricingState | null>;
}

export const PLAN_FEATURES: Record<PlanName, { label: string; uploads: string; features: string[] }> = {
  basic: {
    label: 'Basic',
    uploads: '3 uploads/month',
    features: ['Basic ATS scoring', 'Resume analysis', 'Standard support'],
  },
  premium: {
    label: 'Premium',
    uploads: '25 uploads/month',
    features: [
      'Advanced ATS scoring',
      'Detailed feedback',
      'Job matching',
      'Priority support',
    ],
  },
  pro: {
    label: 'Pro',
    uploads: '100 uploads/month',
    features: [
      'Everything in Premium',
      'Custom resume builder',
      'API access',
      'Dedicated support',
    ],
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getFirstString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const raw = record[key];
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return null;
}

function getFirstNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const raw = record[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return raw;
    }
    if (typeof raw === 'string') {
      const numeric = Number(raw);
      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }
  }
  return null;
}

function clonePriceTable(table: PriceTable): PriceTable {
  return SUPPORTED_CURRENCIES.reduce((acc, currency) => {
    acc[currency] = { ...(table[currency] ?? DEFAULT_PRICE_TABLE[currency]) };
    return acc;
  }, {} as PriceTable);
}

function normalizeCurrency(value: unknown): CurrencyCode | null {
  if (typeof value !== 'string') return null;
  const upper = value.toUpperCase();
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(upper)
    ? (upper as CurrencyCode)
    : null;
}

function normalizePlanKey(value: unknown): PlanName | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'basic') return 'basic';
  if (normalized === 'premium' || normalized === 'standard') return 'premium';
  if (normalized === 'pro' || normalized === 'professional' || normalized === 'enterprise') return 'pro';
  return null;
}

function normalizePlanRecord(value: unknown): Partial<PlanRecord> {
  const result: Partial<PlanRecord> = {};
  if (!isRecord(value)) return result;
  Object.entries(value as Record<string, unknown>).forEach(([key, raw]) => {
    const plan = normalizePlanKey(key);
    const numeric =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
        ? Number(raw)
        : Number.NaN;
    if (!plan || !Number.isFinite(numeric)) return;
    result[plan] = Math.max(0, Math.round(numeric));
  });
  return result;
}

function firstNumber(...values: unknown[]): number | null {
  for (const raw of values) {
    const numeric =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
        ? Number(raw)
        : Number.NaN;
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function normalizeOffer(raw: unknown, currency: CurrencyCode): LimitedTimeOffer | null {
  if (!isRecord(raw)) return null;
  const record = raw as Record<string, unknown>;

  const detectedCurrency = normalizeCurrency(
    getFirstString(record, ['currency', 'currency_code', 'curr'])
  );
  const planValue = getFirstString(record, ['plan', 'plan_type', 'planName', 'plan_name', 'tier', 'level']);
  const plan = planValue ? normalizePlanKey(planValue) : null;

  const overrideCandidates = [
    record['override_prices_minor'],
    record['price_overrides_minor'],
    record['plan_prices_minor'],
    record['final_prices_minor'],
    record['prices_minor'],
    record['pricing_minor'],
    record['price_overrides'],
  ];

  let overrides: Partial<PlanRecord> = {};
  for (const candidate of overrideCandidates) {
    const normalized = normalizePlanRecord(candidate);
    if (Object.keys(normalized).length) {
      overrides = normalized;
      break;
    }
  }

  if (!Object.keys(overrides).length) {
    const priceTableValue = record['price_table'];
    if (isRecord(priceTableValue)) {
      const table = priceTableValue as Record<string, unknown>;
      const candidateKeys = [currency, currency.toLowerCase(), currency.toUpperCase()];
      if (detectedCurrency) {
        candidateKeys.push(
          detectedCurrency,
          detectedCurrency.toLowerCase(),
          detectedCurrency.toUpperCase()
        );
      }
      for (const key of candidateKeys) {
        const normalized = normalizePlanRecord(table[key]);
        if (Object.keys(normalized).length) {
          overrides = normalized;
          break;
        }
      }
    }
  }

  if (!Object.keys(overrides).length && plan) {
    const priceMinorCandidate = getFirstNumber(record, [
      'price_minor',
      'offer_price_minor',
      'offer_price',
      'discounted_price_minor',
      'discounted_price',
    ]);
    if (priceMinorCandidate != null) {
      overrides = {
        [plan]: Math.max(0, Math.round(priceMinorCandidate)),
      } as Partial<PlanRecord>;
    }
  }

  const perPlanFlat = normalizePlanRecord(
    record['discount_amount_minor'] ??
      record['discount_amounts_minor'] ??
      record['plan_flat_discounts_minor'] ??
      record['discount_amounts']
  );

  const percentOff = getFirstNumber(record, [
    'discount_percent',
    'discountPercent',
    'percent',
    'percent_off',
    'percentOff',
    'percentage',
  ]);

  const flatOff = getFirstNumber(record, [
    'flat_discount_minor',
    'flatDiscountMinor',
    'discount_amount',
    'flat_discount',
    'flatOffMinor',
  ]);

  const priceMinor = getFirstNumber(record, ['price_minor', 'offer_price_minor', 'offer_price']);

  const idCandidate = record['id'] ?? record['pk'] ?? record['uuid'] ?? record['code'];
  const id = typeof idCandidate === 'string' || typeof idCandidate === 'number' ? idCandidate : undefined;

  const isActiveValue = record['is_active'];
  const activeValue = record['active'];
  const isActive =
    typeof isActiveValue === 'boolean'
      ? isActiveValue
      : typeof activeValue === 'boolean'
      ? activeValue
      : undefined;

  return {
    id,
    label: getFirstString(record, ['label', 'title', 'name', 'code']),
    description: getFirstString(record, ['description', 'details', 'subtitle', 'message']),
    startsAt: getFirstString(record, [
      'starts_at',
      'start_at',
      'start',
      'valid_from',
      'startDate',
      'available_from',
      'startsAt',
    ]),
    endsAt: getFirstString(record, [
      'ends_at',
      'end_at',
      'end',
      'valid_to',
      'valid_until',
      'expiry',
      'expires_at',
      'expiresOn',
      'endsAt',
    ]),
    currency: detectedCurrency ?? null,
    plan,
    overrides: Object.keys(overrides).length ? overrides : undefined,
    percentOff: percentOff != null ? percentOff : undefined,
    flatOffMinor: flatOff != null ? Math.round(flatOff) : undefined,
    perPlanFlatOff: Object.keys(perPlanFlat).length ? perPlanFlat : undefined,
    priceMinor: priceMinor != null ? Math.round(priceMinor) : undefined,
    isActive,
    raw: record,
  };
}

function isOfferActive(offer: LimitedTimeOffer | null, currency: CurrencyCode, now: Date): boolean {
  if (!offer) return false;
  if (offer.currency && offer.currency !== currency) return false;
  if (offer.isActive === false) return false;

  const starts = offer.startsAt ? new Date(offer.startsAt) : null;
  if (starts && !Number.isNaN(starts.getTime()) && starts.getTime() > now.getTime()) return false;

  const ends = offer.endsAt ? new Date(offer.endsAt) : null;
  if (ends && !Number.isNaN(ends.getTime()) && ends.getTime() < now.getTime()) return false;

  return true;
}

function extractActiveOffer(payload: unknown, currency: CurrencyCode): LimitedTimeOffer | null {
  const candidates: unknown[] = [];
  if (isRecord(payload)) {
    const record = payload as Record<string, unknown>;
    if ('active_offer' in record) candidates.push(record['active_offer']);
    if ('limited_time_offer' in record) candidates.push(record['limited_time_offer']);
    if ('offer' in record) candidates.push(record['offer']);

    ['limited_time_offers', 'offers', 'active_offers'].forEach((key) => {
      const value = record[key];
      if (Array.isArray(value)) {
        candidates.push(...value);
      }
    });
  }

  const now = new Date();
  for (const candidate of candidates) {
    const offer = normalizeOffer(candidate, currency);
    if (offer && isOfferActive(offer, currency, now)) {
      return offer;
    }
  }

  for (const candidate of candidates) {
    const offer = normalizeOffer(candidate, currency);
    if (offer) return offer;
  }

  return null;
}

function normalizePriceTable(raw: unknown): PriceTable {
  const base = clonePriceTable(DEFAULT_PRICE_TABLE);
  if (!isRecord(raw)) return base;
  const record = raw as Record<string, unknown>;

  SUPPORTED_CURRENCIES.forEach((currencyCode) => {
    const candidates = [currencyCode, currencyCode.toLowerCase(), currencyCode.toUpperCase()];
    const candidateValue = candidates.map((key) => record[key]).find((value) => value !== undefined);
    const normalized = normalizePlanRecord(candidateValue);
    if (Object.keys(normalized).length) {
      base[currencyCode] = { ...base[currencyCode], ...normalized } as PlanRecord;
    }
  });

  return base;
}

function deriveBasePrices(payload: unknown, currency: CurrencyCode, table: PriceTable): PlanRecord {
  const base = { ...(table[currency] ?? DEFAULT_PRICE_TABLE[currency]) };
  if (!isRecord(payload)) return base as PlanRecord;
  const record = payload as Record<string, unknown>;

  const pricingMinorRecord = isRecord(record['pricing_minor'])
    ? (record['pricing_minor'] as Record<string, unknown>)
    : null;
  const pricingRecord = isRecord(record['pricing'])
    ? (record['pricing'] as Record<string, unknown>)
    : null;
  const priceTableRecord = isRecord(record['price_table'])
    ? (record['price_table'] as Record<string, unknown>)
    : null;
  const priceTableMinorRecord = isRecord(record['price_table_minor'])
    ? (record['price_table_minor'] as Record<string, unknown>)
    : null;

  const sources: unknown[] = [
    record['prices_minor'],
    record['plan_prices_minor'],
    pricingMinorRecord ? pricingMinorRecord[currency] : undefined,
    pricingRecord ? pricingRecord[currency] : undefined,
    priceTableRecord ? priceTableRecord[currency] : undefined,
    priceTableMinorRecord ? priceTableMinorRecord[currency] : undefined,
  ];

  sources.forEach((source) => {
    const normalized = normalizePlanRecord(source);
    if (Object.keys(normalized).length) {
      Object.assign(base, normalized);
    }
  });

  return base as PlanRecord;
}

function applyOffer(base: PlanRecord, offer: LimitedTimeOffer | null, currency: CurrencyCode): PlanRecord {
  const result: PlanRecord = { ...base };
  if (!offer) return result;
  if (offer.currency && offer.currency !== currency) return result;

  if (offer.overrides && Object.keys(offer.overrides).length) {
    (Object.keys(offer.overrides) as PlanName[]).forEach((plan) => {
      const value = offer.overrides?.[plan];
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[plan] = Math.max(0, Math.round(value));
      }
    });
    return result;
  }

  if (offer.plan && offer.priceMinor != null) {
    result[offer.plan] = Math.max(0, Math.round(offer.priceMinor));
  }

  if (offer.plan && offer.percentOff != null) {
    result[offer.plan] = Math.max(0, Math.round(result[offer.plan] * (1 - offer.percentOff / 100)));
  } else if (offer.percentOff != null) {
    (Object.keys(result) as PlanName[]).forEach((plan) => {
      if (result[plan] > 0) {
        result[plan] = Math.max(0, Math.round(result[plan] * (1 - offer.percentOff! / 100)));
      }
    });
  }

  if (offer.plan && offer.flatOffMinor != null) {
    result[offer.plan] = Math.max(0, result[offer.plan] - Math.round(offer.flatOffMinor));
  } else if (offer.flatOffMinor != null) {
    (Object.keys(result) as PlanName[]).forEach((plan) => {
      if (result[plan] > 0) {
        result[plan] = Math.max(0, result[plan] - Math.round(offer.flatOffMinor!));
      }
    });
  }

  if (offer.perPlanFlatOff && Object.keys(offer.perPlanFlatOff).length) {
    (Object.keys(offer.perPlanFlatOff) as PlanName[]).forEach((plan) => {
      const deduction = offer.perPlanFlatOff?.[plan];
      if (typeof deduction === 'number' && Number.isFinite(deduction)) {
        result[plan] = Math.max(0, result[plan] - Math.round(deduction));
      }
    });
  }

  return result;
}

function deriveLastUpdated(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const record = payload as Record<string, unknown>;
  return (
    getFirstString(record, ['last_updated', 'updated_at', 'modified_at', 'refreshed_at', 'timestamp']) || null
  );
}

function parsePricingPayload(payload: unknown, fallbackCurrency: CurrencyCode): PricingState {
  const record = isRecord(payload) ? (payload as Record<string, unknown>) : {};
  const tableSource =
    record['default_price_table'] ?? record['price_table'] ?? record['price_tables'] ?? record['tables'] ?? null;
  const table = clonePriceTable(normalizePriceTable(tableSource));
  const currency = normalizeCurrency(getFirstString(record, ['currency'])) ?? fallbackCurrency;
  const basePrices = deriveBasePrices(record, currency, table);
  const activeOffer = extractActiveOffer(record, currency);
  const prices = applyOffer(basePrices, activeOffer, currency);
  const lastUpdated = deriveLastUpdated(record);

  return {
    currency,
    symbol: CURRENCY_SYMBOLS[currency] ?? currency,
    basePrices,
    prices,
    table,
    activeOffer,
    lastUpdated,
  };
}

function createInitialState(currency: CurrencyCode): PricingState {
  const table = clonePriceTable(DEFAULT_PRICE_TABLE);
  return {
    currency,
    symbol: CURRENCY_SYMBOLS[currency] ?? currency,
    basePrices: { ...table[currency] },
    prices: { ...table[currency] },
    table,
    activeOffer: null,
    lastUpdated: null,
  };
}

export function formatFromMinor(minor: number, currency: string, locale?: string) {
  const normalizedCurrency = typeof currency === 'string' ? currency.toUpperCase() : 'USD';
  const divisor = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 1 : 100;
  const major = (minor ?? 0) / divisor;
  return new Intl.NumberFormat(locale || undefined, {
    style: 'currency',
    currency: normalizedCurrency,
  }).format(major);
}

export function minorToMajor(minor: number, currency: string): number {
  const normalizedCurrency = typeof currency === 'string' ? currency.toUpperCase() : 'USD';
  const divisor = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 1 : 100;
  return (minor ?? 0) / divisor;
}

export function usePricing(
  preferredCurrency?: CurrencyCode,
  options?: { refreshIntervalMs?: number }
): UsePricingResult {
  const requestCurrency = useMemo(() => {
    if (!preferredCurrency) return 'INR' as CurrencyCode;
    return normalizeCurrency(preferredCurrency) ?? 'INR';
  }, [preferredCurrency]);

  const [state, setState] = useState<PricingState>(() => createInitialState(requestCurrency));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const refreshIntervalMs = options?.refreshIntervalMs ?? 60000;

  const refresh = useCallback(async (): Promise<PricingState | null> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    try {
      const query = requestCurrency ? `?currency=${requestCurrency}` : '';
      const response = await fetch(`${API_BASE}/api/pricing/${query}`, {
        headers: {
          Accept: 'application/json',
          ...authHeaders(),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload: unknown = await response.json();
      const parsed = parsePricingPayload(payload, requestCurrency);
      setState(parsed);
      setError(null);
      return parsed;
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return null;
      }
      console.error('Failed to load pricing', err);
      const message = err instanceof Error ? err.message : 'Failed to load pricing';
      setError(message);
      setState((prev) => (prev.currency === requestCurrency ? prev : createInitialState(requestCurrency)));
      return null;
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [requestCurrency]);

  useEffect(() => {
    setState(createInitialState(requestCurrency));
  }, [requestCurrency]);

  useEffect(() => {
    refresh();
    return () => {
      abortRef.current?.abort();
    };
  }, [refresh]);

  useEffect(() => {
    if (!refreshIntervalMs) return;
    const id = window.setInterval(() => {
      refresh();
    }, refreshIntervalMs);
    return () => window.clearInterval(id);
  }, [refresh, refreshIntervalMs]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refresh]);

  return {
    ...state,
    requestedCurrency: requestCurrency,
    isLoading,
    error,
    refresh,
  };
}

export const currencySymbols = CURRENCY_SYMBOLS;
export const planFeatures = {
  Basic: PLAN_FEATURES.basic,
  Premium: PLAN_FEATURES.premium,
  Pro: PLAN_FEATURES.pro,
};
