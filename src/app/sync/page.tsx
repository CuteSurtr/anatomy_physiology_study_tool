import { SyncClient } from "./SyncClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sync devices" };

export default function SyncPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-400">
        Sync
      </div>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Pair another device
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Anonymous device-pairing - no email, no login. Generate a code on one device, enter
        it on the other. The second device adopts the first device&apos;s progress.
      </p>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
        Codes expire in 15 minutes and can only be used once.
      </p>
      <SyncClient />
    </main>
  );
}
