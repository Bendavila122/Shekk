/**
 * Member profile + verification state for the UI.
 *
 * Everything regulated lives on the server; this hook only mirrors it and
 * offers the two mutations a member is allowed to make: save my own details,
 * and submit them for review.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/lib/store";
import {
  getMyProfile,
  saveMyProfile,
  submitMyKyc,
  startDocumentUpload,
  confirmDocumentUpload,
} from "@/lib/kyc.functions";
import { supabase } from "@/integrations/supabase/client";

export type DocKind = "id_front" | "id_back" | "selfie" | "proof_of_address";

/** Mirrors the server's accepted draft — only facts a member states about themselves. */
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
  idDocumentType: "passport" | "national_id" | "drivers_licence";
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
  preferredCurrency: "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "ZAR";
  acceptTerms: boolean;
}>;

export function useProfile() {
  const { signedIn } = useApp();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["member-profile"],
    queryFn: () => getMyProfile(),
    enabled: signedIn,
    staleTime: 15_000,
  });

  const save = useMutation({
    mutationFn: (draft: ProfileDraft) => saveMyProfile({ data: draft }),
    onSuccess: (next) => qc.setQueryData(["member-profile"], next),
  });

  const submit = useMutation({
    mutationFn: () => submitMyKyc(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member-profile"] }),
  });

  const upload = useMutation({
    mutationFn: async ({ kind, file }: { kind: DocKind; file: File }) => {
      const contentType = file.type as "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
      const ticket = await startDocumentUpload({ data: { kind, contentType } });
      const { error } = await supabase.storage
        .from("kyc-documents")
        .uploadToSignedUrl(ticket.path, ticket.token, file);
      if (error) throw new Error("Upload failed — try a smaller or clearer photo.");
      return confirmDocumentUpload({
        data: { kind, path: ticket.path, contentType: file.type, byteSize: file.size },
      });
    },
    onSuccess: (next) => qc.setQueryData(["member-profile"], next),
  });

  const profile = query.data?.profile ?? null;
  const status = profile?.kycStatus ?? "not_started";

  return {
    profile,
    missing: query.data?.missing ?? [],
    status,
    verified: status === "verified",
    pending: status === "in_review" || status === "submitted",
    loading: query.isLoading,
    save,
    submit,
    upload,
    refetch: query.refetch,
  };
}
