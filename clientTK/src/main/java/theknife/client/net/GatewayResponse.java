package theknife.client.net;

import java.util.Arrays;
import java.util.List;

/**
 * Represents the server reply to a gateway command.
 */
public record GatewayResponse(boolean success, List<String> tokens) {

    public static GatewayResponse parse(String wire) {
        String[] parts = wire.split("\\|", -1);
        boolean ok = parts.length > 0 && "OK".equalsIgnoreCase(parts[0]);
        List<String> tokens = Arrays.asList(parts).subList(1, parts.length);
        return new GatewayResponse(ok, tokens);
    }

    public String firstToken() {
        return tokens.isEmpty() ? "" : tokens.get(0);
    }
}
