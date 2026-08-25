/**
 * Programme V2 — one composer for everything staff sends.
 *
 * A madrich picks what they're doing ("Tell everyone", "Ask a question"…) and
 * the composer writes the right row: announcements stay announcements, asks
 * become votes with the matching kind. Nothing new is invented server-side, so
 * audiences, notifications, acknowledgements and RLS all behave exactly as they
 * did in V1.
 */

import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { track } from "@/lib/analytics";
import {
  ActionButton,
  AudiencePicker,
  ErrorText,
  Field,
  Sheet,
  Toggle,
  fromLocalInput,
  inputClass,
} from "@/components/programme/Bits";
import { cleanError, useStaffActions } from "@/lib/useProgrammeHub";
import { everyone, type Audience, type PostKind, type ProgrammeHub } from "@/lib/programme/logic";

type People = { userId: string; name: string }[];

const CHOICES: { kind: PostKind; label: string; hint: string }[] = [
  { kind: "announcement", label: "Tell everyone", hint: "Lands in Updates. No alert." },
  { kind: "confirmation", label: "Must be read", hint: "You'll see who confirmed." },
  { kind: "urgent", label: "Urgent", hint: "Alerts everyone in the audience." },
  { kind: "yes_no", label: "Quick yes / no", hint: "One tap to answer." },
  { kind: "question", label: "Ask a question", hint: "Pick from your options." },
  { kind: "poll", label: "Vote", hint: "Choose the winner, then make it an event." },
];

const isAsk = (kind: PostKind) => kind === "poll" || kind === "question" || kind === "yes_no";

export function PostComposer({
  hub,
  people,
  onClose,
  initialKind = "announcement",
}: {
  hub: ProgrammeHub;
  people: People;
  onClose: () => void;
  initialKind?: PostKind;
}) {
  const { createAnnouncement, createVote } = useStaffActions();
  const [kind, setKind] = useState<PostKind>(initialKind);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLink] = useState("");
  const [pinned, setPinned] = useState(false);
  const [options, setOptions] = useState([
    { label: "", capacity: "" },
    { label: "", capacity: "" },
  ]);
  const [closesAt, setCloses] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [audience, setAudience] = useState<Audience>(everyone);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = createAnnouncement.isPending || createVote.isPending;
  const setOpt = (i: number, patch: Partial<{ label: string; capacity: string }>) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));

  function post() {
    setError(null);
    if (!hub.cohortId) return;
    if (!title.trim()) {
      setError(isAsk(kind) ? "What are you asking?" : "Give it a headline.");
      return;
    }
    const onError = (e: unknown) => setError(cleanError(e, "We couldn't post that."));

    if (isAsk(kind)) {
      const chosen =
        kind === "yes_no"
          ? [
              { label: "Yes", detail: null, capacity: null },
              { label: "No", detail: null, capacity: null },
            ]
          : options
              .filter((o) => o.label.trim())
              .map((o) => ({
                label: o.label.trim(),
                detail: null,
                capacity: o.capacity ? Number(o.capacity) : null,
              }));
      if (chosen.length < 2) {
        setError("Give people at least two options.");
        return;
      }
      createVote.mutate(
        {
          cohortId: hub.cohortId,
          input: {
            question: title.trim(),
            description: body.trim() || null,
            voteKind: kind,
            options: chosen,
            anonymous,
            allowChange: true,
            resultsVisible: true,
            closesAt: closesAt ? fromLocalInput(closesAt) : null,
            notify: true,
            audience,
          },
        },
        {
          onSuccess: () => {
            track("programme_staff_post_sent", { kind });
            onClose();
          },
          onError,
        },
      );
      return;
    }

    if (!body.trim()) {
      setError("Add the message itself.");
      return;
    }
    createAnnouncement.mutate(
      {
        cohortId: hub.cohortId,
        input: {
          title: title.trim(),
          body: body.trim(),
          priority: kind === "urgent" ? "urgent" : kind === "confirmation" ? "important" : "normal",
          pinned: pinned || kind === "urgent",
          requiresAck: kind === "confirmation" || kind === "urgent",
          linkUrl: linkUrl.trim() || null,
          notify: kind !== "announcement",
          audience,
        },
      },
      {
        onSuccess: () => {
          track("programme_staff_post_sent", { kind });
          onClose();
        },
        onError,
      },
    );
  }

  const choice = CHOICES.find((c) => c.kind === kind)!;

  return (
    <Sheet open onClose={onClose} title="New post">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            What are you doing?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CHOICES.map((c) => (
              <button
                key={c.kind}
                type="button"
                onClick={() => setKind(c.kind)}
                className={`tap-flat rounded-2xl border px-3 py-2.5 text-left ${
                  kind === c.kind ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <span className="block text-[13px] font-bold">{c.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] text-muted-foreground">{choice.hint}</p>
        </div>

        <Field label={isAsk(kind) ? "Your question" : "Headline"}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder={isAsk(kind) ? "Which tiyul this Thursday?" : "Bus leaves at 07:30"}
          />
        </Field>

        <Field label={isAsk(kind) ? "Context (optional)" : "Message"}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={isAsk(kind) ? 2 : 5}
            className={inputClass}
          />
        </Field>

        {kind === "poll" || kind === "question" ? (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Options</p>
            {options.map((o, i) => (
              <div key={i} className="grid grid-cols-[1fr_5rem] gap-2">
                <input
                  value={o.label}
                  onChange={(e) => setOpt(i, { label: e.target.value })}
                  className={inputClass}
                  placeholder={`Option ${i + 1}`}
                />
                <input
                  value={o.capacity}
                  onChange={(e) => setOpt(i, { capacity: e.target.value.replace(/\D/g, "") })}
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="Cap"
                />
              </div>
            ))}
            {options.length < 12 ? (
              <button
                type="button"
                onClick={() => setOptions((p) => [...p, { label: "", capacity: "" }])}
                className="tap-flat text-[12px] font-bold text-primary"
              >
                Add option
              </button>
            ) : null}
          </div>
        ) : null}

        <Field label="Who sees this">
          <AudiencePicker value={audience} onChange={setAudience} groups={hub.myGroups} people={people} />
        </Field>

        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="tap-flat text-[12px] font-bold text-primary"
        >
          {advanced ? "Hide options" : "More options"}
        </button>

        {advanced ? (
          <div className="space-y-3">
            {isAsk(kind) ? (
              <>
                <Field label="Closes (optional)">
                  <input
                    type="datetime-local"
                    value={closesAt}
                    onChange={(e) => setCloses(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Toggle
                  label="Anonymous"
                  checked={anonymous}
                  onChange={setAnonymous}
                  hint="You'll see totals, not names."
                />
              </>
            ) : (
              <>
                <Field label="Link (optional)">
                  <input
                    value={linkUrl}
                    onChange={(e) => setLink(e.target.value)}
                    className={inputClass}
                    placeholder="https://"
                  />
                </Field>
                <Toggle label="Pin to the top" checked={pinned} onChange={setPinned} />
              </>
            )}
          </div>
        ) : null}

        <ErrorText>{error}</ErrorText>

        <ActionButton className="w-full" onClick={post} disabled={busy}>
          <span className="inline-flex items-center gap-2">
            {isAsk(kind) ? <Send className="size-4" /> : <Megaphone className="size-4" />}
            {busy ? "Posting…" : isAsk(kind) ? "Ask the cohort" : "Post it"}
          </span>
        </ActionButton>
      </div>
    </Sheet>
  );
}
