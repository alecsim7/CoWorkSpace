package theknife.client.model;

import java.time.Instant;

/**
 * Representation of a review displayed by the client.
 */
public record Review(long id, long restaurantId, long userId, int rating, String comment, Instant createdAt) {
}
