package theknife.client.services;

import theknife.client.model.UserSession;
import theknife.client.net.GatewayResponse;
import theknife.client.net.RemoteGateway;

import java.io.IOException;
import java.util.Optional;

/**
 * Client-side adapter for authentication APIs.
 */
public final class AuthenticationClient {

    private final RemoteGateway gateway;

    public AuthenticationClient(RemoteGateway gateway) {
        this.gateway = gateway;
    }

    public Optional<UserSession> login(String username, String password) throws IOException {
        GatewayResponse response = gateway.call("LOGIN|" + username + '|' + password);
        if (response.success() && response.tokens().size() >= 3 && "USER".equalsIgnoreCase(response.firstToken())) {
            String user = response.tokens().get(1);
            String email = response.tokens().get(2);
            return Optional.of(new UserSession(user, email));
        }
        return Optional.empty();
    }

    public Optional<UserSession> register(String username, String email, String password) throws IOException {
        GatewayResponse response = gateway.call("REGISTER|" + username + '|' + email + '|' + password);
        if (response.success()) {
            return Optional.of(new UserSession(username, email));
        }
        return Optional.empty();
    }
}
