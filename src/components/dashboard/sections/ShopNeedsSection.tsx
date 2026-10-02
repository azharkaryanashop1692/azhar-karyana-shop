"use client";

import { useRef, useState } from "react";
import { Check, RotateCw, SquarePen } from "lucide-react";
import { shopNeedsText } from "../mockData";
import { cn } from "../ui";

export default function ShopNeedsSection() {
  const [text, setText] = useState(shopNeedsText);
  const [editing, setEditing] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const refresh = () => {
    setSpinning(true);
    setText(shopNeedsText);
    setTimeout(() => setSpinning(false), 600);
  };

  const toggleEdit = () => {
    const next = !editing;
    setEditing(next);
    if (next) setTimeout(() => textareaRef.current?.focus(), 0);
  };

  return (
    <div className="relative h-[calc(100vh-10rem)] min-h-[400px]">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        readOnly={!editing}
        placeholder="Type here..."
        className={cn(
          "size-full resize-none rounded-lg border-2 border-white/80 bg-[#72757a] p-4 pr-14 pb-20 text-base leading-relaxed text-white placeholder:text-white/60 focus:outline-none",
          editing ? "focus:border-accent" : "cursor-default",
        )}
      />
      <button
        type="button"
        onClick={refresh}
        aria-label="Refresh"
        className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <RotateCw className={spinning ? "size-5 animate-spin" : "size-5"} />
      </button>
      <button
        type="button"
        onClick={toggleEdit}
        className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl bg-[#3a3a3a] px-6 py-3 text-lg font-semibold text-white shadow-lg ring-1 ring-white/10 transition hover:bg-[#4a4a4a]"
      >
        {editing ? <Check className="size-5" /> : <SquarePen className="size-5" />}
        {editing ? "Done" : "Edit"}
      </button>
    </div>
  );
}
