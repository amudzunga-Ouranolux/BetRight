using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace BetRight.Bff.Auth;

/// <summary>Issues short-lived JWT access tokens and opaque refresh tokens.</summary>
public class JwtService(IConfiguration cfg)
{
    public string Secret => cfg["Jwt:Secret"] ?? "dev-insecure-secret-change-me-please-0123456789";
    public string Issuer => cfg["Jwt:Issuer"] ?? "betright";
    public int AccessMinutes => cfg.GetValue("Jwt:AccessMinutes", 30);
    public int RefreshDays => cfg.GetValue("Jwt:RefreshDays", 30);

    public (string Token, DateTime ExpiresAt) CreateAccessToken(string userId, string? email)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(AccessMinutes);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.Email, email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
        };
        var jwt = new JwtSecurityToken(Issuer, Issuer, claims, expires: expires, signingCredentials: creds);
        return (new JwtSecurityTokenHandler().WriteToken(jwt), expires);
    }

    public static string NewRefreshToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

    /// <summary>Refresh tokens are stored hashed (never in plaintext).</summary>
    public static string HashRefresh(string token)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
