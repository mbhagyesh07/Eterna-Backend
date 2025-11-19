import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { OrderRepository } from '../services/orderRepository';
import { OrderQueueService } from '../queue/orderQueue';

const orderSchema = z.object({
    type: z.enum(['MARKET', 'LIMIT', 'SNIPER']),
    side: z.enum(['BUY', 'SELL']),
    inputToken: z.string(),
    outputToken: z.string(),
    amount: z.number().positive(),
});

const orderRepository = new OrderRepository();

export class OrderController {
    static async executeOrder(req: FastifyRequest, reply: FastifyReply) {
        try {
            const data = orderSchema.parse(req.body);

            const order = await orderRepository.createOrder(data);

            // Add to queue
            await OrderQueueService.addOrder(order);

            console.log(`Order created: ${order.id}`);

            return reply.code(201).send({
                orderId: order.id,
                status: order.status,
                message: 'Order received and queued',
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({ error: 'Validation Error', details: error.errors });
            }
            console.error(error);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
}
