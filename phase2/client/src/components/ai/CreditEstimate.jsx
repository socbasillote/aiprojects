import { useEffect, useRef, useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { api } from "../../services/api.js";

const DEBOUNCE_MS = 600;

export default function CreditEstimate({
  operation,
  prompt,
  design,
  selectedIds = [],
  canvas,
  size,
  quality,
  currentCredits = 0,
  onEstimate,
}) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const onEstimateRef = useRef(onEstimate);

  /*
   * Keep the callback in a ref.
   *
   * This is important because the parent may re-render
   * without the actual estimation inputs changing.
   */
  useEffect(() => {
    onEstimateRef.current = onEstimate;
  }, [onEstimate]);

  /*
   * Convert complex objects to stable values.
   *
   * We do NOT put design/canvas/selectedIds directly
   * into the dependency array.
   */
  const designKey =
    operation === "modifyDesign" && design ? JSON.stringify(design) : "";

  const selectedIdsKey =
    operation === "modifyDesign" ? JSON.stringify(selectedIds || []) : "";

  const canvasWidth = canvas?.width ?? 0;

  const canvasHeight = canvas?.height ?? 0;

  useEffect(() => {
    const text = typeof prompt === "string" ? prompt.trim() : "";

    /*
     * Don't request anything for an incomplete prompt.
     */
    if (text.length < 3) {
      ++requestIdRef.current;

      setLoading(false);
      setEstimate(null);
      setError("");

      onEstimateRef.current?.(null);

      return;
    }

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const payload = {
          operation,
          prompt: text,
        };

        if (operation === "generateDesign") {
          payload.canvas = {
            width: canvasWidth,
            height: canvasHeight,
          };
        }

        if (operation === "modifyDesign") {
          payload.selectedIds = selectedIds || [];

          if (design) {
            payload.design = design;
          }
        }

        if (operation === "generateImage") {
          payload.size = size;
          payload.quality = quality;
        }

        const result = await api.estimateAiCredits(payload);

        /*
         * Ignore stale responses.
         */
        if (requestId !== requestIdRef.current) {
          return;
        }

        const nextEstimate = result?.estimate || result;

        setEstimate(nextEstimate);
        setError("");

        onEstimateRef.current?.(nextEstimate);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error("AI credit estimate failed:", err);

        setEstimate(null);

        setError(err?.message || "Unable to estimate credit usage.");

        onEstimateRef.current?.(null);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [
    operation,
    prompt,
    designKey,
    selectedIdsKey,
    canvasWidth,
    canvasHeight,
    size,
    quality,
  ]);

  const credits = Number(
    estimate?.credits ??
      estimate?.estimatedCredits ??
      estimate?.reserveCredits ??
      0,
  );

  const inputTokens = estimate?.inputTokens;

  const outputTokens = estimate?.outputTokens;

  const enoughCredits = currentCredits >= credits;

  return (
    <div className="h-14.5">
      {loading && (
        <div className="flex h-full items-center rounded-lg border border-white/10 bg-[#0d0f13] px-2.5">
          <div className="flex items-center gap-2 text-[9px] text-slate-500">
            <Loader2 size={12} className="animate-spin text-violet-400" />
            Calculating credit usage…
          </div>
        </div>
      )}

      {!loading && estimate && (
        <div
          className={`h-full rounded-lg border px-2.5 py-2 ${
            enoughCredits
              ? "border-violet-500/10 bg-violet-500/5"
              : "border-amber-500/20 bg-amber-500/5"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calculator
                size={11}
                className={enoughCredits ? "text-violet-400" : "text-amber-400"}
              />

              <span className="text-[9px] text-slate-500">Estimated usage</span>
            </div>

            <span
              className={`text-[10px] font-semibold ${
                enoughCredits ? "text-violet-300" : "text-amber-300"
              }`}
            >
              ~{credits} credit
              {credits === 1 ? "" : "s"}
            </span>
          </div>

          {(inputTokens != null || outputTokens != null) && (
            <div className="mt-1 truncate text-[8px] text-slate-600">
              {inputTokens != null &&
                `~${Number(inputTokens).toLocaleString()} input`}

              {inputTokens != null && outputTokens != null && " · "}

              {outputTokens != null &&
                `up to ${Number(outputTokens).toLocaleString()} output tokens`}
            </div>
          )}

          {!enoughCredits && (
            <div className="mt-0.5 text-[8px] text-amber-300">
              Not enough credits for this request.
            </div>
          )}
        </div>
      )}

      {!loading && !estimate && !error && (
        <div className="flex h-full items-center rounded-lg border border-white/5 bg-white/1.5 px-2.5">
          <div className="text-[9px] text-slate-600">
            Type a prompt to estimate credit usage.
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex h-full items-center rounded-lg border border-amber-500/10 bg-amber-500/5 px-2.5">
          <div className="truncate text-[9px] text-amber-300">
            Credit estimate unavailable.
          </div>
        </div>
      )}
    </div>
  );
}
