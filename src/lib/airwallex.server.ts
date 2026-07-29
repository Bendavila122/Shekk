/**
 * Airwallex adapter — server only.
 *
 * Airwallex is the licensed party: they hold the money, run the FX, move the
 * payouts and issue the cards. Shekk's ledger is the book of record for who
 * owns which slice of the shekel balance sitting at Airwallex.
 *
 * Money invariant: nothing in here credits a member. A balance only moves when
 * `funding_settle` runs from a signature-verified webhook. These functions
 * create intents, read balances and issue cards — they never write the ledger.
 *
 * Credentials (server secrets, never sent to the browser):
 *   AIRWALLEX_CLIENT_ID      — Web App → Developer → API keys
 *   AIRWALLEX_API_KEY        — same screen, shown once
 *   AIRWALLEX_WEBHOOK_SECRET — Developer → Webhooks
 *   AIRWALLEX_ENV            — "sandbox" (default) or "production"
 */

const HOSTS = {
  sandbox: "https://api.sandbox.airwallex.com",
  production: "https://api.airwallex.com",
} as const;

function baseUrl(): string {
  return process.env.AIRWALLEX_ENV === "production" ? HOSTS.production : HOSTS.sandbox;
}

/** True when the keys are present, so the app can fall back cleanly. */
export function isConfigured(): boolean {
  return Boolean(process.env.AIRWALLEX_CLIENT_ID && process.env.AIRWALLEX_API_KEY);
}

/* ------------------------------------------------------------------ auth --- */

/**
 * Airwallex bearer tokens last ~30 minutes. Cache in module memory and refresh
 * a minute early; workers are short-lived, so a miss just means one extra call.
 */
let token: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY;
  if (!clientId || !apiKey) throw new Error("Airwallex is not connected yet");

  if (token && token.expiresAt > Date.now() + 60_000) return token.value;

  const res = await fetch(`${baseUrl()}/api/v1/authentication/login`, {
    method: "POST",
    headers: { "x-client-id": clientId, "x-api-key": apiKey, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[airwallex] login failed [${res.status}]: ${body}`);
    throw new Error("Could not reach the payment partner");
  }
  const json = (await res.json()) as { token: string; expires_at?: string };
  token = {
    value: json.token,
    expiresAt: json.expires_at ? Date.parse(json.expires_at) : Date.now() + 25 * 60_000,
  };
  return token.value;
}

type Method = "GET" | "POST" | "DELETE";

/** One request helper so every call gets auth, JSON and honest error surfacing. */
async function call<T>(
  method: Method,
  path: string,
  init?: { body?: unknown; query?: Record<string, string | undefined> },
): Promise<T> {
  const url = new URL(`${baseUrl()}${path}`);
  for (const [k, v] of Object.entries(init?.query ?? {})) if (v != null) url.searchParams.set(k, v);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[airwallex] ${method} ${path} failed [${res.status}]: ${body}`);
    throw new Error(`Payment partner error [${res.status}]`);
  }
  return (await res.json()) as T;
}

/* -------------------------------------------------------------- balances --- */

export type AirwallexBalance = {
  currency: string;
  available: number;
  pending: number;
  reserved: number;
};

/**
 * Shekk's own balances at Airwallex — the float backing every member balance.
 * This is company money, not a member's, so it is admin-only in the UI.
 */
export async function listBalances(): Promise<AirwallexBalance[]> {
  const rows = await call<
    Array<{
      currency: string;
      available_amount?: number;
      pending_amount?: number;
      reserved_amount?: number;
    }>
  >("GET", "/api/v1/balances/current");

  return rows.map((r) => ({
    currency: r.currency,
    available: r.available_amount ?? 0,
    pending: r.pending_amount ?? 0,
    reserved: r.reserved_amount ?? 0,
  }));
}

/* ------------------------------------------------------------ collecting --- */

export type IntentResult = {
  intentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
};

/**
 * Start a top up. The student pays in their home currency; the member id rides
 * along in metadata so the webhook knows whose shekels to credit once the
 * payment actually settles.
 */
export async function createPaymentIntent(input: {
  userId: string;
  amount: number;
  currency: string;
  requestId: string;
}): Promise<IntentResult> {
  const json = await call<{ id: string; client_secret: string }>("POST", "/api/v1/pa/payment_intents/create", {
    body: {
      request_id: input.requestId,
      merchant_order_id: input.requestId,
      amount: input.amount,
      currency: input.currency,
      // Echoed back on the webhook — the only link from a payment to a member.
      metadata: { shekk_user_id: input.userId },
    },
  });
  return {
    intentId: json.id,
    clientSecret: json.client_secret,
    amount: input.amount,
    currency: input.currency,
  };
}

/* -------------------------------------------------------------------- FX --- */

export type FxQuote = { rate: number; from: string; to: string; validUntil: string | null };

/** Live interbank-ish rate from Airwallex. Shekk's margin is applied on top. */
export async function fxRate(from: string, to = "ILS"): Promise<FxQuote> {
  const json = await call<{ rate: number; valid_to?: string }>("GET", "/api/v1/fx/rates/current", {
    query: { buy_currency: to, sell_currency: from },
  });
  return { rate: json.rate, from, to, validUntil: json.valid_to ?? null };
}

/** Convert collected foreign currency into the single ILS balance. */
export async function convertToShekels(input: {
  sellCurrency: string;
  sellAmount: number;
  requestId: string;
}): Promise<{ conversionId: string; buyAmount: number; rate: number }> {
  const json = await call<{ conversion_id: string; buy_amount: number; awx_rate: number }>(
    "POST",
    "/api/v1/fx/conversions/create",
    {
      body: {
        request_id: input.requestId,
        sell_currency: input.sellCurrency,
        sell_amount: input.sellAmount,
        buy_currency: "ILS",
        conversion_date: new Date().toISOString().slice(0, 10),
      },
    },
  );
  return { conversionId: json.conversion_id, buyAmount: json.buy_amount, rate: json.awx_rate };
}

/* -------------------------------------------------------------- transfers --- */

/** Pay money out to a bank account or another Airwallex account. */
export async function createTransfer(input: {
  requestId: string;
  amount: number;
  currency: string;
  beneficiaryId: string;
  reference: string;
}): Promise<{ transferId: string; status: string }> {
  const json = await call<{ id: string; status: string }>("POST", "/api/v1/transfers/create", {
    body: {
      request_id: input.requestId,
      source_currency: input.currency,
      payment_amount: input.amount,
      payment_currency: input.currency,
      beneficiary_id: input.beneficiaryId,
      reference: input.reference,
      reason: "transfer_to_own_account",
    },
  });
  return { transferId: json.id, status: json.status };
}

/* ---------------------------------------------------------------- issuing --- */

export type IssuedCard = {
  cardId: string;
  last4: string;
  brand: string;
  form: "VIRTUAL" | "PHYSICAL";
  status: string;
  expiryMonth: number | null;
  expiryYear: number | null;
};

/** A cardholder must exist at Airwallex before any card can be issued to them. */
export async function createCardholder(input: {
  requestId: string;
  email: string;
  firstName: string;
  lastName: string;
  countryCode: string;
}): Promise<{ cardholderId: string }> {
  const json = await call<{ cardholder_id: string }>("POST", "/api/v1/issuing/cardholders/create", {
    body: {
      request_id: input.requestId,
      type: "INDIVIDUAL",
      email: input.email,
      individual: {
        name: { first_name: input.firstName, last_name: input.lastName },
        express_consent_obtained: "yes",
      },
      postal_address: { country: input.countryCode },
    },
  });
  return { cardholderId: json.cardholder_id };
}

export async function createCard(input: {
  requestId: string;
  cardholderId: string;
  form: "VIRTUAL" | "PHYSICAL";
  nameOnCard: string;
}): Promise<IssuedCard> {
  const json = await call<{
    card_id: string;
    card_number_last_four?: string;
    brand?: string;
    form_factor?: string;
    card_status?: string;
    expiry_month?: number;
    expiry_year?: number;
  }>("POST", "/api/v1/issuing/cards/create", {
    body: {
      request_id: input.requestId,
      cardholder_id: input.cardholderId,
      form_factor: input.form,
      issue_to: "INDIVIDUAL",
      created_by: "Shekk",
      name_on_card: input.nameOnCard,
      // Cards spend the ILS balance; per-member limits live in our own ledger.
      authorization_controls: { allowed_currencies: ["ILS"] },
    },
  });

  return {
    cardId: json.card_id,
    last4: json.card_number_last_four ?? "••••",
    brand: json.brand ?? "VISA",
    form: input.form,
    status: json.card_status ?? "PENDING",
    expiryMonth: json.expiry_month ?? null,
    expiryYear: json.expiry_year ?? null,
  };
}

export async function freezeCard(cardId: string, frozen: boolean): Promise<void> {
  await call("POST", `/api/v1/issuing/cards/${cardId}/update`, {
    body: { card_status: frozen ? "INACTIVE" : "ACTIVE" },
  });
}

/* ------------------------------------------------------------- webhooks --- */

/**
 * Airwallex signs each delivery with HMAC-SHA256 over `timestamp + rawBody`.
 * Compared in constant time so a wrong signature leaks no timing information.
 */
export async function verifyWebhook(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
): Promise<boolean> {
  const secret = process.env.AIRWALLEX_WEBHOOK_SECRET;
  if (!secret || !timestamp || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + rawBody));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
