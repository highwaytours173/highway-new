'use server';

import crypto from 'crypto';
import { getAgencyKashierSettingsForRuntime } from '@/lib/supabase/agency-content';

type KashierConfig = {
  merchantId: string;
  apiKey: string;
  currency: string;
  mode: 'test' | 'live';
  hppBaseUrl: string;
  merchantRedirectUrl: string;
  allowedMethods?: string;
  display?: string;
};

type KashierConfigSource = Partial<KashierConfig>;

const KASHIER_CURRENCY = 'EGP';
const KASHIER_HPP_BASE_URL = 'https://checkout.kashier.io/';

function normalizeOptionalString(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function normalizeMode(value?: string | null): KashierConfig['mode'] | undefined {
  const normalized = normalizeOptionalString(value)?.toLowerCase();
  return normalized === 'test' || normalized === 'live' ? normalized : undefined;
}

function normalizeDisplay(value?: string | null): string | undefined {
  const normalized = normalizeOptionalString(value)?.toLowerCase();
  return normalized === 'en' || normalized === 'ar' ? normalized : undefined;
}

function getEnvKashierConfig(): KashierConfigSource {
  return {
    merchantId: normalizeOptionalString(process.env.KASHIER_MERCHANT_ID),
    apiKey: normalizeOptionalString(process.env.KASHIER_API_KEY),
    mode: normalizeMode(process.env.KASHIER_MODE),
    merchantRedirectUrl: normalizeOptionalString(process.env.KASHIER_MERCHANT_REDIRECT_URL),
    allowedMethods: normalizeOptionalString(process.env.KASHIER_ALLOWED_METHODS),
    display: normalizeDisplay(process.env.KASHIER_DISPLAY),
  };
}

async function getDatabaseKashierConfig(): Promise<KashierConfigSource> {
  try {
    const settings = await getAgencyKashierSettingsForRuntime();
    return {
      merchantId: normalizeOptionalString(settings.merchantId),
      apiKey: normalizeOptionalString(settings.apiKey),
      mode: normalizeMode(settings.mode),
      allowedMethods: normalizeOptionalString(settings.allowedMethods),
      display: normalizeDisplay(settings.display),
    };
  } catch {
    return {};
  }
}

async function getKashierConfig(): Promise<KashierConfig> {
  const [databaseConfig, envConfig] = await Promise.all([
    getDatabaseKashierConfig(),
    Promise.resolve(getEnvKashierConfig()),
  ]);

  const merchantId = databaseConfig.merchantId ?? envConfig.merchantId;
  const apiKey = databaseConfig.apiKey ?? envConfig.apiKey;
  const currency = KASHIER_CURRENCY;
  const mode = databaseConfig.mode ?? envConfig.mode ?? 'test';
  const merchantRedirectUrl = envConfig.merchantRedirectUrl;
  const hppBaseUrl = KASHIER_HPP_BASE_URL;
  const allowedMethods = databaseConfig.allowedMethods ?? envConfig.allowedMethods;
  const display = databaseConfig.display ?? envConfig.display ?? 'en';

  if (!merchantId) throw new Error('Missing KASHIER_MERCHANT_ID');
  if (!apiKey) throw new Error('Missing KASHIER_API_KEY');
  if (!merchantRedirectUrl) throw new Error('Missing KASHIER_MERCHANT_REDIRECT_URL');
  if (mode !== 'test' && mode !== 'live') throw new Error('Invalid KASHIER_MODE');

  return {
    merchantId,
    apiKey,
    currency,
    mode,
    hppBaseUrl,
    merchantRedirectUrl,
    allowedMethods: allowedMethods && allowedMethods.trim() ? allowedMethods.trim() : undefined,
    display,
  };
}

function hmacSha256Hex(secret: string, payload: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function normalizeAmount(amount: number) {
  if (!Number.isFinite(amount)) throw new Error('Invalid amount');
  return amount.toFixed(2);
}

export async function buildKashierHppUrl(input: {
  merchantOrderId: string;
  amount: number;
  customer?: {
    name?: string;
    email?: string;
    mobile?: string;
  };
}) {
  const cfg = await getKashierConfig();
  const amount = normalizeAmount(input.amount);
  const orderId = input.merchantOrderId;
  const signingKey = cfg.apiKey;

  const paymentPath = `/?payment=${cfg.merchantId}.${orderId}.${amount}.${cfg.currency}`;
  const hash = hmacSha256Hex(signingKey, paymentPath);

  const url = new URL(cfg.hppBaseUrl);
  url.searchParams.set('merchantId', cfg.merchantId);
  url.searchParams.set('orderId', orderId);
  url.searchParams.set('mode', cfg.mode);
  url.searchParams.set('amount', amount);
  url.searchParams.set('currency', cfg.currency);
  url.searchParams.set('hash', hash);
  url.searchParams.set('merchantRedirect', cfg.merchantRedirectUrl);
  url.searchParams.set('display', cfg.display ?? 'en');

  if (cfg.allowedMethods) url.searchParams.set('allowedMethods', cfg.allowedMethods);
  if (input.customer?.name) url.searchParams.set('customerName', input.customer.name);
  if (input.customer?.email) url.searchParams.set('customerEmail', input.customer.email);
  if (input.customer?.mobile) url.searchParams.set('customerMobile', input.customer.mobile);

  return url.toString();
}

export async function verifyKashierSignature(input: {
  signature: string | null | undefined;
  signatureKeys: string[] | null | undefined;
  data: Record<string, unknown>;
}) {
  const cfg = await getKashierConfig();
  const signature = (input.signature ?? '').trim();
  const signatureKeys = input.signatureKeys ?? [];

  if (!signature) return { ok: false as const, reason: 'missing_signature' as const };
  if (!Array.isArray(signatureKeys) || signatureKeys.length === 0) {
    return { ok: false as const, reason: 'missing_signature_keys' as const };
  }

  const keys = [...signatureKeys].map((k) => String(k)).sort((a, b) => a.localeCompare(b));
  const payload = keys
    .map((key) => {
      const value = (input.data as Record<string, unknown>)[key];
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(
        value === undefined || value === null ? '' : String(value)
      );
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');

  const expected = hmacSha256Hex(cfg.apiKey, payload);
  const match = expected.toLowerCase() === signature.toLowerCase();
  return match
    ? { ok: true as const }
    : { ok: false as const, reason: 'signature_mismatch' as const };
}
