package theknife.server.services;

import theknife.server.db.DatabaseManager;
import theknife.server.services.dto.Restaurant;
import theknife.server.services.dto.Review;
import theknife.server.services.dto.UserSummary;

import java.util.List;
import java.util.Objects;
import java.util.StringJoiner;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Central entry point for text based commands.
 */
public final class ServiceRegistry {

    private static final Logger LOGGER = Logger.getLogger(ServiceRegistry.class.getName());

    private final AuthenticationService authenticationService;
    private final RestaurantService restaurantService;
    private final ReviewService reviewService;

    public ServiceRegistry(DatabaseManager databaseManager) {
        Objects.requireNonNull(databaseManager, "databaseManager");
        this.authenticationService = new AuthenticationService(databaseManager);
        this.restaurantService = new RestaurantService(databaseManager);
        this.reviewService = new ReviewService(databaseManager);
    }

    public ServiceResponse handle(String rawCommand) {
        try {
            String[] tokens = rawCommand.split("\\|", -1);
            String command = tokens[0].trim().toUpperCase();
            switch (command) {
                case "PING":
                    return ServiceResponse.success("PONG");
                case "LOGIN":
                    return handleLogin(tokens);
                case "REGISTER":
                    return handleRegister(tokens);
                case "LIST_RESTAURANTS":
                    return handleListRestaurants();
                case "CREATE_RESTAURANT":
                    return handleCreateRestaurant(tokens);
                case "LIST_REVIEWS":
                    return handleListReviews(tokens);
                case "ADD_REVIEW":
                    return handleAddReview(tokens);
                default:
                    return ServiceResponse.failure("Unknown command: " + command);
            }
        } catch (ServiceException ex) {
            LOGGER.log(Level.WARNING, "Business error", ex);
            return ServiceResponse.failure(ex.getMessage());
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, "Unhandled error", ex);
            return ServiceResponse.failure("Internal server error");
        }
    }

    private ServiceResponse handleLogin(String[] tokens) {
        if (tokens.length < 3) {
            return ServiceResponse.failure("LOGIN requires username and password");
        }
        return authenticationService.login(tokens[1], tokens[2])
                .map(user -> ServiceResponse.success("USER|" + user.username() + "|" + user.email()))
                .orElse(ServiceResponse.failure("Invalid credentials"));
    }

    private ServiceResponse handleRegister(String[] tokens) {
        if (tokens.length < 4) {
            return ServiceResponse.failure("REGISTER requires username, email and password");
        }
        UserSummary summary = authenticationService.register(tokens[1], tokens[2], tokens[3]);
        return ServiceResponse.success("USER|" + summary.username() + "|" + summary.email());
    }

    private ServiceResponse handleListRestaurants() {
        List<Restaurant> restaurants = restaurantService.listRestaurants();
        if (restaurants.isEmpty()) {
            return ServiceResponse.success("RESTAURANTS|");
        }
        StringJoiner joiner = new StringJoiner(";");
        for (Restaurant restaurant : restaurants) {
            joiner.add(restaurant.id() + "," + restaurant.name() + "," + restaurant.city() + "," + restaurant.cuisine());
        }
        return ServiceResponse.success("RESTAURANTS|" + joiner);
    }

    private ServiceResponse handleCreateRestaurant(String[] tokens) {
        if (tokens.length < 4) {
            return ServiceResponse.failure("CREATE_RESTAURANT requires name, city and cuisine");
        }
        Restaurant restaurant = restaurantService.createRestaurant(tokens[1], tokens[2], tokens[3]);
        return ServiceResponse.success("RESTAURANT|" + restaurant.id());
    }

    private ServiceResponse handleListReviews(String[] tokens) {
        if (tokens.length < 2) {
            return ServiceResponse.failure("LIST_REVIEWS requires restaurant id");
        }
        long restaurantId = Long.parseLong(tokens[1]);
        List<Review> reviews = reviewService.listReviews(restaurantId);
        StringJoiner joiner = new StringJoiner(";");
        for (Review review : reviews) {
            joiner.add(review.id() + "," + review.userId() + "," + review.rating() + "," + review.comment());
        }
        return ServiceResponse.success("REVIEWS|" + joiner);
    }

    private ServiceResponse handleAddReview(String[] tokens) {
        if (tokens.length < 5) {
            return ServiceResponse.failure("ADD_REVIEW requires restaurant id, user id, rating and comment");
        }
        long restaurantId = Long.parseLong(tokens[1]);
        long userId = Long.parseLong(tokens[2]);
        int rating = Integer.parseInt(tokens[3]);
        Review review = reviewService.addReview(restaurantId, userId, rating, tokens[4]);
        return ServiceResponse.success("REVIEW|" + review.id());
    }
}
