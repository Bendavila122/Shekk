import { createFileRoute, Link } from "@tanstack/react-router";
import { FocusScreen } from "@/components/AppShell";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions · Shekk" },
      {
        name: "description",
        content: "How your Shekk shekel account works, who provides it, eligibility criteria and how identity checks are handled.",
      },
      { property: "og:title", content: "Terms & Conditions · Shekk" },
      { property: "og:description", content: "Your Shekk account, who provides it, eligibility and identity checks." },
    ],
  }),
  component: Terms,
});

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Who runs your account",
    p: [
      "Shekk is the app you use. The money side of Shekk is provided by our regulated payments partner, Airwallex, which holds and moves the funds under its own licences and its own customer terms.",
      "That means your shekel account is a real, regulated payment account — not app credits or a voucher. Opening it means entering an agreement with our partner as well as with Shekk, and you accept both when you open the account.",
      "Shekk does not hold your money, decide who is approved, or make regulatory decisions about your account. Our partner does.",
    ],
  },
  {
    h: "2. Eligibility",
    p: [
      "You can only hold a Shekk account if you meet our partner's criteria as well as ours. At a minimum you must: be at least 18 years old; be a natural person opening the account for yourself; live in a country our partner supports; hold valid government-issued identity documents; and not appear on any applicable sanctions list.",
      "You must not be resident in, or operating from, a country or territory our partner or applicable law restricts, and you must not use the account for any activity on our partner's prohibited-use list.",
      "Anyone under 18 cannot hold an account, even with a parent's permission. Programmes that include participants under 18 should contact us before enrolling them.",
      "Meeting these criteria does not guarantee an account. Our partner can decline, delay or close an account at its discretion or where the law requires it, and neither we nor our partner are obliged to give a reason.",
    ],
  },
  {
    h: "3. Identity checks are run by our partner",
    p: [
      "Shekk collects your details and documents and passes them to our partner. Our partner performs the customer due diligence, sanctions and fraud screening, and makes the decision to approve, refuse or review your account.",
      "Shekk cannot verify you itself, override a refusal, or promise a timescale. Where our partner asks for more information, we will pass the request on to you; if you do not provide it, the account cannot be opened or kept open.",
      "Our partner may re-run checks at any time, and may ask for updated documents periodically or on a specific event, such as your identity document expiring. Until an outstanding request is resolved, the account may be limited.",
    ],
  },
  {
    h: "4. Adding money and currency conversion",
    p: [
      "You add money in a supported currency — GBP, USD, EUR, CAD, AUD or ZAR — and it is converted into new Israeli shekels and credited to your shekel account.",
      "Before you confirm, the app shows the amount you pay, the reference rate, Shekk's margin and the exact shekel amount you will receive. The rate shown at confirmation is the rate applied.",
      "Funds are received and held by our partner, and are safeguarded in line with the rules our partner is subject to. A payment account is not a savings product: it earns no interest and is not a bank deposit or a deposit-insured account.",
    ],
  },
  {
    h: "5. Spending, cards and transfers",
    p: [
      "You can spend your shekel balance in the app, with partner services inside Shekk, and — where issued to you — with a Shekk card. Card payments are authorised against your available balance.",
      "Payments are made from your own account. Where an amount is not final at the time of payment, such as a ride fare, the amount is held against your balance and settled at the final figure once it is confirmed; any difference is released back to you.",
      "Every movement appears in Activity with the merchant, category, amount and date.",
    ],
  },
  {
    h: "6. Limits, holds and account status",
    p: [
      "Balance, payment and transfer limits apply and may change; they are set by us and by our partner and can be adjusted for regulatory or risk reasons.",
      "Your account may be limited, frozen or closed where our partner requires it, where checks are outstanding, or where we suspect fraud, sanctions exposure or use by someone other than the account holder. While an account is limited you may be unable to add money or spend.",
      "If your account is closed, any remaining balance is returned to you in line with our partner's terms, subject to the checks the law requires.",
    ],
  },
  {
    h: "7. Your responsibilities",
    p: [
      "Keep your details accurate and tell us promptly if your name, address, residency status or identity documents change. Keep your sign-in and card details secure and report loss, theft or unrecognised activity to us immediately.",
      "The account is yours alone. Do not let anyone else use it, do not receive money for third parties through it, and do not use it for business or any prohibited activity.",
    ],
  },
  {
    h: "8. Support and disputes",
    p: [
      "Raise anything about a payment, a partner order or your balance with Shekk first. We will work with our partner and the merchant, and where a refund is due, the funds return to your shekel account.",
      "Report an error in a payment or a top-up as soon as you notice it. Where our partner's terms or applicable law give you additional rights over disputed or unauthorised payments, those rights apply and nothing here limits them.",
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
            Summary document maintained by Shekk to explain how the account works. The money side of Shekk is provided by our regulated payments partner and their customer terms apply alongside these. This is not legal advice and is not a substitute for either full agreement.
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
