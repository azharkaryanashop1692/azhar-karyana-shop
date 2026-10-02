"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { saveShopNeeds } from "@/app/dashboard/actions";
import { Card, CardHeader, cn } from "../ui";

export default function ShopNeedsSection({
  text,
  setText,
}: {
  /** Kept in the dashboard layout (preloaded on the server) so it survives tab switches. */
  text: string;
  setText: (text: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Save the whole text into the current user's shop_needs.
  const save = async () => {
    setSaving(true);
    setStatus(null);
    const { error } = await saveShopNeeds(text);
    setSaving(false);
    setStatus(error ? { ok: false, text: error } : { ok: true, text: "Saved" });
  };

  return (
    <Card className="flex min-h-[calc(100vh-10rem)] flex-col">
      <CardHeader title="Shop Needs" subtitle="Write down everything the shop needs to restock">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#00e676] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="size-4" />
          {saving ? "Saving..." : "Save"}
        </button>
      </CardHeader>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (status?.text === "Saved") setStatus(null);
        }}
        placeholder="Type here..."
        className="min-h-[400px] w-full flex-1 resize-none rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-sm leading-relaxed text-zinc-200 placeholder:text-muted focus:border-accent/60 focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className={cn(status && !status.ok ? "text-danger" : "text-accent")}>{status?.text}</span>
        <span className="text-muted">{text.length} characters</span>
      </div>
    </Card>
  );
}
