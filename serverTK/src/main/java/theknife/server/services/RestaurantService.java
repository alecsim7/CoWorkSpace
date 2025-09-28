package theknife.server.services;

import theknife.server.db.DatabaseManager;
import theknife.server.services.dto.Restaurant;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * CRUD operations for restaurants.
 */
public final class RestaurantService {

    private final DatabaseManager databaseManager;

    public RestaurantService(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    public List<Restaurant> listRestaurants() {
        final String sql = "SELECT id, name, city, cuisine FROM restaurants ORDER BY name";
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            ResultSet resultSet = statement.executeQuery();
            List<Restaurant> restaurants = new ArrayList<>();
            while (resultSet.next()) {
                restaurants.add(new Restaurant(
                        resultSet.getLong("id"),
                        resultSet.getString("name"),
                        resultSet.getString("city"),
                        resultSet.getString("cuisine")));
            }
            return restaurants;
        } catch (SQLException e) {
            throw new ServiceException("Unable to fetch restaurants", e);
        }
    }

    public Restaurant createRestaurant(String name, String city, String cuisine) {
        final String sql = "INSERT INTO restaurants(name, city, cuisine) VALUES(?, ?, ?) RETURNING id";
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, name);
            statement.setString(2, city);
            statement.setString(3, cuisine);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                long id = resultSet.getLong("id");
                return new Restaurant(id, name, city, cuisine);
            }
            throw new ServiceException("Failed to create restaurant");
        } catch (SQLException e) {
            throw new ServiceException("Unable to create restaurant", e);
        }
    }
}
