package com.fullstack.schoolmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import jakarta.annotation.PostConstruct;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @PostConstruct
    public void validateDatabaseConfig() {
        if (databaseUrl == null || databaseUrl.trim().isEmpty()) {
            throw new IllegalStateException(
                "DATABASE_URL environment variable is required for production profile. " +
                "Please set DATABASE_URL to your PostgreSQL connection string."
            );
        }
        
        if (!databaseUrl.startsWith("jdbc:postgresql://")) {
            throw new IllegalStateException(
                "DATABASE_URL must be a valid PostgreSQL JDBC URL starting with 'jdbc:postgresql://'. " +
                "Current value: " + databaseUrl
            );
        }
        
        System.out.println("✅ Database configuration validated successfully");
    }
}