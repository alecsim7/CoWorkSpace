package theknife.server.services.dto;

import java.time.Instant;

/**
 * Represents a review of a restaurant made by a user.
 */
public record Review(long id, long restaurantId, long userId, int rating, String comment, Instant createdAt) {
}
