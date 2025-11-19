import { FastifyInstance } from 'fastify';
import { FastifyInstance } from 'fastify';
import { OrderController } from './controllers/orderController';

export async function orderRoutes(fastify: FastifyInstance) {
    fastify.post('/api/orders/execute', OrderController.executeOrder);

    // WebSocket route for status updates
    fastify.get('/api/orders/ws', { websocket: true }, (connection, req) => {
        console.log('Client connected to WebSocket');

        connection.socket.on('message', message => {
            // Handle incoming messages if needed
            console.log(`Received message: ${message}`);
        });

        // Simple way to broadcast updates (in a real app, use Redis PubSub)
        const interval = setInterval(async () => {
            // Keep alive or send periodic updates if needed
        }, 30000);

        connection.socket.on('close', () => {
            clearInterval(interval);
        });
    });
}
