package theknife.server.config;

import java.util.Objects;

/**
 * Encapsulates PostgreSQL connection properties read from the CLI.
 */
public final class DatabaseConfiguration {

    private final String host;
    private final int port;
    private final String database;
    private final String username;
    private final String password;

    public DatabaseConfiguration(String host, int port, String database, String username, String password) {
        this.host = Objects.requireNonNull(host, "host");
        this.port = port;
        this.database = Objects.requireNonNull(database, "database");
        this.username = Objects.requireNonNull(username, "username");
        this.password = Objects.requireNonNullElse(password, "");
    }

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }

    public String getDatabase() {
        return database;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    @Override
    public String toString() {
        return "DatabaseConfiguration{" +
                "host='" + host + '\'' +
                ", port=" + port +
                ", database='" + database + '\'' +
                ", username='" + username + '\'' +
                '}';
    }
}
