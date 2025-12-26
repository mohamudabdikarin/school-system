package com.fullstack.schoolmanagement.security;

import com.fullstack.schoolmanagement.security.JwtRequestFilter;
import com.fullstack.schoolmanagement.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/teachers/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/students/**").hasAnyRole("ADMIN", "TEACHER") // Ensure ADMIN has access
                        .requestMatchers("/api/v1/courses/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers("/api/v1/classes/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                        .requestMatchers("/api/v1/exam-results/mine").hasRole("STUDENT")
                        .requestMatchers("/api/v1/exam-results/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers("/api/periods/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers("/api/attendance/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow multiple origins for development
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://127.0.0.1:5173");
        config.addAllowedOrigin("http://127.0.0.1:3000");
        
        // Allow all headers and methods
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Allow specific headers that might be needed
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");
        
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}