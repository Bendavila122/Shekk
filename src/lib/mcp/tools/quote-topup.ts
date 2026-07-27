import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SPREAD = 0.03;
const MID_MARKET_ILS_PER_USD = 3.72;

export default defineTool({
  name: "quote_topup",
  title: "Quote a top up",
  description:
    "Preview a Shekk credit purchase: given a USD amount, return the mid-market reference rate, the spread taken and the shekel-denominated credits received. Credits are non-refundable and non-withdrawable.",
  inputSchema: { usd: z.number().positive().describe("Amount paid in USD.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ usd }) => {
    const gross = usd * MID_MARKET_ILS_PER_USD;
    const fee = gross * SPREAD;
    const credits = Math.round((gross - fee) * 100) / 100;
    const quote = {
      amountPaidUsd: usd,
      midMarketRate: MID_MARKET_ILS_PER_USD,
      spreadPercent: SPREAD * 100,
      feeIls: Math.round(fee * 100) / 100,
      creditsIls: credits,
      notice:
        "Credits are shekel-denominated app credits — non-refundable and non-withdrawable, spendable inside Shekk partner apps or with other Shekk users.",
    };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(quote, null, 2) }],
      structuredContent: quote,
    };
  },
});
