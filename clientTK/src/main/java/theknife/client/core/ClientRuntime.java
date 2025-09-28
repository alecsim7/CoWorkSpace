package theknife.client.core;

import theknife.client.model.Restaurant;
import theknife.client.model.Review;
import theknife.client.model.UserSession;
import theknife.client.net.RemoteGateway;
import theknife.client.services.AuthenticationClient;
import theknife.client.services.RestaurantClient;
import theknife.client.services.ReviewClient;

import java.io.Console;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

/**
 * Coordinates network calls with a simple console presentation. The service adapters are exposed so a GUI
 * can reuse the same runtime without needing to know about sockets.
 */
public final class ClientRuntime {

    private final RuntimeConfiguration configuration;

    public ClientRuntime(RuntimeConfiguration configuration) {
        this.configuration = configuration;
    }

    public void startInteractiveSession() {
        System.out.println("=== theKnife Client ===");
        try (RemoteGateway gateway = new RemoteGateway(configuration.getHost(), configuration.getPort())) {
            gateway.connect();
            AuthenticationClient authenticationClient = new AuthenticationClient(gateway);
            RestaurantClient restaurantClient = new RestaurantClient(gateway);
            ReviewClient reviewClient = new ReviewClient(gateway);
            Scanner scanner = new Scanner(System.in);
            Console console = System.console();
            Optional<UserSession> session = authenticate(scanner, console, authenticationClient);
            if (session.isEmpty()) {
                System.out.println("Unable to authenticate. Closing client.");
                return;
            }
            UserSession activeSession = session.get();
            boolean running = true;
            while (running) {
                System.out.println();
                System.out.println("Logged in as: " + activeSession.username());
                System.out.println("1) Lista ristoranti");
                System.out.println("2) Nuova recensione");
                System.out.println("3) Mostra recensioni di un ristorante");
                System.out.println("0) Esci");
                System.out.print("> ");
                String choice = scanner.nextLine();
                switch (choice) {
                    case "1" -> listRestaurants(restaurantClient);
                    case "2" -> addReview(scanner, reviewClient, activeSession);
                    case "3" -> showReviews(scanner, reviewClient);
                    case "0" -> running = false;
                    default -> System.out.println("Selezione non valida");
                }
            }
            System.out.println("Arrivederci!");
        } catch (IOException e) {
            System.err.println("Impossibile connettersi al server: " + e.getMessage());
        }
    }

    private Optional<UserSession> authenticate(Scanner scanner, Console console, AuthenticationClient authenticationClient)
            throws IOException {
        while (true) {
            System.out.println("1) Login");
            System.out.println("2) Registrazione");
            System.out.println("0) Esci");
            System.out.print("> ");
            String choice = scanner.nextLine();
            switch (choice) {
                case "1" -> {
                    String username = prompt(scanner, "Username");
                    String password = readPassword(scanner, console, "Password");
                    Optional<UserSession> login = authenticationClient.login(username, password);
                    if (login.isPresent()) {
                        System.out.println("Benvenuto, " + login.get().username() + "!");
                        return login;
                    }
                    System.out.println("Credenziali non valide");
                }
                case "2" -> {
                    String username = prompt(scanner, "Username");
                    String email = prompt(scanner, "Email");
                    String password = readPassword(scanner, console, "Password");
                    Optional<UserSession> registration = authenticationClient.register(username, email, password);
                    if (registration.isPresent()) {
                        System.out.println("Registrazione completata. Effettuato accesso come " + registration.get().username());
                        return registration;
                    }
                    System.out.println("Impossibile completare la registrazione");
                }
                case "0" -> {
                    return Optional.empty();
                }
                default -> System.out.println("Scelta non valida");
            }
        }
    }

    private void listRestaurants(RestaurantClient restaurantClient) {
        try {
            List<Restaurant> restaurants = restaurantClient.listRestaurants();
            if (restaurants.isEmpty()) {
                System.out.println("Nessun ristorante disponibile");
                return;
            }
            System.out.println("--- Ristoranti ---");
            for (Restaurant restaurant : restaurants) {
                System.out.printf("[%d] %s - %s (%s)%n", restaurant.id(), restaurant.name(), restaurant.city(), restaurant.cuisine());
            }
        } catch (IOException e) {
            System.out.println("Errore durante il caricamento dei ristoranti: " + e.getMessage());
        }
    }

    private void addReview(Scanner scanner, ReviewClient reviewClient, UserSession activeSession) {
        try {
            long restaurantId = Long.parseLong(prompt(scanner, "ID ristorante"));
            int rating = Integer.parseInt(prompt(scanner, "Valutazione (1-5)"));
            String comment = prompt(scanner, "Commento");
            boolean saved = reviewClient.addReview(restaurantId, activeSession.username().hashCode(), rating, comment);
            if (saved) {
                System.out.println("Recensione inviata");
            } else {
                System.out.println("Impossibile inviare la recensione");
            }
        } catch (IOException e) {
            System.out.println("Errore durante l'invio della recensione: " + e.getMessage());
        }
    }

    private void showReviews(Scanner scanner, ReviewClient reviewClient) {
        try {
            long restaurantId = Long.parseLong(prompt(scanner, "ID ristorante"));
            List<Review> reviews = reviewClient.listReviews(restaurantId);
            if (reviews.isEmpty()) {
                System.out.println("Nessuna recensione trovata");
                return;
            }
            System.out.println("--- Recensioni ---");
            for (Review review : reviews) {
                System.out.printf("Utente %d: voto %d - %s%n", review.userId(), review.rating(), review.comment());
            }
        } catch (IOException e) {
            System.out.println("Errore durante il caricamento delle recensioni: " + e.getMessage());
        }
    }

    private String prompt(Scanner scanner, String label) {
        System.out.print(label + ": ");
        return scanner.nextLine();
    }

    private String readPassword(Scanner scanner, Console console, String label) {
        if (console != null) {
            char[] raw = console.readPassword(label + ": ");
            if (raw != null) {
                return new String(raw);
            }
        }
        return prompt(scanner, label);
    }
}
