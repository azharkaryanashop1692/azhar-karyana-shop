import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login — Azhar Karyana Shop",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#1f2a22_0%,_#0d0d0d_60%)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent text-black shadow-lg shadow-accent/20">
            <ShoppingCart className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Azhar Karyana Shop</h1>
          <p className="mt-1 text-sm text-muted">Sign in to access the dashboard</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#2b2b2b] to-[#1f1f1f] p-6 shadow-2xl shadow-black/40">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted/70">
          Access is restricted to authorized shop staff.
        </p>
      </div>
    </main>
  );
}
