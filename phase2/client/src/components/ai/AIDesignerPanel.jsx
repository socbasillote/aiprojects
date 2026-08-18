import { useState } from "react";
import {
  Bot,
  Check,
  Image as ImageIcon,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addElement, replaceDocument } from "../../store/slices/designSlice.js";
import { clearHistory, pushHistory } from "../../store/slices/historySlice.js";
import {
  clearSelection,
  selectElement,
} from "../../store/slices/selectionSlice.js";
import { updateAiCredits } from "../../store/slices/authSlice.js";
import { api, API_URL } from "../../services/api.js";
import CreditPurchaseModal from "../billing/CreditPurchaseModal.jsx";
import CreditEstimate from "./CreditEstimate.jsx";

const clone = (value) => structuredClone(value);

export default function AIDesignerPanel() {
  const dispatch = useDispatch();

  const design = useSelector((state) => state.design);

  const aiCredits = useSelector((state) => state.auth.user?.aiCredits ?? 0);

  const selectedIds = useSelector((state) => state.selection.ids);

  const selectedCount = selectedIds.length;

  const [mode, setMode] = useState("generate");

  const [imageSize, setImageSize] = useState("1024x1024");

  const [imageQuality, setImageQuality] = useState("low");

  const [prompt, setPrompt] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [showCreditsModal, setShowCreditsModal] = useState(false);

  /*
   * This is the server-calculated estimate
   * for the CURRENT prompt.
   */
  const [creditEstimate, setCreditEstimate] = useState(null);

  /*
   * Fallback values used before the server
   * has returned an estimate.
   *
   * These are only UX fallbacks.
   * The server remains authoritative.
   */
  const fallbackCost =
    mode === "image"
      ? imageQuality === "high"
        ? 12
        : imageQuality === "medium"
          ? 7
          : 5
      : 1;

  /*
   * Once the server gives us an estimate,
   * display that instead of the old fixed
   * "1 credit / run" value.
   */
  const estimatedCredits = creditEstimate?.credits ?? fallbackCost;

  /*
   * The server may reserve slightly more
   * than the estimated actual cost to protect
   * against output-token variation.
   */
  const requiredCredits = creditEstimate?.reserveCredits ?? fallbackCost;

  const hasCredits = aiCredits >= requiredCredits;

  const hasPrompt = prompt.trim().length >= 3;

  const syncCredits = (result) => {
    if (typeof result?.credits?.remaining === "number") {
      dispatch(updateAiCredits(result.credits.remaining));
    }
  };

  const handleEstimate = (estimate) => {
    setCreditEstimate(estimate || null);
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
    setCreditEstimate(null);
  };

  const generate = async () => {
    if (!hasPrompt || loading || !hasCredits) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.generateDesign({
        prompt: prompt.trim(),

        canvas: {
          width: design.canvas.width,

          height: design.canvas.height,
        },
      });

      syncCredits(result);

      dispatch(replaceDocument(result.document));

      dispatch(clearHistory());
      dispatch(clearSelection());

      setMessage(
        `Design generated successfully. ${
          result.credits?.actual ??
          result.credits?.estimated ??
          estimatedCredits
        } credit${
          (result.credits?.actual ??
            result.credits?.estimated ??
            estimatedCredits) === 1
            ? ""
            : "s"
        } used.`,
      );

      setPrompt("");
      setCreditEstimate(null);
    } catch (err) {
      setError(err?.message || "Unable to generate the design.");
    } finally {
      setLoading(false);
    }
  };

  const modify = async () => {
    if (!hasPrompt || loading || !hasCredits) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const before = clone(design);

    try {
      const result = await api.modifyDesign({
        instruction: prompt.trim(),

        selectedIds,

        design,
      });

      syncCredits(result);

      const after = applyOperationsLocally(before, result.operations);

      dispatch(replaceDocument(after));

      dispatch(
        pushHistory({
          before,
          after,
        }),
      );

      setMessage(
        `${result.summary || "AI changes applied."} ${
          result.credits?.actual ??
          result.credits?.estimated ??
          estimatedCredits
        } credit${
          (result.credits?.actual ??
            result.credits?.estimated ??
            estimatedCredits) === 1
            ? ""
            : "s"
        } used.`,
      );

      setPrompt("");
      setCreditEstimate(null);
    } catch (err) {
      setError(err?.message || "Unable to modify the design.");
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!hasPrompt || loading || !hasCredits) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.generateImage({
        prompt: prompt.trim(),
        size: imageSize,
        quality: imageQuality,
      });

      syncCredits(result);

      const asset = result.asset;

      const serverOrigin = apiServerOrigin();

      const src = asset.url.startsWith("http")
        ? asset.url
        : `${serverOrigin}${asset.url}`;

      const max = 420;

      const scale = Math.min(1, max / Math.max(asset.width, asset.height));

      const width = Math.max(1, Math.round(asset.width * scale));

      const height = Math.max(1, Math.round(asset.height * scale));

      const element = {
        id: crypto.randomUUID(),

        type: "image",

        assetId: asset.id,

        name: asset.name,

        src,

        mimeType: asset.mimeType,

        x: Math.max(0, Math.round((design.canvas.width - width) / 2)),

        y: Math.max(0, Math.round((design.canvas.height - height) / 2)),

        width,

        height,

        rotation: 0,

        opacity: 1,

        visible: true,

        locked: false,
      };

      const before = clone(design);

      const after = clone(design);

      after.elements[element.id] = element;

      after.elementOrder.push(element.id);

      dispatch(addElement(element));

      dispatch(selectElement(element.id));

      dispatch(
        pushHistory({
          before,
          after,
        }),
      );

      window.dispatchEvent(new Event("assets:changed"));

      const actualCredits =
        result.credits?.actual ?? result.credits?.cost ?? estimatedCredits;

      setMessage(
        `AI image generated and added as an editable image layer. ${actualCredits} credit${
          actualCredits === 1 ? "" : "s"
        } used.`,
      );

      setPrompt("");
      setCreditEstimate(null);
    } catch (err) {
      setError(err?.message || "Unable to generate the image.");
    } finally {
      setLoading(false);
    }
  };

  const submit =
    mode === "generate" ? generate : mode === "modify" ? modify : generateImage;

  return (
    <section className="border-b border-white/10 p-3">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-200">
        <Bot size={15} className="text-violet-400" />
        AI DESIGNER
      </div>

      {/* Credits */}
      <div className="mb-2 rounded-lg border border-white/10 bg-[#0d0f13] px-2.5 py-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-wide text-slate-500">
              AI Credits
            </div>

            <div className="text-xs font-semibold text-slate-200">
              {aiCredits} remaining
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div
              className={`rounded-md px-2 py-1 text-[9px] ${
                creditEstimate
                  ? hasCredits
                    ? "bg-violet-500/10 text-violet-300"
                    : "bg-amber-500/10 text-amber-300"
                  : "bg-white/5 text-slate-500"
              }`}
            >
              {creditEstimate
                ? `~${estimatedCredits} credit${
                    estimatedCredits === 1 ? "" : "s"
                  }`
                : `${fallbackCost} credit${
                    fallbackCost === 1 ? "" : "s"
                  } starting estimate`}
            </div>

            <button
              type="button"
              onClick={() => setShowCreditsModal(true)}
              className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[9px] font-semibold text-violet-300 hover:bg-violet-500/20"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Current estimate */}
        {creditEstimate && (
          <div
            className={`mt-2 rounded-md border px-2 py-1.5 ${
              hasCredits
                ? "border-violet-500/10 bg-violet-500/5"
                : "border-amber-500/20 bg-amber-500/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-500">Current prompt</span>

              <span
                className={`text-[10px] font-semibold ${
                  hasCredits ? "text-violet-300" : "text-amber-300"
                }`}
              >
                ~{estimatedCredits} credit
                {estimatedCredits === 1 ? "" : "s"}
              </span>
            </div>

            {creditEstimate.inputTokens != null && (
              <div className="mt-0.5 text-[8px] text-slate-600">
                ~{Number(creditEstimate.inputTokens).toLocaleString()} input
                tokens · up to{" "}
                {Number(creditEstimate.outputTokens || 0).toLocaleString()}{" "}
                output tokens
              </div>
            )}

            {!hasCredits && (
              <div className="mt-1 text-[8px] font-medium text-amber-300">
                Not enough credits for this request.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode selector */}
      <div className="mb-2 grid grid-cols-3 rounded-lg bg-[#0d0f13] p-1 text-[10px]">
        <button
          type="button"
          onClick={() => changeMode("generate")}
          className={`rounded-md px-2 py-1.5 ${
            mode === "generate"
              ? "bg-violet-600 text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Design
        </button>

        <button
          type="button"
          onClick={() => changeMode("modify")}
          className={`rounded-md px-2 py-1.5 ${
            mode === "modify"
              ? "bg-violet-600 text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Modify
        </button>

        <button
          type="button"
          onClick={() => changeMode("image")}
          className={`rounded-md px-2 py-1.5 ${
            mode === "image"
              ? "bg-violet-600 text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Image
        </button>
      </div>

      {/* Selection information */}
      {mode === "modify" && (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] text-slate-500">
          <Check size={12} className="text-emerald-400" />

          {selectedCount
            ? `${selectedCount} selected layer${selectedCount === 1 ? "" : "s"}`
            : "No layer selected — AI will inspect the design"}
        </div>
      )}

      {/* No credits warning */}
      {!aiCredits && (
        <div className="mb-2 rounded-md bg-amber-500/10 p-2 text-[10px] leading-4 text-amber-300">
          You have no AI credits remaining. Add credits to use AI features.
        </div>
      )}

      {/* Description */}
      <p className="mb-2 text-[11px] leading-4 text-slate-500">
        {mode === "generate"
          ? "Describe the design you want. The AI returns editable layers, not a flattened image."
          : mode === "modify"
            ? "Describe a change. AI returns only the operations needed to modify the existing layers."
            : "Generate a raster image asset. It will be saved to your asset library and inserted as an editable image layer."}
      </p>

      {/* Prompt */}
      <textarea
        value={prompt}
        onChange={(event) => {
          setPrompt(event.target.value);

          /*
           * Clear the old estimate immediately.
           * CreditEstimate will request a fresh
           * server estimate after the debounce.
           */
          setCreditEstimate(null);

          setError("");
        }}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={
          mode === "generate"
            ? "Create an Instagram post for a coffee shop..."
            : mode === "modify"
              ? "Make the title bigger and move it slightly down..."
              : "A realistic ceramic coffee cup on a warm beige table, editorial product photography..."
        }
        rows={5}
        className="w-full resize-none rounded-lg border border-white/10 bg-[#0d0f13] p-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500/60"
      />

      {/* Image settings */}
      {mode === "image" && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-[10px] text-slate-500">
            Size
            <select
              value={imageSize}
              onChange={(event) => {
                setImageSize(event.target.value);

                setCreditEstimate(null);
              }}
              className="mt-1 w-full rounded-md border border-white/10 bg-[#0d0f13] px-2 py-1.5 text-[10px] text-slate-300 outline-none"
            >
              <option value="1024x1024">Square</option>

              <option value="1024x1536">Portrait</option>

              <option value="1536x1024">Landscape</option>
            </select>
          </label>

          <label className="text-[10px] text-slate-500">
            Quality
            <select
              value={imageQuality}
              onChange={(event) => {
                setImageQuality(event.target.value);

                setCreditEstimate(null);
              }}
              className="mt-1 w-full rounded-md border border-white/10 bg-[#0d0f13] px-2 py-1.5 text-[10px] text-slate-300 outline-none"
            >
              <option value="low">Low — cheaper</option>

              <option value="medium">Medium</option>

              <option value="high">High</option>
            </select>
          </label>
        </div>
      )}

      {/* LIVE SERVER CREDIT ESTIMATE */}
      <div className="mt-2 min-h-14.5">
        <CreditEstimate
          operation={
            mode === "generate"
              ? "generateDesign"
              : mode === "modify"
                ? "modifyDesign"
                : "generateImage"
          }
          prompt={prompt}
          design={mode === "modify" ? design : undefined}
          selectedIds={mode === "modify" ? selectedIds : []}
          canvas={
            mode === "generate"
              ? {
                  width: design.canvas.width,
                  height: design.canvas.height,
                }
              : undefined
          }
          size={mode === "image" ? imageSize : undefined}
          quality={mode === "image" ? imageQuality : undefined}
          currentCredits={aiCredits}
          onEstimate={handleEstimate}
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={submit}
        disabled={loading || !hasPrompt || !hasCredits}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <Sparkles size={14} className="animate-pulse" />
        ) : mode === "image" ? (
          <ImageIcon size={14} />
        ) : (
          <WandSparkles size={14} />
        )}

        {loading
          ? "Working…"
          : mode === "generate"
            ? "Generate Design"
            : mode === "modify"
              ? "Modify Design"
              : "Generate Image"}
      </button>

      {/* Keyboard hint */}
      <div className="mt-1 text-center text-[9px] text-slate-600">
        Ctrl/Cmd + Enter to run
      </div>

      {/* Success */}
      {message && (
        <div className="mt-2 rounded-md bg-emerald-500/10 p-2 text-[10px] leading-4 text-emerald-300">
          {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 rounded-md bg-red-500/10 p-2 text-[10px] leading-4 text-red-300">
          {error}
        </div>
      )}

      {/* Purchase modal */}
      {showCreditsModal && (
        <CreditPurchaseModal onClose={() => setShowCreditsModal(false)} />
      )}
    </section>
  );
}

function apiServerOrigin() {
  return API_URL.replace(/\/api$/, "");
}

function applyOperationsLocally(document, operations) {
  const next = clone(document);

  for (const operation of operations) {
    switch (operation.action) {
      case "add":
        next.elements[operation.element.id] = clone(operation.element);

        next.elementOrder.push(operation.element.id);

        break;

      case "update":
        if (next.elements[operation.elementId]) {
          Object.assign(
            next.elements[operation.elementId],
            Object.fromEntries(
              Object.entries(operation.changes || {}).filter(
                ([, value]) => value !== null,
              ),
            ),
          );
        }

        break;

      case "delete":
        delete next.elements[operation.elementId];

        next.elementOrder = next.elementOrder.filter(
          (id) => id !== operation.elementId,
        );

        break;

      case "move":
        if (next.elements[operation.elementId]) {
          next.elements[operation.elementId].x = operation.x;

          next.elements[operation.elementId].y = operation.y;
        }

        break;

      case "duplicate": {
        const source = next.elements[operation.elementId];

        if (source) {
          next.elements[operation.newElementId] = {
            ...clone(source),
            ...(operation.changes || {}),
            id: operation.newElementId,
            x: (source.x || 0) + 24,
            y: (source.y || 0) + 24,
          };

          const index = next.elementOrder.indexOf(operation.elementId);

          next.elementOrder.splice(index + 1, 0, operation.newElementId);
        }

        break;
      }

      case "group": {
        const ids = [...new Set(operation.elementIds || [])];

        const first = next.elementOrder.indexOf(ids[0]);

        next.elements[operation.groupId] = {
          id: operation.groupId,
          type: "group",
          name: operation.name || "Group",
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          children: ids,
        };

        next.elementOrder.splice(Math.max(first, 0), 0, operation.groupId);

        break;
      }

      case "ungroup":
        delete next.elements[operation.groupId];

        next.elementOrder = next.elementOrder.filter(
          (id) => id !== operation.groupId,
        );

        break;

      case "reorder": {
        const order = next.elementOrder.filter(
          (id) => id !== operation.elementId,
        );

        order.splice(
          Math.min(Math.max(operation.toIndex, 0), order.length),
          0,
          operation.elementId,
        );

        next.elementOrder = order;

        break;
      }

      default:
        break;
    }
  }

  return next;
}
