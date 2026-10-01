import { Bell, LogOut, Menu } from "lucide-react";
import { logout } from "@/app/login/actions";

export default function Header({
  title,
  userEmail,
  onMenuClick,
}: {
  title: string;
  userEmail: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 px-4 pt-3 sm:px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#1c1c1c]/85 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur-md">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/10 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-white sm:text-xl">
            Welcome back, Rana G
          </h1>
          <p className="truncate text-xs text-muted sm:text-sm">{title}</p>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-lg text-muted hover:bg-white/10 hover:text-white"
          >
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-accent" />
          </button>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 py-1.5 pl-1.5 pr-3 ring-1 ring-white/10">
            <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-emerald-700 text-sm font-bold text-black">
              AU
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="max-w-40 truncate text-xs text-muted">{userEmail}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Log out"
              title="Log out"
              className="grid size-9 place-items-center rounded-lg text-muted hover:bg-danger/15 hover:text-danger"
            >
              <LogOut className="size-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
