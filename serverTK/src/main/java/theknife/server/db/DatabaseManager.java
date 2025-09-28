package theknife.server.db;

import org.postgresql.ds.PGSimpleDataSource;
import theknife.server.config.DatabaseConfiguration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Provides JDBC connectivity to PostgreSQL using a lightweight {@link DataSource}.
 */
public final class DatabaseManager implements AutoCloseable {

    private static final Logger LOGGER = Logger.getLogger(DatabaseManager.class.getName());

    private final DatabaseConfiguration configuration;
    private PGSimpleDataSource dataSource;

    public DatabaseManager(DatabaseConfiguration configuration) {
        this.configuration = Objects.requireNonNull(configuration, "configuration");
    }

    /**
     * Initialises the data source and validates the connection.
     */
    public void initialise() {
        PGSimpleDataSource source = new PGSimpleDataSource();
        source.setServerNames(new String[]{configuration.getHost()});
        source.setPortNumbers(new int[]{configuration.getPort()});
        source.setDatabaseName(configuration.getDatabase());
        source.setUser(configuration.getUsername());
        source.setPassword(configuration.getPassword());
        this.dataSource = source;
        try (Connection connection = dataSource.getConnection()) {
            LOGGER.info(() -> "Connected to PostgreSQL as " + configuration.getUsername());
        } catch (SQLException e) {
            throw new IllegalStateException("Unable to validate database connection", e);
        }
    }

    public Connection getConnection() throws SQLException {
        if (dataSource == null) {
            throw new IllegalStateException("Database manager not initialised");
        }
        return dataSource.getConnection();
    }

    @Override
    public void close() {
        dataSource = null;
        LOGGER.fine("Database manager released");
    }
}
