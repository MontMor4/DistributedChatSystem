# Data Schemas & WebSocket Protocols (Simplified)

## 1. PostgreSQL Schema (Auth Service)
**Database**: `auth_db`
**Purpose**: Manage users and authentication. Simplified for MVP.

### Tables

#### `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Not Null | Unique user identifier |
| `username` | VARCHAR(50) | Unique, Not Null | Display name / Login |
| `password_hash` | VARCHAR(255) | Not Null | BCrypt encoded password |
| `full_name` | VARCHAR(100) | Not Null | User's full name |

---

## 2. MongoDB Schema (Chat Service)
**Database**: `chat_db`
**Purpose**: Store chat history and room metadata.

### Collections

#### `messages`
Stores individual chat messages.
```json
{
  "_id": "ObjectId",
  "chatRoomId": "String",       // ID of the room/conversation
  "senderId": "UUID",           // Reference to Postgres User ID
  "content": "String",          // Plain text content
  "timestamp": "ISODate"        // When it was sent
}
```

#### `chat_rooms`
Stores metadata about a conversation.
```json
{
  "_id": "String",              // Unique ID (e.g., UUID)
  "participantIds": ["UUID"],   // Array of User UUIDs (Simple list)
  "lastMessage": "String",      // Preview for the list view
  "lastMessageTime": "ISODate"  // For sorting the room list
}
```

---

## 3. WebSocket Protocol (STOMP)
**Endpoint**: `/ws`
**Broker**: `/topic` (Public/Group), `/queue` (Direct)

### Payloads

#### A. Sending a Message (Client -> Server)
**Destination**: `/app/chat.sendMessage`
```json
{
  "chatRoomId": "uuid-of-room",
  "content": "Hello world!",
  "type": "CHAT"
}
```

#### B. Receiving a Message (Server -> Client)
**Subscription**: `/topic/room/{chatRoomId}`
```json
{
  "id": "mongo-object-id",
  "chatRoomId": "uuid-of-room",
  "senderId": "uuid-of-sender",
  "content": "Hello world!",
  "timestamp": "2025-12-02T19:00:00Z"
}
```
