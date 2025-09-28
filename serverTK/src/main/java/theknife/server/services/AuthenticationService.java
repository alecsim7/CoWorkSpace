package theknife.server.services;

import theknife.server.db.DatabaseManager;
import theknife.server.services.dto.UserSummary;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

/**
 * Handles authentication logic backed by PostgreSQL.
 */
public final class AuthenticationService {

    private final DatabaseManager databaseManager;

    public AuthenticationService(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    public Optional<UserSummary> login(String username, String password) {
        final String sql = "SELECT id, username, email FROM users WHERE username = ? AND password_hash = crypt(?, password_hash)";
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, username);
            statement.setString(2, password);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(new UserSummary(
                        resultSet.getLong("id"),
                        resultSet.getString("username"),
                        resultSet.getString("email")));
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new ServiceException("Unable to authenticate user", e);
        }
    }

    public UserSummary register(String username, String email, String password) {
        final String sql = "INSERT INTO users(username, email, password_hash) VALUES(?, ?, crypt(?, gen_salt('bf'))) RETURNING id";
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, username);
            statement.setString(2, email);
            statement.setString(3, password);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                long id = resultSet.getLong("id");
                return new UserSummary(id, username, email);
            }
            throw new ServiceException("User registration did not return an identifier");
        } catch (SQLException e) {
            throw new ServiceException("Unable to register user", e);
        }
    }
}
