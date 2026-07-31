import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { ImageUp, RefreshCw } from "lucide-react";

type Detector = { detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>> };

type ScanState = "starting" | "live" | "denied" | "unavailable";

/**
 * Live QR scanner. Uses the native BarcodeDetector when present and falls back
 * to jsQR frame decoding (Safari/iOS, Firefox), plus a photo-upload path when
 * the camera cannot be opened at all.
 */
export function QrScanner({
  onResult,
  paused = false,
  className = "",
}: {
  onResult: (value: string) => void;
  paused?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const handledRef = useRef(false);
  const [state, setState] = useState<ScanState>("starting");
  const [attempt, setAttempt] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  const emit = useCallback(
    (raw: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      onResult(raw.trim());
    },
    [onResult],
  );

  const decodeFromCanvas = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return null;
    const w = Math.min(640, video.videoWidth);
    const h = Math.round((video.videoHeight / video.videoWidth) * w);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    const image = ctx.getImageData(0, 0, w, h);
    return jsQR(image.data, w, h, { inversionAttempts: "attemptBoth" })?.data ?? null;
  }, []);

  useEffect(() => {
    if (paused) return;
    handledRef.current = false;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    let detector: Detector | null = null;
    let last = 0;

    const Ctor = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector })
      .BarcodeDetector;

    const tick = async (ts: number) => {
      if (cancelled || handledRef.current) return;
      if (ts - last > 180) {
        last = ts;
        try {
          if (detector && videoRef.current?.videoWidth) {
            const hits = await detector.detect(videoRef.current);
            if (hits[0]?.rawValue) return emit(hits[0].rawValue);
          } else {
            const hit = decodeFromCanvas();
            if (hit) return emit(hit);
          }
        } catch {
          detector = null; // fall back to jsQR on detector failure
        }
      }
      raf = requestAnimationFrame(tick);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState("unavailable");
        return;
      }
      setState("starting");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
          audio: false,
        });
      } catch (err) {
        const name = (err as { name?: string })?.name;
        setState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        /* autoplay retried by the browser */
      }
      if (Ctor) {
        try {
          const formats = await (
            Ctor as unknown as { getSupportedFormats?: () => Promise<string[]> }
          ).getSupportedFormats?.();
          if (!formats || formats.includes("qr_code")) detector = new Ctor({ formats: ["qr_code"] });
        } catch {
          detector = null;
        }
      }
      setState("live");
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, attempt, decodeFromCanvas, emit]);

  const onFile = async (file: File) => {
    setNote(null);
    const bitmap = await createImageBitmap(file).catch(() => null);
    const canvas = canvasRef.current;
    if (!bitmap || !canvas) {
      setNote("Could not read that image.");
      return;
    }
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(bitmap, 0, 0);
    const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    const hit = jsQR(data.data, bitmap.width, bitmap.height, { inversionAttempts: "attemptBoth" });
    if (hit?.data) {
      handledRef.current = false;
      emit(hit.data);
    } else {
      setNote("No QR code found in that photo.");
    }
  };

  return (
    <div className={className}>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-ink">
        <video ref={videoRef} muted playsInline autoPlay className="size-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {state !== "live" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-sm text-ink-foreground/85">
            <p>
              {state === "starting"
                ? "Starting the camera…"
                : state === "denied"
                  ? "Camera access is blocked. Allow camera for this site in your browser settings, then try again."
                  : "No camera available here — upload a photo of the code or type the tag below."}
            </p>
            {state !== "starting" && (
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setAttempt((a) => a + 1)}
                  className="tap flex items-center gap-1.5 rounded-full bg-card/15 px-3 py-2 text-xs font-semibold"
                >
                  <RefreshCw className="size-3.5" /> Try again
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="tap flex items-center gap-1.5 rounded-full bg-card/15 px-3 py-2 text-xs font-semibold"
                >
                  <ImageUp className="size-3.5" /> Upload photo
                </button>
              </div>
            )}
          </div>
        )}
        {state === "live" && (
          <>
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/70" />
            <button
              onClick={() => fileRef.current?.click()}
              className="tap absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-2 text-xs font-semibold text-ink-foreground"
            >
              <ImageUp className="size-3.5" /> Photo
            </button>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void onFile(f);
        }}
      />
      {note && <p className="mt-2 text-xs font-semibold text-destructive">{note}</p>}
    </div>
  );
}
