# Auth Service for E-commerce

Identity and access management, user authentication, OAuth2/JWT token issuance, role-based access control (RBAC).
@author: Shivam Kumar Giri [@S21hivamgiri](https://github.com/S21hivamgiri)
@email: <shivamagiri2015@gmail.com>

Used **Java Spring** Boot for auth server as it offers comprehensive, native protection against OWASP top vulnerabilities

```bash
#command to run auth service
bazel build //services/auth-service:auth_service
#command to build auth service
bazel run //services/auth-service:auth_service
```

See local host :

## Server

**[http:localhost:8081](http:localhost:8081)**  #only for Development
or if all the servers are up

**[http:localhost:8080/auth](http:localhost:8080/auth)**

## HealthCheck

**[http:localhost:8081/health](http:localhost:8081/health)**  #only for Development
or if all the servers are up

**[http:localhost:8080/auth/health](http:localhost:8080/auth/health)**

## Requirements

---TODO--

## Non Functional Requirements

---TODO--
