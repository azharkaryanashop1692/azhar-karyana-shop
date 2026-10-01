"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { shopNeedsText } from "../mockData";
import { Card, CardHeader } from "../ui";

export default function ShopNeedsSection() {
  const [text, setText] = useState(shopNeedsText);
  const [spinning, setSpinning] = useState(false);

  const refresh = () => {
    setSpinning(true);
    setText(shopNeedsText);
    setTimeout(() => setSpinning(false), 600);
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
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
        className="min-h-[400px] w-full flex-1 resize-none rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-sm leading-relaxed text-zinc-200 placeholder:text-muted focus:border-accent/60 focus:outline-none"
      />
      <p className="mt-3 text-right text-xs text-muted">{text.length} characters</p>
    </Card>
  );
}
