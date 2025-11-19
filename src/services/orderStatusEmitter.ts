import { EventEmitter } from 'node:events';
import Redis from 'ioredis';

class OrderStatusEmitter extends EventEmitter {
    private publisher: Redis;
    private subscriber: Redis;

    constructor() {
        super();
        
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            maxRetriesPerRequest: null,
        };

        this.publisher = new Redis(redisConfig);
        this.subscriber = new Redis(redisConfig);

        // Subscribe to order status updates channel
        this.subscriber.subscribe('order-status-updates', (err: Error | null) => {
            if (err) {
                console.error('Failed to subscribe to order-status-updates:', err);
            } else {
                console.log('Subscribed to order-status-updates channel');
            }
        });

        // Listen for messages from Redis and emit them locally
        this.subscriber.on('message', (channel: string, message: string) => {
            if (channel === 'order-status-updates') {
                try {
                    const data = JSON.parse(message);
                    super.emit('orderStatusUpdate', data);
                } catch (error) {
                    console.error('Error parsing Redis message:', error);
                }
            }
        });
    }

    // Publish order status update to Redis (for multi-instance support)
    async publishStatusUpdate(orderId: string, status: string, txHash?: string, error?: string) {
        const update = {
            orderId,
            status,
            txHash,
            error,
            timestamp: new Date().toISOString(),
        };

        try {
            await this.publisher.publish('order-status-updates', JSON.stringify(update));
            console.log(`Published status update for order ${orderId}: ${status}`);
        } catch (error) {
            console.error('Error publishing status update:', error);
        }
    }

    async close() {
        await this.publisher.quit();
        await this.subscriber.quit();
    }
}

export const orderStatusEmitter = new OrderStatusEmitter();
