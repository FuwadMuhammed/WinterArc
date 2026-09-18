"use client";

import { track } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { InstagramIcon, LinkedInIcon } from "@/components/icons";
import { SITE_URL } from "@/lib/constants";

export function ShareModal({
  open,
  onClose,
  heading,
  message,
  shareText,
}: {
  open: boolean;
  onClose: () => void;
  heading: string;
  message: string;
  shareText: string;
}) {
  const [copiedFor, setCopiedFor] = useState<"linkedin" | "instagram" | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${SITE_URL}`);
      return true;
    } catch {
      // Clipboard can fail (permissions, insecure context); the share
      // surface still opens, the caption just won't be pre-copied.
      return false;
    }
  }

  async function shareToLinkedIn() {
    track("share_clicked", { channel: "linkedin", heading });
    const copied = await copyCaption();
    setCopiedFor(copied ? "linkedin" : null);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  async function shareToInstagram() {
    track("share_clicked", { channel: "instagram", heading });
    const copied = await copyCaption();
    setCopiedFor(copied ? "instagram" : null);
    window.open("https://www.instagram.com", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="backdrop-enter fixed inset-0 bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="sheet-enter relative w-full max-w-sm rounded-t-3xl border border-border bg-panel p-6 pb-8 text-center shadow-xl sm:rounded-3xl sm:pb-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-ink-faint transition-check hover:text-ink"
        >
          ✕
        </button>
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />

        <p className="text-3xl" aria-hidden="true">
          🎉
        </p>
        <h2 className="mt-3 text-lg font-semibold text-ink">{heading}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{message}</p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={shareToLinkedIn}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90"
          >
            <LinkedInIcon />
            Share on LinkedIn
          </button>
          <button
            type="button"
            onClick={shareToInstagram}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-page py-3 text-sm font-medium text-ink transition-check hover:border-primary"
          >
            <InstagramIcon />
            Share on Instagram
          </button>

          <p className="mt-1 text-xs text-ink-faint" role="status">
            {copiedFor
              ? "Caption copied, paste it into your post or Story."
              : "We'll copy a caption for you to paste in."}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-1 w-full rounded-full py-2 text-sm font-medium text-ink-faint transition-check hover:text-ink-muted"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
