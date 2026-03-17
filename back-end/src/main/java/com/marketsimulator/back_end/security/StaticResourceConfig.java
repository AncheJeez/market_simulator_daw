package com.marketsimulator.back_end.security;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
	private final String profilePicturesDir;

	public StaticResourceConfig(@Value("${app.uploads.profile-pictures}") String profilePicturesDir) {
		this.profilePicturesDir = profilePicturesDir;
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		Path path = Paths.get(profilePicturesDir).toAbsolutePath().normalize();
		String location = path.toUri().toString();
		if (!location.endsWith("/")) {
			location = location + "/";
		}
		registry.addResourceHandler("/uploads/profile-pictures/**")
			.addResourceLocations(location);
	}
}
