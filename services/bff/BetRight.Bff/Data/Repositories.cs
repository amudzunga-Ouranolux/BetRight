using Dapper;

namespace BetRight.Bff.Data;

// Row shapes (Dapper maps snake_case columns via MatchNamesWithUnderscores).
public record UserRow(string UserId, string? Email, string DisplayName);

public record UserAuthRow(string UserId, string? Email, string DisplayName, string? PasswordHash);

public record UserPreferencesRow(
    string OddsFormat, string KitId, string TextSize,
    bool NotifyPredictions, bool NotifyResults, bool NotifyNews);

public record FavouriteRow(string Kind, string RefId);

public record SavedRow(string Id, string FixtureId, string SnapshotJson, DateTime CreatedAt);

public record NotificationRow(
    string Id, string Kind, string Title, string Body,
    string? FixtureId, bool Read, DateTime CreatedAt);

public class UserRepo(Db db)
{
    public async Task<UserRow?> GetUser(string userId)
    {
        using var c = db.Open();
        return await c.QuerySingleOrDefaultAsync<UserRow>(
            "select user_id, email, display_name from users where user_id = @userId", new { userId });
    }

    public async Task<UserAuthRow?> GetAuthByEmail(string email)
    {
        using var c = db.Open();
        return await c.QuerySingleOrDefaultAsync<UserAuthRow>(
            "select user_id, email, display_name, password_hash from users where lower(email) = lower(@email)",
            new { email });
    }

    public async Task CreateUser(string userId, string email, string displayName, string passwordHash)
    {
        using var c = db.Open();
        await c.ExecuteAsync(
            @"insert into users (user_id, email, display_name, password_hash, created_at)
              values (@userId, @email, @displayName, @passwordHash, now())",
            new { userId, email, displayName, passwordHash });
    }

    public async Task DeleteUser(string userId)
    {
        using var c = db.Open();
        // Children first (no ON DELETE CASCADE in the baseline schema).
        await c.ExecuteAsync(
            @"delete from refresh_tokens where user_id=@userId;
              delete from saved_predictions where user_id=@userId;
              delete from notifications where user_id=@userId;
              delete from user_favourites where user_id=@userId;
              delete from user_preferences where user_id=@userId;
              delete from audit_logs where user_id=@userId;
              delete from users where user_id=@userId;",
            new { userId });
    }

    public async Task<UserPreferencesRow?> GetPreferences(string userId)
    {
        using var c = db.Open();
        return await c.QuerySingleOrDefaultAsync<UserPreferencesRow>(
            @"select odds_format, kit_id, text_size, notify_predictions, notify_results, notify_news
              from user_preferences where user_id = @userId", new { userId });
    }

    public async Task UpsertPreferences(string userId, UserPreferencesRow p)
    {
        using var c = db.Open();
        await c.ExecuteAsync(
            @"insert into user_preferences
                (user_id, odds_format, kit_id, text_size, notify_predictions, notify_results, notify_news, updated_at)
              values (@userId, @OddsFormat, @KitId, @TextSize, @NotifyPredictions, @NotifyResults, @NotifyNews, now())
              on conflict (user_id) do update set
                odds_format = excluded.odds_format, kit_id = excluded.kit_id, text_size = excluded.text_size,
                notify_predictions = excluded.notify_predictions, notify_results = excluded.notify_results,
                notify_news = excluded.notify_news, updated_at = now()",
            new { userId, p.OddsFormat, p.KitId, p.TextSize, p.NotifyPredictions, p.NotifyResults, p.NotifyNews });
    }
}

public class FavouritesRepo(Db db)
{
    public async Task<List<FavouriteRow>> ForUser(string userId)
    {
        using var c = db.Open();
        var rows = await c.QueryAsync<FavouriteRow>(
            "select kind, ref_id from user_favourites where user_id = @userId", new { userId });
        return rows.ToList();
    }

    /// <summary>Replace the user's favourites with the given team + league ids.</summary>
    public async Task Replace(string userId, IEnumerable<string> teams, IEnumerable<string> leagues)
    {
        using var c = db.Open();
        using var tx = c.BeginTransaction();
        await c.ExecuteAsync("delete from user_favourites where user_id = @userId", new { userId }, tx);
        foreach (var t in teams.Distinct())
            await c.ExecuteAsync(
                "insert into user_favourites (user_id, kind, ref_id, created_at) values (@userId,'team',@t,now())",
                new { userId, t }, tx);
        foreach (var l in leagues.Distinct())
            await c.ExecuteAsync(
                "insert into user_favourites (user_id, kind, ref_id, created_at) values (@userId,'league',@l,now())",
                new { userId, l }, tx);
        tx.Commit();
    }
}

public class SavedPredictionsRepo(Db db)
{
    public async Task<List<SavedRow>> ListForUser(string userId)
    {
        using var c = db.Open();
        var rows = await c.QueryAsync<SavedRow>(
            @"select id, fixture_id, snapshot_json::text as snapshot_json, created_at
              from saved_predictions where user_id = @userId order by created_at desc", new { userId });
        return rows.ToList();
    }

    public async Task Insert(string id, string userId, string fixtureId, string snapshotJson)
    {
        using var c = db.Open();
        await c.ExecuteAsync(
            @"insert into saved_predictions (id, user_id, fixture_id, snapshot_json, created_at)
              values (@id, @userId, @fixtureId, @snapshotJson::jsonb, now())",
            new { id, userId, fixtureId, snapshotJson });
    }

    public async Task<int> Delete(string id, string userId)
    {
        using var c = db.Open();
        return await c.ExecuteAsync(
            "delete from saved_predictions where id = @id and user_id = @userId", new { id, userId });
    }

    public async Task<int> CountForUser(string userId)
    {
        using var c = db.Open();
        return await c.ExecuteScalarAsync<int>(
            "select count(*) from saved_predictions where user_id = @userId", new { userId });
    }
}

public class NotificationsRepo(Db db)
{
    public async Task<List<NotificationRow>> ListForUser(string userId)
    {
        using var c = db.Open();
        var rows = await c.QueryAsync<NotificationRow>(
            @"select id, kind, title, body, fixture_id, read, created_at
              from notifications where user_id = @userId order by created_at desc", new { userId });
        return rows.ToList();
    }

    public async Task<int> UnreadCount(string userId)
    {
        using var c = db.Open();
        return await c.ExecuteScalarAsync<int>(
            "select count(*) from notifications where user_id = @userId and read = false", new { userId });
    }
}

public class AuditRepo(Db db)
{
    public async Task Log(string? userId, string action, string? entity = null, string? entityId = null)
    {
        using var c = db.Open();
        await c.ExecuteAsync(
            @"insert into audit_logs (user_id, action, entity, entity_id, created_at)
              values (@userId, @action, @entity, @entityId, now())",
            new { userId, action, entity, entityId });
    }
}

public class RefreshTokenRepo(Db db)
{
    public async Task Insert(string id, string userId, string tokenHash, DateTime expiresAt)
    {
        using var c = db.Open();
        await c.ExecuteAsync(
            @"insert into refresh_tokens (id, user_id, token_hash, expires_at, revoked, created_at)
              values (@id, @userId, @tokenHash, @expiresAt, false, now())",
            new { id, userId, tokenHash, expiresAt });
    }

    public async Task<string?> FindValidUserId(string tokenHash)
    {
        using var c = db.Open();
        return await c.QuerySingleOrDefaultAsync<string?>(
            @"select user_id from refresh_tokens
              where token_hash=@tokenHash and revoked=false and expires_at > now()",
            new { tokenHash });
    }

    public async Task Revoke(string tokenHash)
    {
        using var c = db.Open();
        await c.ExecuteAsync(
            "update refresh_tokens set revoked=true where token_hash=@tokenHash", new { tokenHash });
    }
}
