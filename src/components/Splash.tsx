/**
 * Shekk splash screen.
 *
 * Shown while the app boots (session check) and over any hand-off that would
 * otherwise flash someone else's loading screen — the Google/Apple redirect.
 */

export function Splash({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background px-6">
      <img
        src="/logo.png"
        alt="Shekk"
        width={88}
        height={88}
        className="size-22 animate-[splash-pop_600ms_ease-out] rounded-3xl shadow-card"
        style={{ width: 88, height: 88 }}
      />
      <div className="text-center">
        <p className="text-lg font-extrabold tracking-[0.22em] text-foreground">SHEKK</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {message ?? "One wallet for your year in Israel"}
        </p>
      </div>
      <div className="h-1 w-28 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 animate-[splash-slide_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
    </div>
  );
}

export default Splash;
