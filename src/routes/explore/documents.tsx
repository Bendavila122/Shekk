import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { DocumentVault } from "@/components/official/DocumentVault";

const searchSchema = z.object({
  category: z
    .enum(["passport", "visa", "program", "insurance", "army", "university", "financial", "other"])
    .optional(),
});

export const Route = createFileRoute("/explore/documents")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Documents · Shekk" },
      {
        name: "description",
        content:
          "Keep your passport page, visa, acceptance letter and insurance policy in one private vault, ready when an office asks.",
      },
      { property: "og:title", content: "Documents · Shekk" },
      {
        property: "og:description",
        content: "Private storage for the paperwork a gap year in Israel keeps asking for.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Vault,
});

function Vault() {
  const { category } = Route.useSearch();
  return (
    <AppShell>
      <ScreenHeader title="Documents" subtitle="Private to you" />
      <div className="px-4 py-4">
        <DocumentVault initial={category} />
      </div>
      <div className="pb-10" />
    </AppShell>
  );
}
