package theknife.client.core;

/**
 * Holds connection settings for the client runtime.
 */
public final class RuntimeConfiguration {

    private static final int DEFAULT_PORT = 5050;

    private final String host;
    private final int port;

    public RuntimeConfiguration(String host, int port) {
        this.host = host;
        this.port = port;
    }

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }

    public static RuntimeConfiguration fromArgs(String[] args) {
        String host = "localhost";
        int port = DEFAULT_PORT;
        if (args != null) {
            for (String arg : args) {
                if (arg == null) {
                    continue;
                }
                if (arg.startsWith("--host=")) {
                    host = arg.substring("--host=".length());
                }
                if (arg.startsWith("--port=")) {
                    port = Integer.parseInt(arg.substring("--port=".length()));
                }
            }
        }
        return new RuntimeConfiguration(host, port);
    }
}
