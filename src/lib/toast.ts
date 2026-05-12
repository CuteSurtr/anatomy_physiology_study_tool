type Listener = (toasts: Toast[]) => void;

export type ToastKind = "info" | "success" | "error";

export type Toast = {
  id: string;
  kind: ToastKind;
  text: string;
  expiresAt: number;
};

const listeners = new Set<Listener>();
let toasts: Toast[] = [];
const DEFAULT_TTL = 2200;

function emit() {
  for (const l of listeners) l(toasts);
}

export function subscribeToasts(fn: Listener): () => void {
  listeners.add(fn);
  fn(toasts);
  return () => {
    listeners.delete(fn);
  };
}

export function toast(text: string, kind: ToastKind = "info", ttl = DEFAULT_TTL) {
  if (typeof window === "undefined") return;
  const id = crypto.randomUUID();
  const expiresAt = Date.now() + ttl;
  toasts = [...toasts, { id, kind, text, expiresAt }];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, ttl);
}
