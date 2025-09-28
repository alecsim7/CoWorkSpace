package theknife.server.net;

import theknife.server.services.ServiceRegistry;
import theknife.server.services.ServiceResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Processes commands for a single client connection.
 */
final class ClientHandler implements Runnable {

    private static final Logger LOGGER = Logger.getLogger(ClientHandler.class.getName());

    private final Socket socket;
    private final ServiceRegistry serviceRegistry;

    ClientHandler(Socket socket, ServiceRegistry serviceRegistry) {
        this.socket = socket;
        this.serviceRegistry = serviceRegistry;
    }

    @Override
    public void run() {
        String remote = socket.getRemoteSocketAddress().toString();
        LOGGER.info(() -> "Client connected: " + remote);
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
             PrintWriter writer = new PrintWriter(socket.getOutputStream(), true)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                if ("QUIT".equalsIgnoreCase(line.trim())) {
                    writer.println("OK|Goodbye");
                    break;
                }
                ServiceResponse response = serviceRegistry.handle(line);
                writer.println(response.format());
            }
        } catch (IOException e) {
            LOGGER.log(Level.WARNING, "Connection error", e);
        } finally {
            try {
                socket.close();
            } catch (IOException e) {
                LOGGER.log(Level.FINE, "Error closing socket", e);
            }
            LOGGER.info(() -> "Client disconnected: " + remote);
        }
    }
}
