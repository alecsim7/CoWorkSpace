package theknife.server.config;

import java.util.Optional;

/**
 * Configures the network layer of the server.
 */
public final class ServerConfiguration {

    public static final int DEFAULT_PORT = 5050;

    private final int port;

    public ServerConfiguration(int port) {
        if (port <= 0 || port > 65535) {
            throw new IllegalArgumentException("Invalid port: " + port);
        }
        this.port = port;
    }

    public int getPort() {
        return port;
    }

    public static Optional<Integer> extractPort(String[] args) {
        if (args == null) {
            return Optional.empty();
        }
        for (String arg : args) {
            if (arg != null && arg.startsWith("--port=")) {
                String value = arg.substring("--port=".length());
                return Optional.of(Integer.parseInt(value));
            }
        }
        return Optional.empty();
    }

    @Override
    public String toString() {
        return "ServerConfiguration{" +
                "port=" + port +
                '}';
    }
}
