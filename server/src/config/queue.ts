import { Queue } from 'bullmq';
import IORedis from 'ioredis';

let connection: IORedis | undefined;
let manuscriptQueue: Queue | undefined;

// Redis/BullMQ disabled - using synchronous processing instead
// If you want to re-enable background jobs, uncomment the code below and ensure Redis is running

/*
try {
    connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
            if (times > 3) {
                console.warn('Redis connection failed. Background jobs will be disabled.');
                return null; // Stop retrying
            }
            return Math.min(times * 50, 2000);
        },
    });

    connection.on('error', (err) => {
        // Suppress unhandled error events to prevent crash
        console.warn('Redis connection error:', err.message);
    });

    manuscriptQueue = new Queue('manuscript-processing', {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        },
    });
} catch (error) {
    console.warn('Failed to initialize Redis queue. Background jobs disabled.');
}
*/

export { manuscriptQueue, connection };
