import { Order } from '@prisma/client';

export interface Quote {
    dex: 'RAYDIUM' | 'METEORA';
    price: number;
    fee: number;
    amountOut: number;
}

export class MockDexRouter {
    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private getBasePrice(inputToken: string, outputToken: string): number {
        // Mock base prices
        const prices: Record<string, number> = {
            'SOL-USDC': 150.0,
            'USDC-SOL': 1 / 150.0,
            'BONK-SOL': 0.00001,
            'SOL-BONK': 100000,
        };
        const key = `${inputToken}-${outputToken}`;
        return prices[key] || 1.0; // Default 1:1 if unknown
    }

    async getRaydiumQuote(inputToken: string, outputToken: string, amount: number): Promise<Quote> {
        await this.sleep(200); // Simulate network delay
        const basePrice = this.getBasePrice(inputToken, outputToken);
        const variance = 0.98 + Math.random() * 0.04; // +/- 2%
        const price = basePrice * variance;

        return {
            dex: 'RAYDIUM',
            price,
            fee: 0.003, // 0.3%
            amountOut: amount * price * (1 - 0.003),
        };
    }

    async getMeteoraQuote(inputToken: string, outputToken: string, amount: number): Promise<Quote> {
        await this.sleep(200);
        const basePrice = this.getBasePrice(inputToken, outputToken);
        const variance = 0.97 + Math.random() * 0.05; // +/- 2.5%
        const price = basePrice * variance;

        return {
            dex: 'METEORA',
            price,
            fee: 0.002, // 0.2%
            amountOut: amount * price * (1 - 0.002),
        };
    }

    async getBestQuote(inputToken: string, outputToken: string, amount: number): Promise<Quote> {
        const [raydiumQuote, meteoraQuote] = await Promise.all([
            this.getRaydiumQuote(inputToken, outputToken, amount),
            this.getMeteoraQuote(inputToken, outputToken, amount),
        ]);

        console.log('Quotes received:', { raydium: raydiumQuote, meteora: meteoraQuote });

        // Simple comparison based on amountOut
        return raydiumQuote.amountOut > meteoraQuote.amountOut ? raydiumQuote : meteoraQuote;
    }

    async executeSwap(dex: string, order: Order): Promise<{ txHash: string; executedPrice: number }> {
        console.log(`Executing swap on ${dex} for order ${order.id}...`);
        // Simulate execution delay
        await this.sleep(2000 + Math.random() * 1000);

        // Simulate success/fail (mostly success)
        if (Math.random() < 0.05) {
            throw new Error('Swap execution failed due to slippage or network error');
        }

        return {
            txHash: 'tx_' + Math.random().toString(36).substring(7),
            executedPrice: 150.0, // Simplified, would match quote in real app
        };
    }
}
