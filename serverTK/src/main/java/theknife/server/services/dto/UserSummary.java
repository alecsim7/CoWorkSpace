package theknife.server.services.dto;

/**
 * Lightweight user representation returned to clients after authentication.
 */
public record UserSummary(long id, String username, String email) {
}
