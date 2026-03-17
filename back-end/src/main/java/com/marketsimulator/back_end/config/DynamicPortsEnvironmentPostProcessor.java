package com.marketsimulator.back_end.config;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

public class DynamicPortsEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {
	private static final int DEFAULT_SERVER_PORT = 8080;
	private static final int DEFAULT_DB_PORT = 5432;
	private static final int MAX_PORT_TRIES = 20;
	private static final int CONNECT_TIMEOUT_MS = 300;

	@Override
	public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
		Map<String, Object> overrides = new HashMap<>();

		Integer desiredServerPort = resolveServerPort(environment);
		if (desiredServerPort != null) {
			int serverPort = chooseAvailablePort(desiredServerPort);
			if (serverPort != desiredServerPort) {
				printWarn("Server port " + desiredServerPort + " is in use. Switching to " + serverPort + ".");
			}
			overrides.put("server.port", String.valueOf(serverPort));
		}

		String datasourceUrl = environment.getProperty("spring.datasource.url");
		if (datasourceUrl != null && datasourceUrl.startsWith("jdbc:postgresql://")) {
			String updatedUrl = maybeUpdatePostgresUrl(datasourceUrl);
			if (!updatedUrl.equals(datasourceUrl)) {
				overrides.put("spring.datasource.url", updatedUrl);
			}
		}

		if (!overrides.isEmpty()) {
			MutablePropertySources sources = environment.getPropertySources();
			sources.addFirst(new MapPropertySource("dynamic-ports", overrides));
		}
	}

	@Override
	public int getOrder() {
		return Ordered.HIGHEST_PRECEDENCE;
	}

	private Integer resolveServerPort(ConfigurableEnvironment environment) {
		String raw = environment.getProperty("server.port");
		if (raw == null || raw.isBlank()) {
			return DEFAULT_SERVER_PORT;
		}
		if ("0".equals(raw.trim())) {
			return null;
		}
		try {
			return Integer.parseInt(raw.trim());
		} catch (NumberFormatException ex) {
			printWarn("Invalid server.port value '" + raw + "'. Falling back to " + DEFAULT_SERVER_PORT + ".");
			return DEFAULT_SERVER_PORT;
		}
	}

	private String maybeUpdatePostgresUrl(String url) {
		JdbcUrlParts parts = JdbcUrlParts.parse(url);
		if (parts == null) {
			return url;
		}
		int desiredPort = parts.port != null ? parts.port : DEFAULT_DB_PORT;
		Integer resolvedPort = chooseOpenPostgresPort(parts.host, desiredPort);
		if (resolvedPort == null || resolvedPort == desiredPort) {
			return url;
		}
		printWarn("Postgres port " + desiredPort + " is not accepting connections. Switching to " + resolvedPort + ".");
		return parts.withPort(resolvedPort);
	}

	private int chooseAvailablePort(int desiredPort) {
		if (isPortAvailable(desiredPort)) {
			return desiredPort;
		}
		for (int i = 1; i <= MAX_PORT_TRIES; i++) {
			int candidate = desiredPort + i;
			if (isPortAvailable(candidate)) {
				return candidate;
			}
		}
		printWarn("No free server port found near " + desiredPort + ". Falling back to 0 (random).");
		return 0;
	}

	private Integer chooseOpenPostgresPort(String host, int desiredPort) {
		if (isPortOpen(host, desiredPort)) {
			return desiredPort;
		}
		for (int i = 1; i <= MAX_PORT_TRIES; i++) {
			int candidate = desiredPort + i;
			if (isPortOpen(host, candidate)) {
				return candidate;
			}
		}
		printWarn("No reachable Postgres port found near " + desiredPort + ". Keeping configured URL.");
		return null;
	}

	private boolean isPortAvailable(int port) {
		try (ServerSocket socket = new ServerSocket()) {
			socket.setReuseAddress(true);
			socket.bind(new InetSocketAddress("0.0.0.0", port));
			return true;
		} catch (IOException ex) {
			return false;
		}
	}

	private boolean isPortOpen(String host, int port) {
		try (Socket socket = new Socket()) {
			socket.connect(new InetSocketAddress(host, port), CONNECT_TIMEOUT_MS);
			return true;
		} catch (IOException ex) {
			return false;
		}
	}

	private void printWarn(String message) {
		String yellow = "\u001B[33m";
		String reset = "\u001B[0m";
		System.out.println(yellow + "[dynamic-ports] " + message + reset);
	}

	private static class JdbcUrlParts {
		private final String prefix;
		private final String host;
		private final Integer port;
		private final String databaseAndParams;

		private JdbcUrlParts(String prefix, String host, Integer port, String databaseAndParams) {
			this.prefix = prefix;
			this.host = host;
			this.port = port;
			this.databaseAndParams = databaseAndParams;
		}

		static JdbcUrlParts parse(String url) {
			String prefix = "jdbc:postgresql://";
			String rest = url.substring(prefix.length());
			int slashIdx = rest.indexOf('/');
			if (slashIdx < 0) {
				return null;
			}
			String hostPort = rest.substring(0, slashIdx);
			String databaseAndParams = rest.substring(slashIdx);
			String host;
			Integer port = null;
			int colonIdx = hostPort.lastIndexOf(':');
			if (colonIdx >= 0) {
				host = hostPort.substring(0, colonIdx);
				String portText = hostPort.substring(colonIdx + 1);
				if (!portText.isBlank()) {
					try {
						port = Integer.parseInt(portText);
					} catch (NumberFormatException ex) {
						port = null;
					}
				}
			} else {
				host = hostPort;
			}
			return new JdbcUrlParts(prefix, host, port, databaseAndParams);
		}

		String withPort(int newPort) {
			return prefix + host + ":" + newPort + databaseAndParams;
		}
	}
}
