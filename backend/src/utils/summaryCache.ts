interface CacheEntry {
  summary: string;
  generatedAt: Date;
  expiresAt: Date;
}

class SummaryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate cache key from search parameters
   */
  private generateKey(city?: string, country?: string, query?: string): string {
    const parts = [];
    if (city) parts.push(`city:${city.toLowerCase()}`);
    if (country) parts.push(`country:${country.toLowerCase()}`);
    if (query) parts.push(`query:${query.toLowerCase().slice(0, 50)}`);
    
    return parts.join('|') || 'all';
  }

  /**
   * Get cached summary if it exists and hasn't expired
   */
  get(city?: string, country?: string, query?: string): string | null {
    const key = this.generateKey(city, country, query);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.summary;
  }

  /**
   * Store summary in cache
   */
  set(summary: string, city?: string, country?: string, query?: string): void {
    const key = this.generateKey(city, country, query);
    const now = new Date();
    
    this.cache.set(key, {
      summary,
      generatedAt: now,
      expiresAt: new Date(now.getTime() + this.ttlMs),
    });

    console.log(`[SummaryCache] Cached summary for key: ${key}`);
  }

  /**
   * Clear cache for specific search or all if not specified
   */
  clear(city?: string, country?: string, query?: string): void {
    if (!city && !country && !query) {
      // Clear all cache
      const size = this.cache.size;
      this.cache.clear();
      console.log(`[SummaryCache] Cleared all ${size} cache entries`);
    } else {
      const key = this.generateKey(city, country, query);
      this.cache.delete(key);
      console.log(`[SummaryCache] Cleared cache for key: ${key}`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: Array<{ key: string; expiresAt: Date }> } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expiresAt: entry.expiresAt,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  /**
   * Set custom TTL (in milliseconds)
   */
  setTTL(ms: number): void {
    this.ttlMs = ms;
    console.log(`[SummaryCache] TTL set to ${ms}ms (${(ms / 1000 / 60 / 60).toFixed(1)} hours)`);
  }
}

export default new SummaryCache();
