import { Queue } from 'bullmq';

export const VERIFICATION_QUEUE_NAME = 'verification-ai';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const verificationQueue = new Queue(VERIFICATION_QUEUE_NAME, { connection });
