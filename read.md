# Decentralized Chat Application

## Overview
A secure, decentralized messaging application that combines blockchain technology for message verification with client-side encryption for privacy. Messages are encrypted locally before being sent, and only message hashes are stored on-chain for tamper-proof verification.

## Project Status
MVP Complete - Full-stack application with real-time messaging, encryption, and room management.

## Architecture

### Two-Layer Design

1. **On-Chain Component (Notary)**
   - Records message hashes for verification
   - Stores sender/recipient addresses and timestamps
   - Provides tamper-proof message audit trail
   - Never sees actual message content

2. **Off-Chain Component (Secure Messenger)**
   - Client-side AES-256 encryption
   - Local storage of encryption keys
   - Real-time WebSocket messaging
   - In-memory message storage

## Tech Stack

### Frontend
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS
- ethers.js for Web3 (optional)
- crypto-js for AES encryption

### Backend
- Express.js
- WebSocket (ws) for real-time messaging
- In-memory storage (MemStorage)
- Zod for validation

## Features

### Current (MVP)
- ✅ Multi-room chat support
- ✅ Client-side AES-256 encryption
- ✅ Per-room encryption key management
- ✅ Real-time message delivery via WebSocket
- ✅ Anonymous messaging (wallet optional)
- ✅ Room creation and management
- ✅ Message persistence
- ✅ Dark/Light theme support

### Future
- 🔲 MetaMask wallet integration for identity
- 🔲 Smart contract deployment for on-chain hashing
- 🔲 IPFS integration for file sharing
- 🔲 End-to-end encrypted file transfer
- 🔲 Multi-room support with separate keys
- 🔲 Message history pagination
- 🔲 Key exchange protocol (Diffie-Hellman)

## How It Works

### Message Flow
1. User types a message in the chat interface
2. Message is encrypted client-side using room's secret key (AES-256)
3. Hash of encrypted message is computed (SHA-256)
4. Encrypted message + hash sent to server via API
5. Server broadcasts message to all connected WebSocket clients
6. Recipients decrypt message using same secret key
7. Hash can be verified on-chain (future enhancement)

### Encryption Key Management
- Keys stored in localStorage per room
- Format: `encryption_key_{roomId}`
- Users must share keys securely (out-of-band)
- Each room can have different encryption key

### Anonymous Messaging
- Users can send without wallet connection
- Anonymous sender IDs generated: `anon_xxxxx`
- Useful for testing and local development
- Wallet connection adds blockchain verification

## API Routes

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create new room
  - Body: `{ name: string }`

### Messages
- `GET /api/rooms/:roomId/messages` - Get messages for room
- `POST /api/rooms/:roomId/messages` - Send message
  - Body: `{ sender, encryptedContent, hash, verified }`
- `PATCH /api/messages/:id/verify` - Update verification status

### WebSocket
- Path: `/ws`
- Broadcasts: `{ type: "new_message", roomId, message }`
- Updates client cache directly (no refetch needed)

## Security Considerations

### Current
- Client-side encryption prevents server from reading messages
- Message hashes ensure integrity
- Room existence validated before message creation
- Proper error handling (400 for validation, 500 for server errors)

### Best Practices
- Never share encryption keys over insecure channels
- Use strong, random keys for each room
- Wallet connection recommended for identity verification
- Consider implementing key rotation for long-lived rooms

## Development

### Running Locally
```bash
npm run dev
```
Server runs on port 5000 (frontend + backend + WebSocket)

### Environment
- NODE_ENV=development
- Uses in-memory storage (data resets on restart)
- WebSocket on /ws path (avoids Vite HMR conflicts)

## Testing
- End-to-end tests verify complete message flow
- Room creation, encryption, sending, and receiving tested
- WebSocket real-time updates verified
- Multi-room switching tested

## Known Limitations
- In-memory storage (no persistence across restarts)
- No actual blockchain integration (hashes not stored on-chain yet)
- Keys must be shared manually between users
- No key exchange protocol
- No file sharing (planned for future)

## Recent Changes
- 2025-11-08: Initial MVP implementation
- Added room and message management
- Implemented WebSocket real-time messaging
- Added anonymous messaging support
- Encryption key management via localStorage
- Direct cache updates for performance
