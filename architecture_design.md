# Architecture Design: Distributed Chat System

## Goal Description
Design a high-availability, horizontally scalable distributed chat system using Microservices architecture. The system will consist of an Authentication Service and a Chat Service, utilizing a hybrid database approach and real-time communication via WebSockets.

## Technology Stack

### Backend (Microservices)
We will use **Java 21+** with **Spring Boot 4** (Trying the latest features).

1.  **Auth Service**:
    *   **Framework**: Spring Boot 4 (Web, Security, Data JPA).
    *   **Database**: **PostgreSQL** (Relational) - Best for structured user data, roles, and relational integrity.
    *   **Security**: Spring Security + JWT (Stateless Authentication).

2.  **Chat Service**:
    *   **Framework**: Spring Boot 4 (WebFlux or Web MVC with WebSocket).
    *   **Database**: **MongoDB** (NoSQL) - High write throughput, flexible schema for messages.
    *   **Real-time**: Spring WebSocket (STOMP protocol).
    *   **Message Broker**: **Redis** (Pub/Sub) - Critical for horizontal scalability. Allows multiple Chat Service instances to broadcast messages to users connected to different nodes.

### Frontend
*   **Framework**: **React** with **Vite**.
*   **Language**: TypeScript.
*   **UI Library**: **Shadcn/ui** + **TailwindCSS** (for modern, premium aesthetics).
*   **State Management**: React Query (server state) + Zustand or Context (client state).

### Infrastructure & DevOps
*   **Containerization**: Docker & Docker Compose.
*   **Gateway**: Spring Cloud Gateway (Optional for MVP, but recommended for routing).
*   **Service Discovery**: Eureka or Consul (Optional for MVP, can use DNS/Docker internal networking initially).

## Directory Structure

```text
/DistributedChatSystem
├── /auth-service           # Spring Boot: User management & Authentication
│   ├── src/main/java...
│   ├── Dockerfile
│   └── pom.xml
├── /chat-service           # Spring Boot: Messaging & WebSocket handling
│   ├── src/main/java...
│   ├── Dockerfile
│   └── pom.xml
├── /frontend-web           # React + Vite application
│   ├── src/...
│   ├── Dockerfile
│   └── package.json
├── /docker                 # Infrastructure configuration
│   ├── docker-compose.yml  # Orchestrates App services + DBs
│   ├── postgres/           # Init scripts
│   └── prometheus/         # (Optional) Monitoring
└── README.md
```

## Service Communication Strategy

### 1. Client to Services (Synchronous & Asynchronous)
*   **REST API**: The Frontend communicates with `Auth Service` (Login, Register) and `Chat Service` (History, Room management) via HTTP/REST.
*   **WebSocket**: The Frontend establishes a persistent WebSocket connection with the `Chat Service` for real-time message delivery.

### 2. Service to Service (Internal)
*   **Auth Token Validation**: The `Chat Service` needs to validate JWTs issued by the `Auth Service`. This can be done via a shared secret (stateless) or by calling the Auth Service (less efficient). We will use **Stateless JWT validation** with a shared public/private key pair or shared secret.

### 3. Horizontal Scalability (The "Distributed" Part)
*   **Problem**: If User A is connected to Chat-Instance-1 and User B is connected to Chat-Instance-2, a message sent by A won't reach B directly because websockets are stateful to a specific server.
*   **Solution (Redis Pub/Sub)**:
    1.  User A sends message -> Chat-Instance-1.
    2.  Chat-Instance-1 saves to MongoDB.
    3.  Chat-Instance-1 publishes event to **Redis Topic** (e.g., `chat.room.123`).
    4.  All Chat Instances (1, 2, n) subscribe to Redis Topics.
    5.  Chat-Instance-2 receives the event from Redis.
    6.  Chat-Instance-2 pushes the message via WebSocket to User B (if connected).

## Data Flow
1.  **User Login**: POST `/auth/login` -> Returns JWT.
2.  **Connect Chat**: WS Connect `ws://chat-service/ws` with JWT in header/query.
3.  **Send Message**: WS Send `/app/chat` -> Chat Service saves to Mongo -> Publishes to Redis.
4.  **Receive Message**: Redis Subscriber -> Chat Service -> WS Push to Client.
