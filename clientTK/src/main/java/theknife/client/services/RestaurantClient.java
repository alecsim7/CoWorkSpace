package theknife.client.services;

import theknife.client.model.Restaurant;
import theknife.client.net.GatewayResponse;
import theknife.client.net.RemoteGateway;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Client adapter for restaurant operations.
 */
public final class RestaurantClient {

    private final RemoteGateway gateway;

    public RestaurantClient(RemoteGateway gateway) {
        this.gateway = gateway;
    }

    public List<Restaurant> listRestaurants() throws IOException {
        GatewayResponse response = gateway.call("LIST_RESTAURANTS");
        List<Restaurant> restaurants = new ArrayList<>();
        if (!response.success()) {
            return restaurants;
        }
        if (response.tokens().isEmpty()) {
            return restaurants;
        }
        String payload = response.tokens().get(0);
        if (!"RESTAURANTS".equalsIgnoreCase(payload)) {
            return restaurants;
        }
        if (response.tokens().size() < 2) {
            return restaurants;
        }
        String rawList = response.tokens().get(1);
        if (rawList.isBlank()) {
            return restaurants;
        }
        String[] entries = rawList.split(";");
        for (String entry : entries) {
            String[] parts = entry.split(",");
            if (parts.length >= 4) {
                restaurants.add(new Restaurant(
                        Long.parseLong(parts[0]),
                        parts[1],
                        parts[2],
                        parts[3]));
            }
        }
        return restaurants;
    }
}
