import { Worker } from 'bullmq';
import { connection } from '../config/redis';
import { OrderRepository } from '../services/orderRepository';
import { MockDexRouter } from '../services/dexRouter';

const orderRepository = new OrderRepository();
const dexRouter = new MockDexRouter();

export const orderWorker = new Worker('order-execution', async job => {
    const order = job.data;
    console.log(`Processing order ${order.id}`);

    try {
        // 1. Update status to ROUTING
        await orderRepository.updateOrderStatus(order.id, 'ROUTING');

        // 2. Get quotes and select best execution
        const quote = await dexRouter.getBestQuote(order.inputToken, order.outputToken, order.amount);
        console.log(`Selected best quote from ${quote.dex} for order ${order.id}`);

        // 3. Update status to BUILDING
        await orderRepository.updateOrderStatus(order.id, 'BUILDING');

        // 4. Execute transaction
        // Update status to SUBMITTED (simulated)
        await orderRepository.updateOrderStatus(order.id, 'SUBMITTED');

        const result = await dexRouter.executeSwap(quote.dex, order);

        // 5. Update status to CONFIRMED
        await orderRepository.updateOrderStatus(order.id, 'CONFIRMED', result.txHash);
        console.log(`Order ${order.id} confirmed: ${result.txHash}`);

        return result;
    } catch (error: any) {
        console.error(`Order ${order.id} failed:`, error);
        await orderRepository.updateOrderStatus(order.id, 'FAILED', undefined, error.message);
        throw error;
    }
}, {
    connection,
    concurrency: 10, // Process up to 10 concurrent orders
});

orderWorker.on('completed', job => {
    console.log(`Job ${job.id} completed!`);
});

orderWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with ${err.message}`);
});
