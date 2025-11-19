import { PrismaClient, Order } from '@prisma/client';
import { orderStatusEmitter } from './orderStatusEmitter';

const prisma = new PrismaClient();

export class OrderRepository {
    async createOrder(data: {
        type: string;
        side: string;
        inputToken: string;
        outputToken: string;
        amount: number;
    }): Promise<Order> {
        const order = await prisma.order.create({
            data: {
                ...data,
                status: 'PENDING',
            },
        });

        // Publish initial status
        await orderStatusEmitter.publishStatusUpdate(order.id, 'PENDING');

        return order;
    }

    async getOrderById(id: string): Promise<Order | null> {
        return prisma.order.findUnique({
            where: { id },
        });
    }

    async updateOrderStatus(id: string, status: string, txHash?: string, error?: string): Promise<Order> {
        const order = await prisma.order.update({
            where: { id },
            data: {
                status,
                txHash,
                error,
            },
        });

        // Publish status update to Redis for WebSocket broadcasting
        await orderStatusEmitter.publishStatusUpdate(id, status, txHash, error);

        return order;
    }

    async getActiveOrders(): Promise<Order[]> {
        return prisma.order.findMany({
            where: {
                status: {
                    in: ['PENDING', 'ROUTING', 'BUILDING', 'SUBMITTED'],
                },
            },
        });
    }
}
