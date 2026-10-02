import type { ComponentType, ReactNode } from "react";
import { ChevronDown, Pencil, Plus, Search, Trash2 } from "lucide-react";

type IconType = ComponentType<{ className?: string }>;

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/5 bg-gradient-to-br from-[#2b2b2b] to-[#1f1f1f] p-5 shadow-lg shadow-black/30",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  onViewAll,
  children,
}: {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-medium text-accent hover:underline"
        >
          View All
        </button>
      )}
    </div>
  );
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  tone = "accent",
}: {
  icon: IconType;
  label: string;
  value: string;
  tone?: "accent" | "danger" | "neutral";
}) {
  const toneClass = {
    accent: "bg-accent/15 text-accent",
    danger: "bg-danger/15 text-danger",
    neutral: "bg-white/10 text-white",
  }[tone];
  return (
    <Card className="flex items-center gap-4">
      <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl", toneClass)}>
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </Card>
  );
}

type BadgeTone = "green" | "red" | "amber" | "neutral";

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  const toneClass = {
    green: "bg-accent/15 text-accent ring-accent/30",
    red: "bg-danger/15 text-danger ring-danger/30",
    amber: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
    neutral: "bg-white/10 text-muted ring-white/10",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Type here...",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block min-w-0 flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-muted focus:border-accent/60 focus:outline-none"
      />
    </label>
  );
}

export function StatusSelect({
  value,
  onChange,
  options,
  placeholder = "Select Status",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <label className="relative block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-white/10 bg-[#1a1a1a] py-2.5 pl-3 pr-9 text-sm text-white focus:border-accent/60 focus:outline-none sm:w-44"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  icon: Icon = Plus,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: IconType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#00e676]"
    >
      <Icon className="size-4" />
      {children}
    </button>
  );
}

export function EditDeleteActions({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit"
        className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-white"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete"
        className="grid size-8 place-items-center rounded-lg text-danger transition hover:bg-danger/15"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted">
      {children}
    </div>
  );
}

let audioCtx: AudioContext | null = null;

/** Short alert beep, played on button clicks such as Save / Update / Delete. */
export function playBeep(frequency = 880, durationMs = 150) {
  try {
    audioCtx ??= new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    const t = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durationMs / 1000);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + durationMs / 1000);
  } catch {
    // Audio not available (e.g. blocked by the browser); the action still works.
  }
}

export function formatRs(n: number) {
  return `RS ${n.toLocaleString("en-US")}`;
}

/** Case-insensitive match of `query` against any of the given fields. */
export function matches(query: string, ...fields: string[]) {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => f.toLowerCase().includes(q));
}
