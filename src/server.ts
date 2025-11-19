import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';
import { orderRoutes } from './routes';
import { orderWorker } from './queue/orderWorker';

dotenv.config();

const server = Fastify({
    logger: true,
});

server.register(websocket);
server.register(orderRoutes);

server.get('/ping', async (request, reply) => {
    return { pong: 'it works!' };
});

const start = async () => {
    try {
        // Ensure worker is running
        console.log('Worker status:', orderWorker.isRunning() ? 'Running' : 'Stopped');

        const port = parseInt(process.env.PORT || '3000');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
