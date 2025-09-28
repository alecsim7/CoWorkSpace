package theknife.client;

import theknife.client.core.ClientRuntime;
import theknife.client.core.RuntimeConfiguration;

/**
 * Entry point for the CLI client. The runtime layer is decoupled from the presentation and can
 * be reused by GUI front-ends.
 */
public final class ClientApplication {

    private ClientApplication() {
        // static entry point
    }

    public static void main(String[] args) {
        RuntimeConfiguration configuration = RuntimeConfiguration.fromArgs(args);
        ClientRuntime runtime = new ClientRuntime(configuration);
        runtime.startInteractiveSession();
    }
}
