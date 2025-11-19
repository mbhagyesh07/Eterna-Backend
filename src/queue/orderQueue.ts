import { Queue } from 'bullmq';
import { connection } from '../config/redis';

export const orderQueue = new Queue('order-execution', {
    connection,
});

export class OrderQueueService {
    static async addOrder(order: any) {
        return orderQueue.add('execute-order', order, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
    }
}
