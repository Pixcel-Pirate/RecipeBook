import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** useState that survives reloads (per key). Falls back to `init` if storage is unavailable or the key changes. */
export function useStored<T>(key: string, init: () => T) {
  const load = () => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : init();
    } catch {
      return init();
    }
  };
  const [state, setState] = useState<{ key: string; value: T }>(() => ({ key, value: load() }));
  const value = state.key === key ? state.value : load();
  const set = (v: T) => {
    setState({ key, value: v });
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* private mode: keep in memory only */
    }
  };
  return [value, set] as const;
}
