"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { getShopNeeds, saveShopNeeds } from "@/app/dashboard/actions";
import { Card, CardHeader, cn } from "../ui";

export default function ShopNeedsSection({
  text,
  setText,
}: {
  /** Kept in the dashboard layout (preloaded on the server) so it survives tab switches. */
  text: string;
  setText: (text: string) => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Reload the saved text from the current user's shop_needs.
  const refresh = async () => {
    setSpinning(true);
    const { text, error } = await getShopNeeds();
    setSpinning(false);
    if (error) setStatus({ ok: false, text: error });
    else {
      setText(text);
      setStatus(null);
    }
  };

  // Enter still adds a new line; afterwards the whole text is saved.
  const onKeyUp = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    setStatus({ ok: true, text: "Saving..." });
    const { error } = await saveShopNeeds(e.currentTarget.value);
    setStatus(error ? { ok: false, text: error } : { ok: true, text: "Saved" });
  };

  return (
    <Card className="flex min-h-[calc(100vh-10rem)] flex-col">
      <CardHeader title="Shop Needs" subtitle="Write down everything the shop needs to restock">
        <button
          type="button"
          onClick={refresh}
          aria-label="Refresh"
          className="ml-auto grid size-9 place-items-center rounded-lg bg-white/5 text-muted ring-1 ring-white/10 transition hover:bg-accent hover:text-black"
        >
          <RefreshCw className={spinning ? "size-4 animate-spin" : "size-4"} />
        </button>
      </CardHeader>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (status?.text === "Saved") setStatus(null);
        }}
        onKeyUp={onKeyUp}
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
