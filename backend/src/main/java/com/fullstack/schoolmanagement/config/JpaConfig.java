package com.fullstack.schoolmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.fullstack.schoolmanagement.repository")
@EnableTransactionManagement
public class JpaConfig {
    // This class ensures proper JPA configuration
    // Spring Boot auto-configuration will handle the rest
}