package theknife.client.model;

/**
 * Representation of a restaurant returned by the remote API.
 */
public record Restaurant(long id, String name, String city, String cuisine) {
}
