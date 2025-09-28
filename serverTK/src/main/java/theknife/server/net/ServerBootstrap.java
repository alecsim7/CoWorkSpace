package theknife.server.net;

import theknife.server.config.ServerConfiguration;
import theknife.server.db.DatabaseManager;
import theknife.server.services.ServiceRegistry;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Accepts client connections and delegates them to worker threads.
 */
public final class ServerBootstrap implements AutoCloseable {

    private static final Logger LOGGER = Logger.getLogger(ServerBootstrap.class.getName());

    private final ServerConfiguration configuration;
    private final DatabaseManager databaseManager;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final ExecutorService executorService = Executors.newCachedThreadPool();
    private ServerSocket serverSocket;
    private ServiceRegistry serviceRegistry;

    public ServerBootstrap(ServerConfiguration configuration, DatabaseManager databaseManager) {
        this.configuration = Objects.requireNonNull(configuration, "configuration");
        this.databaseManager = Objects.requireNonNull(databaseManager, "databaseManager");
    }

    public void start() throws IOException {
        if (running.compareAndSet(false, true)) {
            this.serverSocket = new ServerSocket(configuration.getPort());
            this.serviceRegistry = new ServiceRegistry(databaseManager);
            Thread acceptor = new Thread(this::acceptLoop, "tk-server-acceptor");
            acceptor.setDaemon(true);
            acceptor.start();
        }
    }

    private void acceptLoop() {
        LOGGER.info("Server ready to accept connections");
        while (running.get()) {
            try {
                Socket socket = serverSocket.accept();
                ClientHandler handler = new ClientHandler(socket, serviceRegistry);
                executorService.submit(handler);
            } catch (IOException e) {
                if (running.get()) {
                    LOGGER.log(Level.SEVERE, "Error accepting client connection", e);
                }
            }
        }
    }

    public void awaitShutdown() {
        synchronized (running) {
            while (running.get()) {
                try {
                    running.wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }
    }

    public void stop() {
        if (running.compareAndSet(true, false)) {
            executorService.shutdownNow();
            try {
                if (serverSocket != null) {
                    serverSocket.close();
                }
            } catch (IOException e) {
                LOGGER.log(Level.WARNING, "Error while closing server socket", e);
            }
            synchronized (running) {
                running.notifyAll();
            }
        }
    }

    @Override
    public void close() {
        stop();
    }
}
