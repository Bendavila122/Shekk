/**
 * Identity server functions.
 *
 * Thin wrappers only. The member is always taken from the verified token, so
 * nobody can read or write another person's regulated details.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const text = (max: number) => z.string().trim().max(max);
const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const draftSchema = z
  .object({
    legalFirstName: text(60),
    legalMiddleName: text(60),
    legalLastName: text(60),
    dateOfBirth: iso,
    nationality: text(60),
    phoneCountryCode: text(6),
    phoneNumber: text(24),
    addressLine1: text(120),
    addressLine2: text(120),
    addressCity: text(80),
    addressState: text(80),
    addressPostcode: text(20),
    addressCountry: text(60),
    ilAddressLine1: text(120),
    ilAddressCity: text(80),
    ilAddressPostcode: text(20),
    idDocumentType: z.enum(["passport", "national_id", "drivers_licence"]),
    idDocumentNumber: text(40),
    idIssuingCountry: text(60),
    idExpiry: iso,
    taxCountry: text(60),
    taxId: text(40),
    occupation: text(60),
    sourceOfFunds: text(80),
    expectedMonthlyIls: z.number().int().min(0).max(200_000),
    isPep: z.boolean(),
    isUsPerson: z.boolean(),
    program: text(80),
    cohort: text(40),
    city: text(60),
    arrivalDate: iso,
    preferredCurrency: z.enum(["USD", "GBP", "EUR", "CAD", "AUD", "ZAR"]),
    acceptTerms: z.boolean(),
  })
  .partial();

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { readProfile, missingFields } = await import("./kyc.server");
    const profile = await readProfile(context.userId, context.claims?.email as string | undefined);
    return { profile, missing: missingFields(profile) };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => draftSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { saveProfile, missingFields } = await import("./kyc.server");
    const profile = await saveProfile(
      context.userId,
      data,
      context.claims?.email as string | undefined,
    );
    return { profile, missing: missingFields(profile) };
  });

/** Short-lived ticket so the browser uploads straight into private storage. */
export const startDocumentUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        kind: z.enum(["id_front", "id_back", "selfie", "proof_of_address"]),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { createUploadTicket } = await import("./kyc.server");
    return createUploadTicket(context.userId, data.kind, data.contentType);
  });

export const confirmDocumentUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        kind: z.enum(["id_front", "id_back", "selfie", "proof_of_address"]),
        path: z.string().max(300),
        contentType: z.string().max(80),
        byteSize: z.number().int().min(1).max(15_000_000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { recordDocument, readProfile, missingFields } = await import("./kyc.server");
    await recordDocument(context.userId, data.kind, data.path, data.contentType, data.byteSize);
    const profile = await readProfile(context.userId);
    return { profile, missing: missingFields(profile) };
  });

export const submitMyKyc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { submitKyc } = await import("./kyc.server");
    return submitKyc(context.userId, context.claims?.email as string | undefined);
  });
