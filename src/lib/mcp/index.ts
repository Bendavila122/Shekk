import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCategoriesTool from "./tools/list-categories";
import listServicesTool from "./tools/list-services";
import getServiceTool from "./tools/get-service";
import quoteTopupTool from "./tools/quote-topup";

// Direct Supabase issuer — the published proxy URL fails RFC 8414 issuer matching.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "shekk-mcp",
  title: "Shekk",
  version: "0.1.0",
  instructions:
    "Tools for Shekk, a super-app for American students on gap-year programs in Israel. Browse the catalogue of Israeli apps and services with `list_categories`, `list_services` and `get_service`, and preview a credit top up with `quote_topup`. Callers must sign in as a Shekk user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCategoriesTool, listServicesTool, getServiceTool, quoteTopupTool],
});

