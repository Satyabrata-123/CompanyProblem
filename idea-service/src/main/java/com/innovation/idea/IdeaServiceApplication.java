package com.innovation.idea;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@EnableEurekaClient
@SpringBootApplication
public class IdeaServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(IdeaServiceApplication.class, args);
    }
}
