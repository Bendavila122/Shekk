import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { findService, STATUS_LABEL } from "@/lib/services";

export default defineTool({
  name: "get_service",
  title: "Get service details",
  description:
    "Get the full Shekk catalogue entry for one service by id: what it is, its category, integration status and the practical guide notes.",
  inputSchema: { id: z.string().describe("Service id, e.g. wolt, ravkav, rail.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const found = findService(id);
    if (!found) {
      return {
        content: [{ type: "text" as const, text: `No service with id "${id}".` }],
        isError: true,
      };
    }
    const { service, category } = found;
    const payload = {
      id: service.id,
      name: service.name,
      partner: service.partner,
      blurb: service.blurb,
      status: service.status,
      statusLabel: STATUS_LABEL[service.status],
      detail: service.detail ?? [],
      category: { id: category.id, label: category.label, tagline: category.tagline },
    };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
