"use client";

import { hostnameOf } from "@/lib/format";

function isHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function SitePreview({ url, name }: { url: string; name: string }) {
  const trimmed = url.trim();
  if (!isHttpUrl(trimmed)) return null;

  const host = hostnameOf(trimmed);
  const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={favicon}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-md bg-neutral-800 object-contain p-0.5"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-100">{host}</p>
        <p className="truncate text-xs text-neutral-500">
          {name.trim() || "New entry — jump onto the board"}
        </p>
      </div>
      <span className="ml-auto shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
        ✓ ready
      </span>
    </div>
  );
}