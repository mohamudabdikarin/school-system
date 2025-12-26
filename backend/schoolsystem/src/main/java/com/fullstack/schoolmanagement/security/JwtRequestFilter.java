package com.fullstack.schoolmanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    @Autowired
    private com.fullstack.schoolmanagement.security.UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Get the Authorization header from the request
        final String authorizationHeader = request.getHeader("Authorization");
        logger.info("Processing request: {} {}", request.getMethod(), request.getRequestURI());

        String username = null;
        String jwt = null;

        // Check if header contains a Bearer token
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // Extract token string (remove "Bearer ")
            try {
                username = jwtUtil.extractUsername(jwt); // Extract username from token
                logger.info("Extracted username from JWT: {}", username);
            } catch (Exception e) {
                logger.warn("JWT token processing error: " + e.getMessage());
            }
        } else {
            logger.warn("No Authorization header or invalid format for request: {} {}", request.getMethod(), request.getRequestURI());
        }

        // If a username was extracted and no authentication is set in the context
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Load user details from database or memory
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            logger.info("Loaded user details for {} with authorities: {}", username, userDetails.getAuthorities());

            // Validate the token
            if (jwtUtil.validateToken(jwt, userDetails)) {
                // Create an authentication object with the user details
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // Add request details (IP, session ID, etc.)
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the authentication in the Security Context
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                logger.info("Authentication set for user: {} with authorities: {}", username, userDetails.getAuthorities());
            } else {
                logger.warn("JWT token validation failed for user: {}", username);
            }
        } else if (username == null) {
            logger.warn("No username extracted from JWT for request: {} {}", request.getMethod(), request.getRequestURI());
        } else {
            logger.info("Authentication already exists for user: {}", username);
        }

        // Continue the filter chain (pass the request to next filter/controller)
        chain.doFilter(request, response);
    }
}
