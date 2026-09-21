import fs from 'fs';
import path from 'path';

/**
 * Tiny durable key/value store used for per-user data (settings, alerts,
 * notifications, support tickets). Writes are debounced and atomic
 * (write temp file, then rename) so a crash cannot leave a half-written file.
 * Swap for a database table when horizontal scaling is needed.
 */
const DATA_DIR = process.env.AERONEX_DATA_DIR || path.resolve(__dirname, '../../data');

export class JsonStore<T> {
  private data: Record<string, T> = {};
  private file: string;
  private timer: NodeJS.Timeout | null = null;

  constructor(name: string) {
    this.file = path.join(DATA_DIR, `${name}.json`);
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      if (fs.existsSync(this.file)) {
        this.data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      }
    } catch (err) {
      console.error(`[JsonStore:${name}] Could not load existing data, starting empty:`, err);
      this.data = {};
    }
  }

  get(key: string): T | undefined {
    return this.data[key];
  }

  set(key: string, value: T): void {
    this.data[key] = value;
    this.schedulePersist();
  }

  delete(key: string): void {
    delete this.data[key];
    this.schedulePersist();
  }

  entries(): [string, T][] {
    return Object.entries(this.data);
  }

  private schedulePersist() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flush();
    }, 250);
  }

  flush() {
    try {
      const tmp = `${this.file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.data));
      fs.renameSync(tmp, this.file);
    } catch (err) {
      console.error('[JsonStore] Persist failed:', err);
    }
  }
}
