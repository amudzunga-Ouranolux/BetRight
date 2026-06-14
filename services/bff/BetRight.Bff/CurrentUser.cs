namespace BetRight.Bff;

/// <summary>
/// Resolves the acting user. For now it reads the <c>X-User-Id</c> header and
/// defaults to the seeded <c>dev-user</c> — this is the seam that real JWT auth
/// will replace (validate token → set user id) without changing call sites.
/// </summary>
public static class CurrentUser
{
    public const string DevUser = "dev-user";

    public static string Id(HttpContext ctx)
    {
        var header = ctx.Request.Headers["X-User-Id"].FirstOrDefault();
        return string.IsNullOrWhiteSpace(header) ? DevUser : header!;
    }
}
