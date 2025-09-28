package theknife.server;

import theknife.server.config.DatabaseConfiguration;
import theknife.server.config.ServerConfiguration;
import theknife.server.db.DatabaseManager;
import theknife.server.net.ServerBootstrap;

import java.io.Console;
import java.util.Optional;
import java.util.Scanner;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Entry point for the theKnife backend server.
 */
public final class ServerApplication {

    private static final Logger LOGGER = Logger.getLogger(ServerApplication.class.getName());

    private ServerApplication() {
        // Utility class
    }

    /**
     * Bootstraps the concurrent server by collecting PostgreSQL credentials from the CLI.
     *
     * @param args optional CLI arguments to override the server port (e.g. {@code --port=9090}).
     */
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Console console = System.console();

        System.out.println("=== theKnife Server Setup ===");
        String host = prompt(scanner, "PostgreSQL host (default: localhost)").orElse("localhost");
        int port = prompt(scanner, "PostgreSQL port (default: 5432)")
                .map(Integer::parseInt)
                .orElse(5432);
        String database = prompt(scanner, "PostgreSQL database name").orElse("theknife");
        String user = prompt(scanner, "PostgreSQL user").orElse("postgres");
        String password = readPassword(scanner, console, "PostgreSQL password");

        DatabaseConfiguration databaseConfiguration = new DatabaseConfiguration(host, port, database, user, password);

        int serverPort = ServerConfiguration.extractPort(args).orElse(ServerConfiguration.DEFAULT_PORT);
        ServerConfiguration serverConfiguration = new ServerConfiguration(serverPort);

        try (DatabaseManager databaseManager = new DatabaseManager(databaseConfiguration);
             ServerBootstrap bootstrap = new ServerBootstrap(serverConfiguration, databaseManager)) {
            databaseManager.initialise();
            bootstrap.start();
            LOGGER.info(() -> "Server started on port " + serverPort);
            Runtime.getRuntime().addShutdownHook(new Thread(bootstrap::stop, "tk-server-shutdown"));
            bootstrap.awaitShutdown();
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, "Fatal error during server startup", ex);
            System.exit(1);
        }
    }

    private static Optional<String> prompt(Scanner scanner, String label) {
        System.out.print(label + ": ");
        String line = scanner.nextLine();
        if (line == null || line.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(line.trim());
    }

    private static String readPassword(Scanner scanner, Console console, String label) {
        if (console != null) {
            char[] raw = console.readPassword(label + ": ");
            if (raw != null) {
                return new String(raw);
            }
        }
        return prompt(scanner, label).orElse("");
    }
}
