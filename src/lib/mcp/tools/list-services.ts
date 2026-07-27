import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ALL_SERVICES, SERVICE_CATEGORIES, STATUS_LABEL } from "@/lib/services";

export default defineTool({
  name: "list_services",
  title: "List services",
  description:
    "List the Israeli apps and services in the Shekk catalogue. Optionally filter by category id, status, or a free-text query.",
  inputSchema: {
    categoryId: z.string().optional().describe("Category id, e.g. transit, food, housing."),
    status: z.enum(["live", "integrating", "guide"]).optional().describe("Integration status filter."),
    query: z.string().optional().describe("Free-text match against name, partner or blurb."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ categoryId, status, query }) => {
    const base = categoryId
      ? (SERVICE_CATEGORIES.find((c) => c.id === categoryId)?.services ?? [])
      : ALL_SERVICES;

    const q = query?.trim().toLowerCase();
    const services = base
      .filter((s) => (status ? s.status === status : true))
      .filter((s) =>
        q ? `${s.name} ${s.partner ?? ""} ${s.blurb}`.toLowerCase().includes(q) : true,
      )
      .map((s) => ({
        id: s.id,
        name: s.name,
        partner: s.partner,
        blurb: s.blurb,
        status: s.status,
        statusLabel: STATUS_LABEL[s.status],
      }));

    return {
      content: [{ type: "text" as const, text: JSON.stringify(services, null, 2) }],
      structuredContent: { services, count: services.length },
    };
  },
});
