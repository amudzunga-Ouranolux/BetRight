using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BetRight.Bff;

/// <summary>
/// Resolves the acting user. Prefers the JWT <c>sub</c> claim (real auth). When no
/// token is present it falls back to the <c>X-User-Id</c> header / seeded
/// <c>dev-user</c> — but only while <c>Auth:AllowDevUser</c> is true (dev/mock).
/// In production set that flag false and a valid token is required.
/// </summary>
public static class CurrentUser
{
    public const string DevUser = "dev-user";

    public static string Id(HttpContext ctx)
    {
        var sub = ctx.User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? ctx.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(sub)) return sub;

        var cfg = ctx.RequestServices.GetRequiredService<IConfiguration>();
        if (cfg.GetValue("Auth:AllowDevUser", true))
        {
            var header = ctx.Request.Headers["X-User-Id"].FirstOrDefault();
            return string.IsNullOrWhiteSpace(header) ? DevUser : header!;
        }
        throw new UnauthorizedAccessException();
    }
}
