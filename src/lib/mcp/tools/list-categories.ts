import { defineTool } from "@lovable.dev/mcp-js";
import { SERVICE_CATEGORIES } from "@/lib/services";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description:
    "List the Shekk explore categories (getting around, food, housing, admin, and so on) with their taglines and how many services each holds.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const categories = SERVICE_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      tagline: c.tagline,
      serviceCount: c.services.length,
    }));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(categories, null, 2) }],
      structuredContent: { categories },
    };
  },
});

