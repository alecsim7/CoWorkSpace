package theknife.client.services;

import theknife.client.model.Review;
import theknife.client.net.GatewayResponse;
import theknife.client.net.RemoteGateway;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Client adapter for review operations.
 */
public final class ReviewClient {

    private final RemoteGateway gateway;

    public ReviewClient(RemoteGateway gateway) {
        this.gateway = gateway;
    }

    public List<Review> listReviews(long restaurantId) throws IOException {
        GatewayResponse response = gateway.call("LIST_REVIEWS|" + restaurantId);
        List<Review> reviews = new ArrayList<>();
        if (!response.success() || response.tokens().isEmpty()) {
            return reviews;
        }
        if (!"REVIEWS".equalsIgnoreCase(response.firstToken())) {
            return reviews;
        }
        if (response.tokens().size() < 2 || response.tokens().get(1).isBlank()) {
            return reviews;
        }
        String[] entries = response.tokens().get(1).split(";");
        for (String entry : entries) {
            String[] parts = entry.split(",");
            if (parts.length >= 4) {
                reviews.add(new Review(
                        Long.parseLong(parts[0]),
                        restaurantId,
                        Long.parseLong(parts[1]),
                        Integer.parseInt(parts[2]),
                        parts[3],
                        Instant.now()));
            }
        }
        return reviews;
    }

    public boolean addReview(long restaurantId, long userId, int rating, String comment) throws IOException {
        GatewayResponse response = gateway.call("ADD_REVIEW|" + restaurantId + '|' + userId + '|' + rating + '|' + comment);
        return response.success();
    }
}
