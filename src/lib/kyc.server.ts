/**
 * Member identity (KYC) — server only.
 *
 * The profile row is the regulated record: legal name, date of birth, address,
 * ID document, tax residency and the declarations Airwallex needs before a
 * person can hold shekels or be issued a card.
 *
 * Invariant: `kyc_status`, the review timestamps and the Airwallex ids are
 * written here and nowhere else. The client can submit facts about itself; it
 * can never award itself a verification state — the tables deny every direct
 * client write, so all of this runs through the service role.
 */

export type KycStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "in_review"
  | "verified"
  | "rejected";

export type MemberProfile = {
  userId: string;
  email: string | null;
  legalFirstName: string | null;
  legalMiddleName: string | null;
  legalLastName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPostcode: string | null;
  addressCountry: string | null;
  ilAddressLine1: string | null;
  ilAddressCity: string | null;
  ilAddressPostcode: string | null;
  idDocumentType: string | null;
  idDocumentNumber: string | null;
  idIssuingCountry: string | null;
  idExpiry: string | null;
  taxCountry: string | null;
  taxId: string | null;
  occupation: string | null;
  sourceOfFunds: string | null;
  expectedMonthlyIls: number | null;
  isPep: boolean;
  isUsPerson: boolean;
  termsAcceptedAt: string | null;
  privacyAcceptedAt: string | null;
  esignAcceptedAt: string | null;
  program: string | null;
  cohort: string | null;
  city: string | null;
  arrivalDate: string | null;
  preferredCurrency: string;
  kycStatus: KycStatus;
  kycSubmittedAt: string | null;
  kycRejectionReason: string | null;
  reverifyDueAt: string | null;
  hasCardholder: boolean;
  /** Where our regulated partner's review of this member's shekel account stands. */
  ilsAccountStatus: IlsAccountStatus;
  ilsAccountApprovedAt: string | null;
  ilsAccountRejectionReason: string | null;
  documents: Array<{ id: string; kind: string; createdAt: string }>;
};

/** Fields the member is allowed to send us. Everything else is ours. */
export type ProfileDraft = Partial<{
  legalFirstName: string;
  legalMiddleName: string;
  legalLastName: string;
  dateOfBirth: string;
  nationality: string;
  phoneCountryCode: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressPostcode: string;
  addressCountry: string;
  ilAddressLine1: string;
  ilAddressCity: string;
  ilAddressPostcode: string;
  idDocumentType: string;
  idDocumentNumber: string;
  idIssuingCountry: string;
  idExpiry: string;
  taxCountry: string;
  taxId: string;
  occupation: string;
  sourceOfFunds: string;
  expectedMonthlyIls: number;
  isPep: boolean;
  isUsPerson: boolean;
  program: string;
  cohort: string;
  city: string;
  arrivalDate: string;
  preferredCurrency: string;
  acceptTerms: boolean;
}>;

const COLUMN: Record<keyof ProfileDraft, string> = {
  legalFirstName: "legal_first_name",
  legalMiddleName: "legal_middle_name",
  legalLastName: "legal_last_name",
  dateOfBirth: "date_of_birth",
  nationality: "nationality",
  phoneCountryCode: "phone_country_code",
  phoneNumber: "phone_number",
  addressLine1: "address_line1",
  addressLine2: "address_line2",
  addressCity: "address_city",
  addressState: "address_state",
  addressPostcode: "address_postcode",
  addressCountry: "address_country",
  ilAddressLine1: "il_address_line1",
  ilAddressCity: "il_address_city",
  ilAddressPostcode: "il_address_postcode",
  idDocumentType: "id_document_type",
  idDocumentNumber: "id_document_number",
  idIssuingCountry: "id_issuing_country",
  idExpiry: "id_expiry",
  taxCountry: "tax_country",
  taxId: "tax_id",
  occupation: "occupation",
  sourceOfFunds: "source_of_funds",
  expectedMonthlyIls: "expected_monthly_ils",
  isPep: "is_pep",
  isUsPerson: "is_us_person",
  program: "program",
  cohort: "cohort",
  city: "city",
  arrivalDate: "arrival_date",
  preferredCurrency: "preferred_currency",
  acceptTerms: "",
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type Row = Record<string, unknown>;

function shape(row: Row, docs: Row[]): MemberProfile {
  const s = (k: string) => (row[k] == null ? null : String(row[k]));
  return {
    userId: String(row.user_id),
    email: s("email"),
    legalFirstName: s("legal_first_name"),
    legalMiddleName: s("legal_middle_name"),
    legalLastName: s("legal_last_name"),
    dateOfBirth: s("date_of_birth"),
    nationality: s("nationality"),
    phoneCountryCode: s("phone_country_code"),
    phoneNumber: s("phone_number"),
    addressLine1: s("address_line1"),
    addressLine2: s("address_line2"),
    addressCity: s("address_city"),
    addressState: s("address_state"),
    addressPostcode: s("address_postcode"),
    addressCountry: s("address_country"),
    ilAddressLine1: s("il_address_line1"),
    ilAddressCity: s("il_address_city"),
    ilAddressPostcode: s("il_address_postcode"),
    idDocumentType: s("id_document_type"),
    idDocumentNumber: s("id_document_number"),
    idIssuingCountry: s("id_issuing_country"),
    idExpiry: s("id_expiry"),
    taxCountry: s("tax_country"),
    taxId: s("tax_id"),
    occupation: s("occupation"),
    sourceOfFunds: s("source_of_funds"),
    expectedMonthlyIls: row.expected_monthly_ils == null ? null : Number(row.expected_monthly_ils),
    isPep: Boolean(row.is_pep),
    isUsPerson: Boolean(row.is_us_person),
    termsAcceptedAt: s("terms_accepted_at"),
    privacyAcceptedAt: s("privacy_accepted_at"),
    esignAcceptedAt: s("esign_accepted_at"),
    program: s("program"),
    cohort: s("cohort"),
    city: s("city"),
    arrivalDate: s("arrival_date"),
    preferredCurrency: s("preferred_currency") ?? "USD",
    kycStatus: (s("kyc_status") ?? "not_started") as KycStatus,
    kycSubmittedAt: s("kyc_submitted_at"),
    kycRejectionReason: s("kyc_rejection_reason"),
    reverifyDueAt: s("reverify_due_at"),
    hasCardholder: Boolean(row.airwallex_cardholder_id),
    ilsAccountStatus: (s("airwallex_account_status") ?? "not_submitted") as IlsAccountStatus,
    ilsAccountApprovedAt: s("ils_account_approved_at"),
    ilsAccountRejectionReason: s("airwallex_rejection_reason"),
    documents: docs.map((d) => ({
      id: String(d.id),
      kind: String(d.kind),
      createdAt: String(d.created_at),
    })),
  };
}

/** Read the profile, creating an empty one the first time a member appears. */
export async function readProfile(userId: string, email?: string | null): Promise<MemberProfile> {
  const db = await admin();
  const { data, error } = await db
    .from("member_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;

  let row = data as Row | null;
  if (!row) {
    const { data: created, error: insertError } = await db
      .from("member_profiles")
      .insert({ user_id: userId, email: email ?? null })
      .select("*")
      .single();
    if (insertError) throw insertError;
    row = created as Row;
  } else if (email && !row.email) {
    await db.from("member_profiles").update({ email }).eq("user_id", userId);
    row.email = email;
  }

  const { data: docs } = await db
    .from("kyc_documents")
    .select("id, kind, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  return shape(row, (docs ?? []) as Row[]);
}

/**
 * Save what the member typed. Locked once they are verified or under review —
 * regulated details cannot be edited behind the reviewer's back.
 */
export async function saveProfile(
  userId: string,
  draft: ProfileDraft,
  email?: string | null,
): Promise<MemberProfile> {
  const current = await readProfile(userId, email);
  if (current.kycStatus === "verified" || current.kycStatus === "in_review") return current;

  const patch: Row = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(draft)) {
    if (value === undefined) continue;
    if (key === "acceptTerms") continue;
    const column = COLUMN[key as keyof ProfileDraft];
    if (!column) continue;
    patch[column] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  if (draft.acceptTerms) {
    const now = new Date().toISOString();
    patch.terms_accepted_at = current.termsAcceptedAt ?? now;
    patch.privacy_accepted_at = current.privacyAcceptedAt ?? now;
    patch.esign_accepted_at = current.esignAcceptedAt ?? now;
  }
  if (current.kycStatus === "not_started") patch.kyc_status = "in_progress";

  const db = await admin();
  const { error } = await db.from("member_profiles").update(patch as never).eq("user_id", userId);
  if (error) throw error;
  return readProfile(userId, email);
}

/* ------------------------------------------------------------- documents --- */

const DOC_KINDS = ["id_front", "id_back", "selfie", "proof_of_address"] as const;
export type DocKind = (typeof DOC_KINDS)[number];

/** A short-lived upload ticket so the file goes straight to private storage. */
export async function createUploadTicket(
  userId: string,
  kind: DocKind,
  contentType: string,
): Promise<{ path: string; token: string }> {
  const ext = contentType === "application/pdf" ? "pdf" : contentType.split("/")[1] || "jpg";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const db = await admin();
  const { data, error } = await db.storage.from("kyc-documents").createSignedUploadUrl(path);
  if (error || !data) throw new Error("Could not start the upload");
  return { path, token: data.token };
}

export async function recordDocument(
  userId: string,
  kind: DocKind,
  path: string,
  mimeType: string,
  byteSize: number,
): Promise<void> {
  if (!path.startsWith(`${userId}/`)) throw new Error("Bad upload path");
  const db = await admin();
  // One live file per kind: replacing a passport photo should not stack rows.
  await db.from("kyc_documents").delete().eq("user_id", userId).eq("kind", kind);
  const { error } = await db.from("kyc_documents").insert({
    user_id: userId,
    kind,
    storage_path: path,
    mime_type: mimeType,
    byte_size: byteSize,
  });
  if (error) throw error;
}

/* ------------------------------------------------------------- submission --- */

export type MissingField = { field: string; label: string };

const REQUIRED: Array<[keyof MemberProfile, string]> = [
  ["legalFirstName", "Legal first name"],
  ["legalLastName", "Legal last name"],
  ["dateOfBirth", "Date of birth"],
  ["nationality", "Nationality"],
  ["phoneNumber", "Mobile number"],
  ["addressLine1", "Home address"],
  ["addressCity", "Home city"],
  ["addressCountry", "Home country"],
  ["idDocumentType", "ID document type"],
  ["idDocumentNumber", "ID document number"],
  ["idIssuingCountry", "ID issuing country"],
  ["idExpiry", "ID expiry date"],
  ["taxCountry", "Tax residency"],
  ["occupation", "Occupation"],
  ["sourceOfFunds", "Source of funds"],
];

export function missingFields(p: MemberProfile): MissingField[] {
  const gaps: MissingField[] = [];
  for (const [key, label] of REQUIRED) {
    if (!p[key]) gaps.push({ field: String(key), label });
  }
  if (!p.termsAcceptedAt) gaps.push({ field: "acceptTerms", label: "Terms & Conditions" });
  const kinds = new Set(p.documents.map((d) => d.kind));
  if (!kinds.has("id_front")) gaps.push({ field: "id_front", label: "Photo of your ID" });
  if (!kinds.has("selfie")) gaps.push({ field: "selfie", label: "Selfie check" });
  return gaps;
}

/**
 * Hand the member to Airwallex. Where the keys are live we create the
 * cardholder record now, so a card can be issued the moment review passes.
 * Verification itself is never granted here — a human or the partner's own
 * decision moves the row to `verified`.
 */
export async function submitKyc(
  userId: string,
  email?: string | null,
): Promise<{ ok: boolean; missing: MissingField[]; status: KycStatus }> {
  const profile = await readProfile(userId, email);
  if (profile.kycStatus === "verified") {
    return { ok: true, missing: [], status: "verified" };
  }
  const missing = missingFields(profile);
  if (missing.length) return { ok: false, missing, status: profile.kycStatus };

  const db = await admin();
  const patch: Row = {
    kyc_status: "in_review",
    kyc_submitted_at: new Date().toISOString(),
    kyc_rejection_reason: null,
    updated_at: new Date().toISOString(),
  };
  // Handing the file to the partner is what starts their shekel-account review.
  if (profile.ilsAccountStatus === "not_submitted" || profile.ilsAccountStatus === "rejected") {
    patch.airwallex_account_status = "pending";
    patch.airwallex_rejection_reason = null;
  }

  const { isConfigured, createCardholder } = await import("./airwallex.server");
  if (isConfigured() && !profile.hasCardholder) {
    try {
      const { cardholderId } = await createCardholder({
        requestId: crypto.randomUUID(),
        email: profile.email ?? email ?? "",
        firstName: profile.legalFirstName!,
        lastName: profile.legalLastName!,
        countryCode: (profile.addressCountry ?? "IL").slice(0, 2).toUpperCase(),
      });
      patch.airwallex_cardholder_id = cardholderId;
    } catch (error) {
      // Partner onboarding can fail for scope or approval reasons. The
      // application still stands; we just retry the handover later.
      console.error("[kyc] cardholder creation failed", error);
    }
  }

  const { error } = await db.from("member_profiles").update(patch as never).eq("user_id", userId);
  if (error) throw error;
  return { ok: true, missing: [], status: "in_review" };
}
