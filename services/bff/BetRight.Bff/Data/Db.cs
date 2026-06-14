using Npgsql;

namespace BetRight.Bff.Data;

/// <summary>
/// Postgres connection factory for the user-domain tables (Dapper). Alembic (the
/// Python service) owns the schema; the BFF only reads/writes rows.
/// </summary>
public class Db(IConfiguration cfg)
{
    private readonly string _cs = cfg.GetConnectionString("Postgres") ?? "";

    public bool Configured => !string.IsNullOrWhiteSpace(_cs);

    public NpgsqlConnection Open()
    {
        var conn = new NpgsqlConnection(_cs);
        conn.Open();
        return conn;
    }
}
