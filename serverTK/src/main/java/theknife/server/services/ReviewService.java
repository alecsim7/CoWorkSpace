package theknife.server.services;

import theknife.server.db.DatabaseManager;
import theknife.server.services.dto.Review;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for handling reviews.
 */
public final class ReviewService {

    private final DatabaseManager databaseManager;

    public ReviewService(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    public List<Review> listReviews(long restaurantId) {
        final String sql = "SELECT id, restaurant_id, user_id, rating, comment, created_at FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC";
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, restaurantId);
            ResultSet resultSet = statement.executeQuery();
            List<Review> reviews = new ArrayList<>();
            while (resultSet.next()) {
                reviews.add(mapReview(resultSet));
            }
            return reviews;
        } catch (SQLException e) {
            throw new ServiceException("Unable to fetch reviews", e);
        }
    }

    public Review addReview(long restaurantId, long userId, int rating, String comment) {
        final String sql = "INSERT INTO reviews(restaurant_id, user_id, rating, comment) VALUES(?, ?, ?, ?) RETURNING id, created_at";
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, restaurantId);
            statement.setLong(2, userId);
            statement.setInt(3, rating);
            statement.setString(4, comment);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                long id = resultSet.getLong("id");
                Timestamp createdAt = resultSet.getTimestamp("created_at");
                Instant instant = createdAt != null ? createdAt.toInstant() : Instant.now();
                return new Review(id, restaurantId, userId, rating, comment, instant);
            }
            throw new ServiceException("Failed to persist review");
        } catch (SQLException e) {
            throw new ServiceException("Unable to add review", e);
        }
    }

    private Review mapReview(ResultSet resultSet) throws SQLException {
        Timestamp timestamp = resultSet.getTimestamp("created_at");
        Instant createdAt = timestamp != null ? timestamp.toInstant() : Instant.now();
        return new Review(
                resultSet.getLong("id"),
                resultSet.getLong("restaurant_id"),
                resultSet.getLong("user_id"),
                resultSet.getInt("rating"),
                resultSet.getString("comment"),
                createdAt);
    }
}
