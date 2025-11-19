import { FastifyInstance } from 'fastify';
import { OrderController } from './controllers/orderController';
import { orderStatusEmitter } from './services/orderStatusEmitter';

export async function orderRoutes(fastify: FastifyInstance) {
    fastify.post('/api/orders/execute', OrderController.executeOrder);

    // WebSocket route for real-time status updates
    fastify.get('/api/orders/ws', { websocket: true }, (connection, req) => {
        console.log('Client connected to WebSocket');

        // Subscribe to order status updates
        const statusHandler = (data: any) => {
            try {
                connection.socket.send(JSON.stringify(data));
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
            }
        };

        orderStatusEmitter.on('orderStatusUpdate', statusHandler);

        connection.socket.on('message', message => {
            console.log(`Received message from client: ${message}`);
        });

        connection.socket.on('close', () => {
            console.log('Client disconnected from WebSocket');
            orderStatusEmitter.off('orderStatusUpdate', statusHandler);
        });

        // Send initial connection confirmation
        connection.socket.send(JSON.stringify({
            type: 'connected',
            message: 'WebSocket connection established',
            timestamp: new Date().toISOString()
        }));
    });
}
