import { MockDexRouter } from '../src/services/dexRouter';
import { OrderQueueService } from '../src/queue/orderQueue';

describe('MockDexRouter', () => {
    const router = new MockDexRouter();

    it('should return a quote from Raydium', async () => {
        const quote = await router.getRaydiumQuote('SOL', 'USDC', 1);
        expect(quote.dex).toBe('RAYDIUM');
        expect(quote.price).toBeGreaterThan(0);
    });

    it('should return a quote from Meteora', async () => {
        const quote = await router.getMeteoraQuote('SOL', 'USDC', 1);
        expect(quote.dex).toBe('METEORA');
        expect(quote.price).toBeGreaterThan(0);
    });

    it('should select the best quote', async () => {
        const quote = await router.getBestQuote('SOL', 'USDC', 1);
        expect(['RAYDIUM', 'METEORA']).toContain(quote.dex);
    });
});

describe('OrderQueueService', () => {
    it('should add an order to the queue', async () => {
        const order = { id: 'test-order', type: 'MARKET', amount: 1 };
        const job = await OrderQueueService.addOrder(order);
        expect(job.id).toBeDefined();
    });
});
