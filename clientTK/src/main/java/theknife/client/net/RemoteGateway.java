package theknife.client.net;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

/**
 * Thin wrapper around a TCP socket that speaks theKnife's text protocol.
 */
public final class RemoteGateway implements AutoCloseable {

    private final String host;
    private final int port;
    private Socket socket;
    private BufferedReader reader;
    private PrintWriter writer;

    public RemoteGateway(String host, int port) {
        this.host = Objects.requireNonNull(host, "host");
        this.port = port;
    }

    public void connect() throws IOException {
        this.socket = new Socket();
        socket.connect(new InetSocketAddress(host, port));
        this.reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
        this.writer = new PrintWriter(socket.getOutputStream(), true, StandardCharsets.UTF_8);
    }

    public GatewayResponse call(String command) throws IOException {
        ensureConnected();
        writer.println(command);
        String response = reader.readLine();
        if (response == null) {
            throw new IOException("Connection closed by server");
        }
        return GatewayResponse.parse(response);
    }

    private void ensureConnected() {
        if (socket == null || !socket.isConnected()) {
            throw new IllegalStateException("Gateway not connected");
        }
    }

    @Override
    public void close() throws IOException {
        if (writer != null) {
            writer.println("QUIT");
            writer.flush();
        }
        if (socket != null) {
            socket.close();
        }
    }
}
