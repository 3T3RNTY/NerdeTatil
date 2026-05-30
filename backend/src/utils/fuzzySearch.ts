export async function createFuzzyMatcher<T>(
  items: T[],
  keys: string[],
  threshold: number = 0.4
): Promise<(searchTerm: string) => T[]> {
  const Fuse = (await import('fuse.js')).default;
  const fuse = new Fuse(items, {
    keys,
    threshold, // 0 = exact match, 1 = match anything
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  return (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return items;
    }
    return fuse.search(searchTerm).map((result) => result.item);
  };
}

export async function fuzzyMatch(
  items: string[],
  searchTerm: string,
  threshold: number = 0.4
): Promise<string[]> {
  const Fuse = (await import('fuse.js')).default;
  const fuse = new Fuse(items, {
    threshold,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  if (!searchTerm || searchTerm.trim().length === 0) {
    return items;
  }

  return fuse.search(searchTerm).map((result) => result.item);
}
