using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace BetRight.Bff.Caching;

/// <summary>
/// Thin cache-aside helper over IDistributedCache (Redis in prod, in-memory in
/// dev). Returns whether the value was a cache hit so endpoints can report
/// <c>meta.cache_status</c> accurately.
/// </summary>
public class ResponseCache(IDistributedCache cache)
{
    private static readonly JsonSerializerOptions Json = new();

    public async Task<(T Value, bool Hit)> GetOrSet<T>(string key, TimeSpan ttl, Func<Task<T>> factory)
    {
        var cached = await cache.GetStringAsync(key);
        if (cached is not null)
        {
            var hitValue = JsonSerializer.Deserialize<T>(cached, Json);
            if (hitValue is not null) return (hitValue, true);
        }

        var value = await factory();
        await cache.SetStringAsync(
            key,
            JsonSerializer.Serialize(value, Json),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl });
        return (value, false);
    }
}
