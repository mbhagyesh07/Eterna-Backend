# Eterna - Order Execution Engine

A robust order execution engine for Solana DEXs (Raydium/Meteora) supporting Market Orders. Built with Node.js, Fastify, BullMQ, and Redis.

## Features

- **Order Management**: Submit market orders via REST API.
- **DEX Routing**: Smart routing between Raydium and Meteora for best price execution.
- **Queue System**: High-throughput order processing using BullMQ and Redis.
- **Real-time Updates**: WebSocket status streaming (Pending -> Routing -> Building -> Submitted -> Confirmed).
- **Resilience**: Exponential back-off retry logic for failed orders.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **API Framework**: Fastify
- **Queue**: BullMQ + Redis
- **Database**: PostgreSQL (Prisma ORM)
- **Testing**: Jest

## Setup

1. **Prerequisites**:
   - Node.js v18+
   - Docker & Docker Compose

2. **Installation**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   ```bash
   docker-compose up -d
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## API Usage

### Submit Order
**POST** `/api/orders/execute`
```json
{
  "type": "MARKET",
  "side": "BUY",
  "inputToken": "SOL",
  "outputToken": "USDC",
  "amount": 1.5
}
```

### WebSocket Updates
Connect to `ws://localhost:3000/api/orders/ws` to receive real-time status updates.

## Design Decisions

- **Mock DEX Router**: Simulates network delays and price variance to mimic real blockchain conditions without needing a funded wallet.
- **BullMQ**: Chosen for its robust handling of background jobs, retries, and concurrency management, essential for a trading engine.
- **Fastify**: Selected for its low overhead and built-in WebSocket support, ensuring low-latency responses.

## License
ISC
