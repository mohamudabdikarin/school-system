package com.fullstack.schoolmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories("com.fullstack.schoolmanagement.repository")
public class SchoolsystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(SchoolsystemApplication.class, args);
	}

}
