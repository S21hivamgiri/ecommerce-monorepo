# E-commerce monorepo (Bazel)

One Bazel workspace, organized by **business domain**, each domain built with
the language that fits it (see root architecture doc for the reasoning):

@author: Shivam Kumar Giri @S21hivamgiri
@email: <shivamagiri2015@gmail.com>

```
gateway/                    Node/TS   -> API Gateway
services/
    auth-service/            Java    
    order-service/           Java    
    payment-service/         Java    
    inventory-service/       Java    
    user-service/            Java    
    shipping-service/        Java    
    discount-service/        Java

    chat-service/           Node/TS 
    catalog-service/        Node/TS 
    cart-service/           Node/TS 
    notification-service/   Node/TS 

    review-service/         Python  Django
    search-service/         Python  FastAPI
    recommendation-service/ Python  FastAPI

frontend/web-app/           Angular 
libs/
    java-common/            shared Java utilities (health checks, JSON, logging)
    proto/                  shared gRPC contracts, used across languages
```

## Why one Bazel workspace for four languages

- **One dependency graph.** `bazel query` can tell you exactly which services
  break if you change `libs/proto/order.proto`, regardless of language.
- **One CI entrypoint.** `bazel build //...` / `bazel test //...` builds and
  tests everything; `bazel build //services/order-service/...` builds just
  that domain plus its transitive deps.
- **Remote caching / remote execution** works across all four languages once
  configured, so CI only rebuilds what actually changed.
- **Domain isolation is enforced with `visibility`**, not convention. A
  service in `catalog-service` cannot depend on `order-service` internals —
  only on `libs/proto` contracts — because BUILD file visibility says so.

## Why pnpm

**pnpm (Performant npm)** is a fast, disk-efficient alternative to npm and Yarn.
Instead of copying files for every project, it saves every package version to
a single global store and uses hard links and symbolic links to place them in
your projects. This saves gigabytes of disk space and speeds up installs.

## Services & Domain Description

1. **Gateway**: Route incoming traffic, handle SSL termination, rate limiting, request validation, and API aggregation.
2. **Auth Service**: Identity and access management, user authentication, OAuth2/JWT token issuance, role-based access control (RBAC).
3. **Order Service**: Order lifecycle management (creation, status updates like pending/paid/shipped/cancelled), order history tracking.
4. **Payment Service**: Payment gateway integration (Stripe, PayPal), transaction handling, webhook processing, refund execution.
5. **Inventory Service**: Real-time stock tracking, warehouse allocation, stock reservation during checkout, low-stock alerts.
6. **User Service**: Manage user profile details, saved shipping/billing addresses, user preferences, and customer metadata.
7. **Shipping Service**: Calculate shipping rates, generate shipping labels, integrate with carrier APIs, and provide tracking statuses.
8. **Discount Service**: Validate and apply discount codes, manage seasonal promotions, flash sales, and loyalty/reward programs.
9. **Chat Service**: Real-time customer support chat, live agent routing, or AI chatbot integration using WebSockets.
10. **Catalog Service** : Product CRUD operations, categories, product variants, attributes, and inventory association links.
11. **Cart Service** : Temporary shopping cart state management, item addition/removal, persistent cart storage for logged-in users.
12. **Notification Service** : Multi-channel communication engine (Email, SMS, Push notifications) for order updates and marketing.
13. **Review Service**: Product ratings, user reviews, moderation workflow, and Q&A sections and ML analysis.
14. **Search Service**: High-performance full-text search, faceted navigation, auto-suggestions, and filters (often backed by Elasticsearch/OpenSearch).
15. **Recommendation Service**: Machine learning-driven product recommendations ("Customers who bought this also bought...", personalized feeds).
16. **Frontend Service**: Serve storefront to the users.

## Local setup

This sandbox has no network access to the Bazel Central Registry, npm
registry package resolution, or PyPI's full index, so I couldn't run
`bazel build` here to verify it end-to-end. On your machine:

```bash
# Install Bazelisk (manages the right Bazel version for you)
npm install -g @bazel/bazelisk

# Confirm Node 22+, Python 3.11+, JDK 17+, and Docker are installed
node -v && python3 --version && java -version && docker --version
```

## What is pnpm-workspace.yaml

**pnpm-workspace.yaml** defines the root of a monorepo and tells PNPM where to find your sub-projects

## What is MODULE.baze

**MODULE.bazel**MODULE.bazel is the central configuration file for Bzlmod, Bazel's modern dependency management system. It does following purpose:  

- **Defines the Module**: It specifies your project's name, version, and compatibility levels.Manages Centralized - **Dependencies**: It fetches official Bazel rules (like rules_js or rules_go) directly from the Bazel Central - Registry (BCR) with strict version locking.
- **Configures Extensions**: It allows you to run "Module Extensions," which translate ecosystem-specific lockfiles (like pnpm-lock.yaml) into Bazel-compatible targets.

## What is BUILD.bazel

**BUILD.bazel**: a configuration file that tells Bazel how to compile, test, or package code inside a specific directory.Every directory containing a BUILD.bazel file is recognized by Bazel as a package, which is the fundamental unit of code in the Bazel ecosystem.
