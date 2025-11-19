import { PrismaClient, Order } from '@prisma/client';

const prisma = new PrismaClient();

export class OrderRepository {
    async createOrder(data: {
        type: string;
        side: string;
        inputToken: string;
        outputToken: string;
        amount: number;
    }): Promise<Order> {
        return prisma.order.create({
            data: {
                ...data,
                status: 'PENDING',
            },
        });
    }

    async getOrderById(id: string): Promise<Order | null> {
        return prisma.order.findUnique({
            where: { id },
        });
    }

    async updateOrderStatus(id: string, status: string, txHash?: string, error?: string): Promise<Order> {
        return prisma.order.update({
            where: { id },
            data: {
                status,
                txHash,
                error,
            },
        });
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
