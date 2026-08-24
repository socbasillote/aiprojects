import { Loader2 } from "lucide-react";

const EmptyState = ({ title, description, action, actionLabel, loading }) => {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <h2 className="font-semibold">{title}</h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
        {description}
      </p>

      {action && (
        <button
          onClick={action}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}

          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
