class AiCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttlMinutes) {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    this.cache.set(key, {
      data: value,
      expiresAt,
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

const globalAiCache = new AiCache();
module.exports = globalAiCache;
