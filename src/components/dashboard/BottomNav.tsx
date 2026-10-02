import { NAV_ITEMS, type TabId } from "./navigation";
import { cn } from "./ui";

/** Phone/tablet tab bar fixed to the bottom of the screen (the sidebar takes over from lg up). */
export default function BottomNav({
  active,
  onSelect,
}: {
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="mx-auto flex max-w-xl items-stretch rounded-2xl border border-white/10 bg-[#1c1c1c]/95 p-1 shadow-2xl shadow-black/60 backdrop-blur-md">
        {NAV_ITEMS.map(({ id, short, icon: Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-0.5 py-2 transition",
                isActive ? "bg-accent/15 text-accent" : "text-muted hover:text-white",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="w-full truncate text-center text-[10px] font-medium leading-none tracking-tight max-[360px]:text-[9px] sm:text-xs">
                {short}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
