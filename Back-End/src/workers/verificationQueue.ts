import { Worker } from 'bullmq';
import { analyzeVerificationDocuments } from '../services/verificationAiService.js';
import prisma from '../config/database.js';

export const VERIFICATION_QUEUE_NAME = 'verification-ai';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
};

export async function startVerificationWorker() {
  const worker = new Worker(
    VERIFICATION_QUEUE_NAME,
    async (job) => {
      const { verificationId, documents, documentType, services } = job.data as {
        verificationId: string;
        documents: Array<{ originalName: string; mimeType: string; filePath: string }>;
        documentType: string;
        services?: string | null;
      };

      const verification = await prisma.verificationRequest.findUnique({ where: { id: verificationId } });
      if (!verification) {
        throw new Error('Verification request not found');
      }

      await analyzeVerificationDocuments(verificationId, documents, documentType, services);
      return { success: true };
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    console.error(`Verification job ${job?.id} failed`, err);
  });

  return worker;
}
