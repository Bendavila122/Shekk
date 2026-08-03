/**
 * Where is this member in their Israel journey?
 *
 * Derived purely from onboarding/travel data we already collect, so screens can
 * say the right thing at the right time instead of showing one static home
 * screen to everybody.
 */

import type { MemberTravel } from "@/lib/programme.server";

export type JourneyPhase = "unknown" | "planning" | "final-countdown" | "first-week" | "settled" | "final-stretch";

export type Journey = {
  phase: JourneyPhase;
  /** Short label for a chip, e.g. "12 days to go". */
  chip: string | null;
  /** One warm line under the greeting. */
  line: string;
  daysToArrival: number | null;
  daysInIsrael: number | null;
  daysToDeparture: number | null;
  inIsrael: boolean;
};

function dayDiff(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(`${iso}T00:00:00`).getTime();
  if (Number.isNaN(then)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((then - today.getTime()) / 86_400_000);
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function getJourney(travel: MemberTravel): Journey {
  const daysToArrival = dayDiff(travel.arrivalDate);
  const daysToDeparture = dayDiff(travel.departureDate);
  const daysInIsrael = daysToArrival === null ? null : Math.max(0, -daysToArrival);
  const inIsrael = daysToArrival !== null && daysToArrival <= 0;
  const city = travel.israelCity;

  if (daysToArrival === null) {
    return {
      phase: "unknown",
      chip: null,
      line: "Tell Shekk when you're arriving and we'll line everything up for you.",
      daysToArrival: null,
      daysInIsrael: null,
      daysToDeparture,
      inIsrael: false,
    };
  }

  if (daysToArrival > 7) {
    return {
      phase: "planning",
      chip: `${plural(daysToArrival, "day")} to go`,
      line: "Plenty of time — let's get the boring bits done before you fly.",
      daysToArrival,
      daysInIsrael,
      daysToDeparture,
      inIsrael,
    };
  }

  if (daysToArrival > 0) {
    return {
      phase: "final-countdown",
      chip: daysToArrival === 1 ? "Tomorrow" : `${plural(daysToArrival, "day")} to go`,
      line: "Almost time. A few last things and you'll land ready.",
      daysToArrival,
      daysInIsrael,
      daysToDeparture,
      inIsrael,
    };
  }

  if (daysInIsrael !== null && daysInIsrael <= 7) {
    return {
      phase: "first-week",
      chip: daysInIsrael === 0 ? "You made it" : `Day ${daysInIsrael + 1} in Israel`,
      line: city ? `Your first week in ${city}. Here's what makes it easier.` : "Your first week in Israel. Here's what makes it easier.",
      daysToArrival,
      daysInIsrael,
      daysToDeparture,
      inIsrael,
    };
  }

  if (daysToDeparture !== null && daysToDeparture >= 0 && daysToDeparture <= 21) {
    return {
      phase: "final-stretch",
      chip: daysToDeparture === 0 ? "Last day" : `${plural(daysToDeparture, "day")} left`,
      line: "The final stretch — make the most of it before you fly home.",
      daysToArrival,
      daysInIsrael,
      daysToDeparture,
      inIsrael,
    };
  }

  return {
    phase: "settled",
    chip: city ?? "In Israel",
    line: city ? `Settled in ${city}. Everything you need for today.` : "Everything you need for today.",
    daysToArrival,
    daysInIsrael,
    daysToDeparture,
    inIsrael,
  };
}

/** Greeting that respects Israel time-of-day rather than the device's mood. */
export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Layla tov";
}
