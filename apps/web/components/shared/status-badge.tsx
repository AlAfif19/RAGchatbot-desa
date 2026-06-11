import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-stone-200 bg-stone-50 text-stone-700",
  connected: "border-teal-200 bg-teal-50 text-teal-700",
  disconnected: "border-rose-200 bg-rose-50 text-rose-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-sky-200 bg-sky-50 text-sky-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  faq: "border-teal-200 bg-teal-50 text-teal-700",
  rag: "border-indigo-200 bg-indigo-50 text-indigo-700",
  fallback: "border-amber-200 bg-amber-50 text-amber-700",
  system: "border-stone-200 bg-stone-50 text-stone-700",
  issue: "border-red-200 bg-red-50 text-red-700",
  normal: "border-stone-200 bg-stone-50 text-stone-700"
};

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 max-w-full items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        variants[value] ?? variants.normal
      )}
    >
      <span className="truncate">{label ?? value.replace("-", " ")}</span>
    </span>
  );
}
