import { createFileRoute, Link } from "@tanstack/react-router";
import { FocusScreen } from "@/components/AppShell";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions · ShekelPay" },
      {
        name: "description",
        content: "ShekelPay credit purchase terms, annual verification requirement and account status policy.",
      },
      { property: "og:title", content: "Terms & Conditions · ShekelPay" },
      { property: "og:description", content: "How ShekelPay credits, verification and account status work." },
    ],
  }),
  component: Terms,
});

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. What ShekelPay is",
    p: [
      "ShekelPay operates a closed-loop credit system for participants in study programs in Israel. ShekelPay is not a bank, does not offer deposit accounts, and does not hold currency on your behalf.",
      "When you top up, you are purchasing ShekelPay credits denominated in new Israeli shekels. The transaction is a sale of credits, completed at the moment of purchase.",
    ],
  },
  {
    h: "2. Buying credits",
    p: [
      "Credits are purchased in US dollars via Apple Pay or another supported payment method. Before you confirm any purchase, the app displays the amount paid, the ShekelPay rate applied, and the exact credit amount you will receive.",
      "ShekelPay sets its own conversion rate. That rate includes ShekelPay's margin and will differ from interbank or mid-market rates; no separate fee is charged on top of it. Rates are refreshed periodically and the rate shown at confirmation is the rate applied.",

    ],
  },
  {
    h: "3. Non-refundable, non-withdrawable",
    p: [
      "Credits are non-refundable and non-withdrawable. They may be spent within the ShekelPay app or with participating partner merchants. They cannot be redeemed for cash, transferred to a bank account, or sold to another person.",
      "Credits do not earn interest and are not insured as a deposit would be.",
    ],
  },
  {
    h: "4. Spending",
    p: [
      "Each spend is recorded in your Activity with merchant name, category, amount in shekels and the date. A US dollar reference amount is shown for convenience only and does not represent a redeemable value.",
    ],
  },
  {
    h: "5. Annual verification requirement",
    p: [
      "Every 12 months you must re-verify your identity by re-submitting a government-issued photo ID (typically your passport photo page) and a live selfie.",
      "You will receive an email notice and an in-app countdown banner. The deadline is 30 days from the date of the notice.",
    ],
  },
  {
    h: "6. Account status policy",
    p: [
      "Accounts are Verified, Expiring soon (re-verification requested, deadline not passed), or Needs update (deadline passed or documents rejected).",
      "An account in Needs update status is limited: no new credit purchases and no new spends may be made. Existing credits remain associated with the account and become spendable again once verification is completed.",
      "ShekelPay may suspend an account for suspected fraud, credit reselling, or use by someone other than the registered student.",
    ],
  },
  {
    h: "7. Support and disputes",
    p: [
      "Merchant disputes are handled between you and the merchant; ShekelPay may assist with transaction records. Errors in a credit purchase should be reported within 30 days.",
    ],
  },
];

function Terms() {
  return (
    <FocusScreen>
      <div className="min-h-screen sm:min-h-[860px]">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
          <Link to="/me" className="tap rounded-full bg-muted p-2">
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="text-lg font-semibold">Terms & Conditions</h1>
        </header>
        <div className="space-y-6 px-6 py-6 text-sm leading-relaxed">
          <p className="rounded-2xl bg-muted p-4 text-xs text-muted-foreground">
            Prototype placeholder document. Last updated: this demo build. Not legal advice.
          </p>
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="mb-2 text-base font-semibold">{s.h}</h2>
              {s.p.map((p, i) => (
                <p key={i} className="mb-2 text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <Link to="/me" className="tap block rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground">
            Back to Me
          </Link>
        </div>
      </div>
    </FocusScreen>
  );
}
