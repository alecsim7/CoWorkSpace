package theknife.server.services;

import java.util.Objects;

/**
 * Simple transport object for textual responses.
 */
public final class ServiceResponse {

    private final boolean success;
    private final String payload;

    private ServiceResponse(boolean success, String payload) {
        this.success = success;
        this.payload = Objects.requireNonNull(payload, "payload");
    }

    public static ServiceResponse success(String payload) {
        return new ServiceResponse(true, payload);
    }

    public static ServiceResponse failure(String payload) {
        return new ServiceResponse(false, payload);
    }

    public String format() {
        return (success ? "OK" : "ERROR") + '|' + payload;
    }
}
