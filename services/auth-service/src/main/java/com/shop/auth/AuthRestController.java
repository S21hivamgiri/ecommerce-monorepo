package com.shop.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class AuthRestController {
    
  @GetMapping("/health")
  public Map<String, String> healthCheck() {
    return Map.of(
        "status", "ok",
        "service", "auth-service");
  }

  @GetMapping("")
  public String routeTest() {
    return "Welcome to the Auth Service!!";
  }
}