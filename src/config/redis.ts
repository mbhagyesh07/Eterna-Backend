import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null, // Required for BullMQ
};

export const connection = new IORedis(redisConfig);

connection.on('connect', () => {
    console.log('Redis connected successfully');
});

connection.on('error', (err) => {
    console.error('Redis connection error:', err);
});
