/**
 * Runtime cache of generated image data URLs keyed by history item id.
 * Survives mediaStorage stripping `image` off carousel items so the node
 * can still flip through Count>1 results without a disk round-trip.
 */
const cache = new Map<string, string>();
const MAX_ENTRIES = 80;

export function cacheGeneratedImage(id: string, image: string): void {
  if (!id || !image) return;
  if (cache.has(id)) cache.delete(id);
  cache.set(id, image);
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    cache.delete(oldest);
  }
}

export function getCachedGeneratedImage(id: string): string | undefined {
  return cache.get(id);
}

export function renameCachedGeneratedImage(oldId: string, newId: string): void {
  if (!oldId || !newId || oldId === newId) return;
  const image = cache.get(oldId);
  if (!image) return;
  cache.delete(oldId);
  cacheGeneratedImage(newId, image);
}

export function clearGeneratedImageCache(): void {
  cache.clear();
}
