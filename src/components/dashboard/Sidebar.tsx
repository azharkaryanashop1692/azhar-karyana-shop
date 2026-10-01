import { ShoppingCart, X } from "lucide-react";
import { NAV_ITEMS, type TabId } from "./navigation";
import { cn } from "./ui";

export default function Sidebar({
  active,
  onSelect,
  open,
  onClose,
}: {
  active: TabId;
  onSelect: (id: TabId) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col p-3 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-gradient-to-b from-[#2b2b2b] to-[#171717] p-4 shadow-2xl shadow-black/50">
          <div className="mb-8 flex items-center gap-3 px-1 pt-1">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-black">
              <ShoppingCart className="size-5" />
            </div>
            <span className="text-base font-bold leading-tight text-white">
              Azhar Karyana Shop
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="ml-auto grid size-8 place-items-center rounded-lg text-muted hover:bg-white/10 lg:hidden"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = id === active;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                    isActive
                      ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                      : "text-muted hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>

          <p className="mt-auto px-1 text-xs text-muted/70">© 2026 Azhar Karyana Shop</p>
        </div>
      </aside>
    </>
  );
}
