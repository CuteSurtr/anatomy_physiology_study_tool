"use client";

import { useEffect, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function LightboxImage({ src, alt, className }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={className}
        onClick={() => setOpen(true)}
        style={{ cursor: "zoom-in" }}
      />
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
          >
            Close · esc
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: "zoom-out" }}
            className="max-h-[92vh] max-w-[92vw] object-contain"
          />
        </div>
      )}
    </>
  );
}
