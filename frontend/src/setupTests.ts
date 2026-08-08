import '@testing-library/jest-dom/vitest';

// Node's own experimental global `localStorage` (behind --localstorage-file,
// present since Node 22.4) collides with jsdom's in the jsdom test
// environment: jsdom detects a `localStorage` already on globalThis and
// skips installing its own working implementation, leaving both
// window.localStorage and the bare global undefined. A minimal in-memory
// polyfill sidesteps the collision entirely rather than depending on a Node
// version/flag (--no-experimental-webstorage isn't guaranteed across every
// Node version this runs on, and an unrecognized flag would crash the
// process outright).
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number) { return [...this.store.keys()][index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

for (const target of [globalThis, window] as const) {
  Object.defineProperty(target, 'localStorage', {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
}
