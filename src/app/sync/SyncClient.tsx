"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSyncCode, redeemSyncCode } from "@/lib/actions";
import { toast } from "@/lib/toast";

export function SyncClient() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [pending, startTransition] = useTransition();

  const generate = () => {
    startTransition(async () => {
      const res = await createSyncCode();
      if ("code" in res) {
        setCode(res.code);
        setExpiresAt(res.expiresAt);
        toast("Code ready - expires in 15 min", "success");
      } else {
        toast(`Failed: ${res.error}`, "error");
      }
    });
  };

  const redeem = () => {
    startTransition(async () => {
      const res = await redeemSyncCode({ code: inputCode.trim() });
      if (res.ok) {
        toast("Devices paired. Reloading…", "success");
        setTimeout(() => router.refresh(), 800);
      } else {
        toast(`Failed: ${res.error}`, "error");
      }
    });
  };

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-sans text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          1. On your existing device
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Generate a code, then enter it on the new device.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={pending}
          className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-50"
        >
          Generate code
        </button>
        {code && (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950">
            <div className="font-mono text-3xl font-bold tracking-widest text-rose-900 dark:text-rose-100">
              {code}
            </div>
            {expiresAt && (
              <div className="mt-2 text-xs text-rose-700 dark:text-rose-300">
                expires {expiresAt.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-sans text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          2. On the new device
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Enter the code to adopt the other device&apos;s progress.
        </p>
        <input
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder="ABCD-EFGH"
          className="mt-4 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 font-mono text-lg tracking-widest text-zinc-900 outline-none focus:border-rose-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={redeem}
          disabled={pending || inputCode.length < 8}
          className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Pair device
        </button>
      </section>
    </div>
  );
}
