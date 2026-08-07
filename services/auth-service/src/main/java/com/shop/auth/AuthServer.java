package com.shop.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@SpringBootApplication
@RestController
public class AuthServer {

  public static void main(String[] args) {
    SpringApplication.run(AuthServer.class, args);
  }

  @GetMapping("/health")
  public Map<String, String> healthCheck() {
    return Map.of(
        "status", "ok",
        "service", "auth-service");
  }
}