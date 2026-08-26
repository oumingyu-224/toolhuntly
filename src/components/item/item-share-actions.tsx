"use client";

import { useState } from "react";
import { Copy, Share2, Twitter } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface ItemShareActionsProps {
  itemLink: string;
}

export default function ItemShareActions({ itemLink }: ItemShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(itemLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("textarea");
      input.value = itemLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const twitterHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(itemLink)}`;

  return (
    <div className="rounded-lg border">
      <div className="flex">
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm transition-colors hover:bg-muted/50"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <div className="flex flex-1 items-center justify-center gap-2 border-l py-3 text-sm">
          <span className="text-xs text-muted-foreground">Share</span>
          <div className="flex items-center gap-1">
            <Link
              href={twitterHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1 hover:bg-muted"
            >
              <Twitter className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded p-1 hover:bg-muted"
              title="Copy link"
            >
              <Share2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
