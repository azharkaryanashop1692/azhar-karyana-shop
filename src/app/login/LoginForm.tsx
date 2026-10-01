"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { login, type LoginState } from "./actions";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#1a1a1a] py-3 pl-10 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-muted">Email</span>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            placeholder="you@example.com"
            className={inputClass}
          />
        </span>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-muted">Password</span>
        <span className="relative block">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-white"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger ring-1 ring-danger/30">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-black transition hover:bg-[#00e676] disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
