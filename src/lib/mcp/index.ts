import { defineMcp } from "@lovable.dev/mcp-js";
import listCategoriesTool from "./tools/list-categories";
import listServicesTool from "./tools/list-services";
import getServiceTool from "./tools/get-service";
import quoteTopupTool from "./tools/quote-topup";

export default defineMcp({
  name: "shekk-mcp",
  title: "Shekk",
  version: "0.1.0",
  instructions:
    "Tools for Shekk, a super-app for American students on gap-year programs in Israel. Browse the catalogue of Israeli apps and services with `list_categories`, `list_services` and `get_service`, and preview a credit top up with `quote_topup`. All data is public prototype data; there are no user accounts.",
  tools: [listCategoriesTool, listServicesTool, getServiceTool, quoteTopupTool],
});
