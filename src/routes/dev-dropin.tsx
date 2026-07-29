import { createFileRoute } from "@tanstack/react-router";
import { AirwallexDropIn } from "@/components/AirwallexDropIn";

export const Route = createFileRoute("/dev-dropin")({
  component: () => (
    <AirwallexDropIn
      intentId="int_test"
      clientSecret="secret_test"
      currency="USD"
      environment="sandbox"
      onSubmitted={() => console.log("SUBMITTED")}
      onError={(m) => console.log("DROPIN_ERROR", m)}
    />
  ),
});
