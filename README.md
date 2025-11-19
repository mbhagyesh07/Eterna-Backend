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

**Response**:
```json
{
  "orderId": "uuid",
  "status": "PENDING",
  "message": "Order received and queued"
}
```

### WebSocket Real-time Updates
Connect to `ws://localhost:3000/api/orders/ws` to receive real-time order status updates.

**Connection**:
```javascript
const ws = new WebSocket('ws://localhost:3000/api/orders/ws');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(update);
  // { orderId, status, txHash?, error?, timestamp }
};
```

**Status Flow**:
- `PENDING` → Order received and queued
- `ROUTING` → Fetching quotes from DEXs
- `BUILDING` → Building transaction
- `SUBMITTED` → Transaction submitted to blockchain
- `CONFIRMED` → Transaction confirmed (includes txHash)
- `FAILED` → Order failed (includes error message)

**Test WebSocket**: Open `websocket-test.html` in your browser for a live monitoring dashboard.

## Design Decisions

- **Mock DEX Router**: Simulates network delays and price variance to mimic real blockchain conditions without needing a funded wallet.
- **BullMQ**: Chosen for its robust handling of background jobs, retries, and concurrency management, essential for a trading engine.
- **Fastify**: Selected for its low overhead and built-in WebSocket support, ensuring low-latency responses.

## License
ISC
