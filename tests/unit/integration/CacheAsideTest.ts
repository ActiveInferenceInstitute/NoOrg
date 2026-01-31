import { CacheAsidePattern } from '../../../src/core/integration/patterns/CacheAside';

describe('CacheAside Pattern', () => {
  let cache: CacheAsidePattern;

  beforeEach(() => {
    cache = new CacheAsidePattern({
      ttl: 500, // 500ms TTL for fast test expiry
      maxSize: 5
    });
  });

  afterEach(async () => {
    await cache.clear();
  });

  test('should call fetch function on cache miss', async () => {
    const fetchFn = jest.fn().mockResolvedValue('fetched-value');

    const result = await cache.get('key1', fetchFn);

    expect(result).toBe('fetched-value');
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  test('should return cached value on cache hit without calling fetch', async () => {
    const fetchFn = jest.fn().mockResolvedValue('fetched-value');

    // First call - cache miss
    await cache.get('key1', fetchFn);

    // Second call - cache hit
    const result = await cache.get('key1', fetchFn);

    expect(result).toBe('fetched-value');
    expect(fetchFn).toHaveBeenCalledTimes(1); // Only called once
  });

  test('should fetch again after cache entry expires', async () => {
    const shortTtlCache = new CacheAsidePattern({
      ttl: 50 // 50ms TTL
    });

    const fetchFn = jest.fn()
      .mockResolvedValueOnce('first-value')
      .mockResolvedValueOnce('second-value');

    // First call - cache miss
    const result1 = await shortTtlCache.get('key1', fetchFn);
    expect(result1).toBe('first-value');

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 100));

    // Second call - cache expired, should fetch again
    const result2 = await shortTtlCache.get('key1', fetchFn);
    expect(result2).toBe('second-value');
    expect(fetchFn).toHaveBeenCalledTimes(2);

    await shortTtlCache.clear();
  });

  test('should invalidate a specific cache entry', async () => {
    const fetchFn = jest.fn()
      .mockResolvedValueOnce('original')
      .mockResolvedValueOnce('refreshed');

    // Populate cache
    await cache.get('key1', fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // Invalidate the entry
    await cache.invalidate('key1');

    // Next access should trigger a new fetch
    const result = await cache.get('key1', fetchFn);
    expect(result).toBe('refreshed');
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  test('should call onEvict callback when invalidating', async () => {
    const onEvict = jest.fn();
    const cacheWithEvict = new CacheAsidePattern({
      ttl: 5000,
      onEvict
    });

    const fetchFn = jest.fn().mockResolvedValue('evictable-value');
    await cacheWithEvict.get('key1', fetchFn);

    await cacheWithEvict.invalidate('key1');

    expect(onEvict).toHaveBeenCalledWith('key1', 'evictable-value');

    await cacheWithEvict.clear();
  });

  test('should propagate errors when fetch function fails', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('fetch failed'));

    await expect(cache.get('key1', fetchFn)).rejects.toThrow('fetch failed');
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  test('should not cache failed fetch results', async () => {
    const fetchFn = jest.fn()
      .mockRejectedValueOnce(new Error('transient error'))
      .mockResolvedValueOnce('recovered-value');

    // First call fails
    await expect(cache.get('key1', fetchFn)).rejects.toThrow('transient error');

    // Second call should retry fetch (not return cached error)
    const result = await cache.get('key1', fetchFn);
    expect(result).toBe('recovered-value');
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  test('should evict LRU entries when maxSize is exceeded', async () => {
    const fetchFn = jest.fn().mockImplementation(async () => 'value');

    // Fill cache to maxSize (5)
    for (let i = 0; i < 5; i++) {
      await cache.get(`key${i}`, fetchFn);
    }

    const statsBeforeEviction = cache.getStats();
    expect(statsBeforeEviction.size).toBe(5);

    // Adding one more should evict the oldest
    await cache.get('key5', fetchFn);

    const statsAfterEviction = cache.getStats();
    expect(statsAfterEviction.size).toBe(5); // Still at maxSize
  });

  test('should set values directly via set method', async () => {
    await cache.set('direct-key', 'direct-value');

    const fetchFn = jest.fn().mockResolvedValue('should-not-be-called');
    const result = await cache.get('direct-key', fetchFn);

    expect(result).toBe('direct-value');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  test('should clear all entries', async () => {
    const fetchFn = jest.fn().mockResolvedValue('value');

    await cache.get('key1', fetchFn);
    await cache.get('key2', fetchFn);
    await cache.get('key3', fetchFn);

    expect(cache.getStats().size).toBe(3);

    await cache.clear();

    expect(cache.getStats().size).toBe(0);
  });

  test('should call onEvict for all entries when clearing', async () => {
    const onEvict = jest.fn();
    const cacheWithEvict = new CacheAsidePattern({
      ttl: 5000,
      onEvict
    });

    const fetchFn = jest.fn().mockResolvedValue('value');
    await cacheWithEvict.get('key1', fetchFn);
    await cacheWithEvict.get('key2', fetchFn);

    await cacheWithEvict.clear();

    expect(onEvict).toHaveBeenCalledTimes(2);
    expect(onEvict).toHaveBeenCalledWith('key1', 'value');
    expect(onEvict).toHaveBeenCalledWith('key2', 'value');
  });

  test('should invalidate entries matching a pattern', async () => {
    const fetchFn = jest.fn().mockResolvedValue('value');

    await cache.get('user:1', fetchFn);
    await cache.get('user:2', fetchFn);
    await cache.get('order:1', fetchFn);

    expect(cache.getStats().size).toBe(3);

    await cache.invalidatePattern(/^user:/);

    expect(cache.getStats().size).toBe(1);

    // user keys should require re-fetch
    const refetchFn = jest.fn().mockResolvedValue('refetched');
    await cache.get('user:1', refetchFn);
    expect(refetchFn).toHaveBeenCalledTimes(1);

    // order key should still be cached
    const orderFetchFn = jest.fn().mockResolvedValue('should-not-call');
    const orderResult = await cache.get('order:1', orderFetchFn);
    expect(orderResult).toBe('value');
    expect(orderFetchFn).not.toHaveBeenCalled();
  });

  test('should track hit rate statistics', async () => {
    const fetchFn = jest.fn().mockResolvedValue('value');

    // 1 miss
    await cache.get('key1', fetchFn);

    // 2 hits
    await cache.get('key1', fetchFn);
    await cache.get('key1', fetchFn);

    const stats = cache.getStats();
    // hitRate = (totalHits / totalAccesses) * 100
    // hits=2, accesses = 2 + 1(initial miss) = 3
    // hitRate = (2/3) * 100 = 66.67%
    expect(stats.hitRate).toBeCloseTo(66.67, 0);
    expect(stats.size).toBe(1);
    expect(stats.maxSize).toBe(5);
  });

  test('should warm up cache with initial data', async () => {
    const entries = new Map<string, string>([
      ['warm1', 'value1'],
      ['warm2', 'value2'],
      ['warm3', 'value3']
    ]);

    await cache.warmUp(entries);

    expect(cache.getStats().size).toBe(3);

    // All keys should be cache hits
    const fetchFn = jest.fn().mockResolvedValue('should-not-call');
    const result1 = await cache.get('warm1', fetchFn);
    const result2 = await cache.get('warm2', fetchFn);
    const result3 = await cache.get('warm3', fetchFn);

    expect(result1).toBe('value1');
    expect(result2).toBe('value2');
    expect(result3).toBe('value3');
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
