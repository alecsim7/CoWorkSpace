package theknife.client.model;

/**
 * Represents an authenticated user in the client runtime.
 */
public record UserSession(String username, String email) {
}
