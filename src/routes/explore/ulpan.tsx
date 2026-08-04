import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Flame,
  Heart,
  RotateCcw,
  Shuffle,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { Chip, MicroLabel, MicroLabel as Label, ProgressBar, SectionHead } from "@/components/Kit";
import { dayIndex, todayISO, toggleId, useLocalState } from "@/lib/local-state";
import {
  DAILY_WORDS,
  ULPAN_CATEGORIES,
  allPhrases,
  buildQuiz,
  categoryOf,
  pickForDay,
  type Phrase,
  type QuizQuestion,
} from "@/lib/ulpan-content";

export const Route = createFileRoute("/explore/ulpan")({
  head: () => ({
    meta: [
      { title: "Ulpan · Shekk" },
      {
        name: "description",
        content:
          "Learn the Hebrew you actually need: a daily word, phrase of the day, flashcards and quizzes for the taxi, restaurant, shuk and emergencies — with streaks and progress.",
      },
      { property: "og:title", content: "Ulpan · Shekk" },
      {
        property: "og:description",
        content: "Daily words, flashcards and quizzes for the Hebrew you'll use this week.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ulpan,
});

type Prefs = {
  learned: string[];
  favourites: string[];
  streak: number;
  lastDay: string | null;
  quizBest: number;
  quizRounds: number;
  xp: number;
};

const DEFAULTS: Prefs = {
  learned: [],
  favourites: [],
  streak: 0,
  lastDay: null,
  quizBest: 0,
  quizRounds: 0,
  xp: 0,
};

type Mode = "path" | "today" | "cards" | "quiz";


function speak(phrase: Phrase) {
  try {
    const u = new SpeechSynthesisUtterance(phrase.he);
    u.lang = "he-IL";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* no speech synthesis — the transliteration is still there */
  }
}

function Ulpan() {
  const { value: prefs, update } = useLocalState("shekk.ulpan.v1", DEFAULTS);
  const [mode, setMode] = useState<Mode>("path");
  const [deckId, setDeckId] = useState<string>("everyday");

  const day = dayIndex();
  const word = pickForDay(DAILY_WORDS, day);
  const phrase = pickForDay(allPhrases(), day, 7);
  const total = allPhrases().length + DAILY_WORDS.length;

  /** Any real activity keeps the streak alive — once per day. */
  const recordDay = () =>
    update((p) => {
      const today = todayISO();
      if (p.lastDay === today) return p;
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      return { ...p, lastDay: today, streak: p.lastDay === yesterday ? p.streak + 1 : 1 };
    });

  const markLearned = (id: string) => {
    update((p) => {
      const learning = !p.learned.includes(id);
      const learned = toggleId(p.learned, id);
      /* XP is only ever earned, never clawed back for a mistaken tap. */
      const gained = learning ? XP.learn : 0;
      const beforeStages = PATHS.flatMap((path) => path.stages).filter((s) =>
        s.phraseIds.every((pid) => p.learned.includes(pid)),
      ).length;
      const afterStages = PATHS.flatMap((path) => path.stages).filter((s) =>
        s.phraseIds.every((pid) => learned.includes(pid)),
      ).length;
      const stageBonus = Math.max(0, afterStages - beforeStages) * XP.stage;
      return { ...p, learned, xp: p.xp + gained + stageBonus };
    });
    recordDay();
  };
  const toggleFav = (id: string) => update((p) => ({ ...p, favourites: toggleId(p.favourites, id) }));

  const learnedPct = total ? prefs.learned.length / total : 0;
  const lvl = levelFor(prefs.xp);



  return (
    <AppShell>
      <ScreenHeader title="Ulpan" back="/israel" />

      <header className="px-4 pt-2">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
          style={{ backgroundImage: "var(--grad-jewish)" }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <MicroLabel className="opacity-70">Your Hebrew</MicroLabel>
                <p className="mt-2 font-display text-[2rem] font-bold leading-tight tracking-tight">
                  {prefs.learned.length}
                  <span className="text-base font-semibold opacity-70"> / {total} learned</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-foreground/15 px-3 py-1.5 text-[12px] font-bold">
                <Flame className="size-3.5" /> {prefs.streak} day{prefs.streak === 1 ? "" : "s"}
              </span>
            </div>
            <ProgressBar value={learnedPct} tone="onDark" className="mt-3.5" />
            <p className="mt-2 text-[12px] opacity-80">
              {prefs.streak === 0
                ? "Learn one thing today to start a streak."
                : prefs.lastDay === todayISO()
                  ? "Today is in. Come back tomorrow to keep the streak."
                  : "Do one card today to keep your streak alive."}
            </p>
          </div>
        </div>
      </header>

      <nav className="flex gap-2 px-4 pt-4" aria-label="Ulpan mode">
        {(
          [
            ["today", "Today"],
            ["cards", "Flashcards"],
            ["quiz", "Quiz"],
          ] as [Mode, string][]
        ).map(([id, label]) => (
          <Chip key={id} selected={mode === id} onClick={() => setMode(id)}>
            {label}
          </Chip>
        ))}
      </nav>

      {mode === "today" ? (
        <TodayView
          word={word}
          phrase={phrase}
          prefs={prefs}
          onLearn={markLearned}
          onFav={toggleFav}
          onOpenDeck={(id) => {
            setDeckId(id);
            setMode("cards");
          }}
        />
      ) : mode === "cards" ? (
        <CardsView
          deckId={deckId}
          setDeckId={setDeckId}
          prefs={prefs}
          onLearn={markLearned}
          onFav={toggleFav}
        />
      ) : (
        <QuizView
          deckId={deckId}
          setDeckId={setDeckId}
          onFinish={(score, count) => {
            update((p) => ({ ...p, quizBest: Math.max(p.quizBest, score), quizRounds: p.quizRounds + 1 }));
            recordDay();
            void count;
          }}
          best={prefs.quizBest}
        />
      )}
    </AppShell>
  );
}

/* ────────────────────────────── Today ────────────────────────────── */

function PhraseCard({
  phrase,
  learned,
  favourite,
  onLearn,
  onFav,
}: {
  phrase: Phrase;
  learned: boolean;
  favourite: boolean;
  onLearn: () => void;
  onFav: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p dir="rtl" className="font-display text-[26px] font-bold leading-tight">
            {phrase.he}
          </p>
          <p className="mt-1 text-[15px] font-semibold text-primary">{phrase.translit}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{phrase.en}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            type="button"
            aria-label="Hear it"
            onClick={() => speak(phrase)}
            className="tap-flat grid size-9 place-items-center rounded-full bg-muted text-foreground/70"
          >
            <Volume2 className="size-4" />
          </button>
          <button
            type="button"
            aria-label={favourite ? "Remove from favourites" : "Add to favourites"}
            onClick={onFav}
            className={`tap-flat grid size-9 place-items-center rounded-full ${favourite ? "bg-primary-soft text-primary" : "bg-muted text-foreground/70"}`}
          >
            <Heart className={`size-4 ${favourite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
      {phrase.tip ? (
        <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
          {phrase.tip}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onLearn}
        className={`tap mt-3 flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[12.5px] font-bold ${
          learned ? "bg-success-soft text-success" : "bg-primary text-primary-foreground"
        }`}
      >
        {learned ? (
          <>
            <Check className="size-4" /> Learned
          </>
        ) : (
          "I know this one"
        )}
      </button>
    </Card>
  );
}

function TodayView({
  word,
  phrase,
  prefs,
  onLearn,
  onFav,
  onOpenDeck,
}: {
  word: Phrase;
  phrase: Phrase;
  prefs: Prefs;
  onLearn: (id: string) => void;
  onFav: (id: string) => void;
  onOpenDeck: (id: string) => void;
}) {
  const favs = useMemo(
    () => [...allPhrases(), ...DAILY_WORDS].filter((p) => prefs.favourites.includes(p.id)),
    [prefs.favourites],
  );

  return (
    <div className="space-y-6 px-4 pb-12 pt-5">
      <section>
        <SectionHead title="Word of the day" hint="Slang first — it's what you'll actually hear." />
        <PhraseCard
          phrase={word}
          learned={prefs.learned.includes(word.id)}
          favourite={prefs.favourites.includes(word.id)}
          onLearn={() => onLearn(word.id)}
          onFav={() => onFav(word.id)}
        />
      </section>

      <section>
        <SectionHead title="Phrase of the day" hint="Say this one out loud three times." />
        <PhraseCard
          phrase={phrase}
          learned={prefs.learned.includes(phrase.id)}
          favourite={prefs.favourites.includes(phrase.id)}
          onLearn={() => onLearn(phrase.id)}
          onFav={() => onFav(phrase.id)}
        />
      </section>

      <section>
        <SectionHead title="Pick a situation" hint="Each deck is the Hebrew for one real moment." />
        <div className="grid grid-cols-2 gap-2.5">
          {ULPAN_CATEGORIES.map((c) => {
            const known = c.phrases.filter((p) => prefs.learned.includes(p.id)).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onOpenDeck(c.id)}
                className="tap overflow-hidden rounded-2xl border border-border bg-card p-3.5 text-left shadow-card"
              >
                <span
                  className="flex size-10 items-center justify-center rounded-xl text-lg"
                  style={{ backgroundImage: c.grad }}
                  aria-hidden
                >
                  {c.emoji}
                </span>
                <span className="mt-2.5 block text-[13.5px] font-semibold">{c.name}</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">{c.blurb}</span>
                <ProgressBar value={known / c.phrases.length} className="mt-2.5" />
                <span className="mt-1.5 block text-[11px] font-bold text-muted-foreground">
                  {known}/{c.phrases.length}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {favs.length ? (
        <section>
          <SectionHead title="Your favourites" hint="The ones you asked Shekk to keep close." />
          <Card className="space-y-3 divide-y divide-border p-0">
            {favs.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3.5 first:pt-3.5">
                <button
                  type="button"
                  aria-label="Hear it"
                  onClick={() => speak(p)}
                  className="tap-flat grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground/70"
                >
                  <Volume2 className="size-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p dir="rtl" className="text-[15px] font-bold leading-tight">
                    {p.he}
                  </p>
                  <p className="text-[12px] font-semibold text-primary">{p.translit}</p>
                  <p className="text-[11.5px] text-muted-foreground">{p.en}</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove from favourites"
                  onClick={() => onFav(p.id)}
                  className="tap-flat shrink-0 text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </Card>
        </section>
      ) : null}
    </div>
  );
}

/* ──────────────────────────── Flashcards ──────────────────────────── */

function DeckPicker({ deckId, setDeckId }: { deckId: string; setDeckId: (id: string) => void }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ULPAN_CATEGORIES.map((c) => (
        <Chip key={c.id} selected={deckId === c.id} onClick={() => setDeckId(c.id)} className="shrink-0">
          {c.emoji} {c.name}
        </Chip>
      ))}
    </div>
  );
}

function CardsView({
  deckId,
  setDeckId,
  prefs,
  onLearn,
  onFav,
}: {
  deckId: string;
  setDeckId: (id: string) => void;
  prefs: Prefs;
  onLearn: (id: string) => void;
  onFav: (id: string) => void;
}) {
  const deck = categoryOf(deckId) ?? ULPAN_CATEGORIES[0];
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = deck.phrases[Math.min(i, deck.phrases.length - 1)];

  const go = (delta: number) => {
    setRevealed(false);
    setI((prev) => (prev + delta + deck.phrases.length) % deck.phrases.length);
  };

  return (
    <div className="space-y-4 px-4 pb-12 pt-4">
      <DeckPicker
        deckId={deck.id}
        setDeckId={(id) => {
          setDeckId(id);
          setI(0);
          setRevealed(false);
        }}
      />

      <div className="flex items-center justify-between px-1">
        <Label className="text-muted-foreground">
          Card {i + 1} of {deck.phrases.length}
        </Label>
        <button
          type="button"
          onClick={() => {
            setI(Math.floor(Math.random() * deck.phrases.length));
            setRevealed(false);
          }}
          className="tap-flat inline-flex items-center gap-1 text-[12px] font-bold text-primary"
        >
          <Shuffle className="size-3.5" /> Shuffle
        </button>
      </div>

      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="tap block w-full rounded-[1.5rem] border border-border bg-card px-5 py-10 text-center shadow-card"
      >
        <p dir="rtl" className="font-display text-[34px] font-bold leading-tight">
          {card.he}
        </p>
        <p className="mt-2 text-[16px] font-semibold text-primary">{card.translit}</p>
        {revealed ? (
          <>
            <p className="mt-4 text-[15px] font-semibold">{card.en}</p>
            {card.tip ? (
              <p className="mx-auto mt-2 max-w-[20rem] text-[12px] leading-relaxed text-muted-foreground">
                {card.tip}
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Tap to reveal
          </p>
        )}
      </button>

      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          className="tap rounded-full border border-border bg-card py-2.5 text-[12.5px] font-semibold"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onFav(card.id)}
          className={`tap grid place-items-center rounded-full py-2.5 ${
            prefs.favourites.includes(card.id) ? "bg-primary-soft text-primary" : "border border-border bg-card"
          }`}
          aria-label="Favourite"
        >
          <Heart className={`size-4 ${prefs.favourites.includes(card.id) ? "fill-current" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => {
            onLearn(card.id);
            go(1);
          }}
          className={`tap col-span-2 rounded-full py-2.5 text-[12.5px] font-bold ${
            prefs.learned.includes(card.id) ? "bg-success-soft text-success" : "bg-primary text-primary-foreground"
          }`}
        >
          {prefs.learned.includes(card.id) ? "Learned · next" : "Got it · next"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => speak(card)}
        className="tap-flat mx-auto flex items-center gap-1.5 text-[12.5px] font-bold text-primary"
      >
        <Volume2 className="size-4" /> Hear it
      </button>
    </div>
  );
}

/* ────────────────────────────── Quiz ────────────────────────────── */

function QuizView({
  deckId,
  setDeckId,
  onFinish,
  best,
}: {
  deckId: string;
  setDeckId: (id: string) => void;
  onFinish: (score: number, count: number) => void;
  best: number;
}) {
  const deck = categoryOf(deckId) ?? ULPAN_CATEGORIES[0];
  const [round, setRound] = useState<{ seed: number; qs: QuizQuestion[] } | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const start = () => {
    const seed = Date.now();
    setRound({ seed, qs: buildQuiz(deck.phrases, Math.min(8, deck.phrases.length), seed) });
    setI(0);
    setPicked(null);
    setScore(0);
  };

  if (!round) {
    return (
      <div className="space-y-4 px-4 pb-12 pt-4">
        <DeckPicker deckId={deck.id} setDeckId={setDeckId} />
        <Card className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Trophy className="size-6" />
          </span>
          <p className="mt-3 text-[15px] font-semibold">Quiz: {deck.name}</p>
          <p className="mx-auto mt-1 max-w-[19rem] text-[12.5px] leading-relaxed text-muted-foreground">
            {Math.min(8, deck.phrases.length)} questions. Hebrew on the screen, you pick what it means.
          </p>
          {best > 0 ? (
            <p className="mt-2 text-[12px] font-bold text-muted-foreground">Your best round: {best} correct</p>
          ) : null}
          <button
            type="button"
            onClick={start}
            className="tap mt-4 w-full rounded-full bg-primary py-3 text-[13px] font-bold text-primary-foreground"
          >
            Start quiz
          </button>
        </Card>
      </div>
    );
  }

  const done = i >= round.qs.length;

  if (done) {
    const pct = score / round.qs.length;
    return (
      <div className="space-y-4 px-4 pb-12 pt-4">
        <div
          className="relative overflow-hidden rounded-[1.5rem] p-5 text-center text-ink-foreground shadow-lift"
          style={{ backgroundImage: pct >= 0.75 ? "var(--grad-premium)" : "var(--grad-jewish)" }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <Sparkles className="mx-auto size-6" />
            <p className="mt-2 font-display text-[2rem] font-bold leading-tight">
              {score}/{round.qs.length}
            </p>
            <p className="mt-1 text-[12.5px] opacity-85">
              {pct === 1
                ? "Perfect. Try a harder deck."
                : pct >= 0.75
                  ? "You'd survive the taxi."
                  : pct >= 0.5
                    ? "Halfway there — run the flashcards once more."
                    : "New deck, no shame. Flashcards first."}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={start}
            className="tap inline-flex items-center justify-center gap-1.5 rounded-full bg-primary py-3 text-[12.5px] font-bold text-primary-foreground"
          >
            <RotateCcw className="size-4" /> Again
          </button>
          <button
            type="button"
            onClick={() => setRound(null)}
            className="tap rounded-full border border-border bg-card py-3 text-[12.5px] font-semibold"
          >
            Change deck
          </button>
        </div>
      </div>
    );
  }

  const q = round.qs[i];

  return (
    <div className="space-y-4 px-4 pb-12 pt-4">
      <div className="px-1">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground">
            {deck.name} · {i + 1}/{round.qs.length}
          </Label>
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-primary">
            <Star className="size-3.5" /> {score}
          </span>
        </div>
        <ProgressBar value={i / round.qs.length} className="mt-2" />
      </div>

      <Card className="text-center">
        <p dir="rtl" className="font-display text-[30px] font-bold leading-tight">
          {q.phrase.he}
        </p>
        <p className="mt-1.5 text-[14px] font-semibold text-primary">{q.phrase.translit}</p>
      </Card>

      <div className="space-y-2">
        {q.options.map((opt) => {
          const isCorrect = opt === q.phrase.en;
          const chosen = picked === opt;
          const state =
            picked === null ? "idle" : isCorrect ? "correct" : chosen ? "wrong" : "dim";
          return (
            <button
              key={opt}
              type="button"
              disabled={picked !== null}
              onClick={() => {
                setPicked(opt);
                if (isCorrect) setScore((s) => s + 1);
                window.setTimeout(() => {
                  setPicked(null);
                  const next = i + 1;
                  setI(next);
                  if (next >= round.qs.length) {
                    onFinish(isCorrect ? score + 1 : score, round.qs.length);
                  }
                }, 850);
              }}
              className={`tap flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-[13.5px] font-semibold transition-colors ${
                state === "correct"
                  ? "border-success bg-success-soft text-success"
                  : state === "wrong"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : state === "dim"
                      ? "border-border bg-card opacity-50"
                      : "border-border bg-card"
              }`}
            >
              {opt}
              {state === "correct" ? <Check className="size-4 shrink-0" /> : null}
              {state === "wrong" ? <X className="size-4 shrink-0" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
