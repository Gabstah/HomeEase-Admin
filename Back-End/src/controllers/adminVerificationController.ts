import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { errorResponse } from '../utils/errorResponse.js';
import { formatVerification } from '../utils/formatters.js';
import { verificationQueue } from '../queues/verificationQueue.js';

export const listVerifications = async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'PENDING';
    const type =
      typeof req.query.type === 'string' && req.query.type !== 'all'
        ? req.query.type.toUpperCase()
        : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const records = await prisma.verificationRequest.findMany({
      where: {
        status,
        ...(type ? { type } : {}),
        ...(search
          ? {
              OR: [{ user: { fullName: { contains: search } } }, { user: { email: { contains: search } } }],
            }
          : {}),
      },
      include: {
        user: true,
        documents: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    return res.json({
      success: true,
      data: records.map(formatVerification),
    });
  } catch (error) {
    console.error('List verifications error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const getVerificationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true,
      },
    });

    if (!record) {
      return res.status(404).json(errorResponse(404, 'Verification request not found'));
    }

    return res.json({
      success: true,
      data: formatVerification(record),
    });
  } catch (error) {
    console.error('Get verification error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const approveVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminOverrideReason } = req.body;

    const record = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { user: true, documents: true },
    });

    if (!record) {
      return res.status(404).json(errorResponse(404, 'Verification request not found'));
    }

    if (record.status === 'APPROVED') {
      return res.status(400).json(errorResponse(400, 'Verification already approved'));
    }

    const updated = await prisma.$transaction(async (tx) => {
      const verification = await tx.verificationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          rejectReason: null,
          adminOverrideReason: adminOverrideReason?.trim() || null,
          reviewedById: req.user?.userId,
          reviewedAt: new Date(),
        },
        include: { user: true, documents: true },
      });

      if (record.type === 'WORKER') {
        await tx.workerProfile.updateMany({
          where: { userId: record.userId },
          data: { verificationStatus: 'VERIFIED' },
        });
      }

      await tx.user.update({
        where: { id: record.userId },
        data: { status: 'ACTIVE' },
      });

      return verification;
    });

    return res.json({
      success: true,
      message: 'Verification approved successfully',
      data: formatVerification(updated),
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const rejectVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectReason } = req.body;

    if (!rejectReason?.trim()) {
      return res.status(400).json(errorResponse(400, 'Rejection reason is required'));
    }

    const record = await prisma.verificationRequest.findUnique({
      where: { id },
    });

    if (!record) {
      return res.status(404).json(errorResponse(404, 'Verification request not found'));
    }

    const updated = await prisma.$transaction(async (tx) => {
      const verification = await tx.verificationRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectReason: rejectReason.trim(),
          adminOverrideReason: rejectReason.trim(),
          reviewedById: req.user?.userId,
          reviewedAt: new Date(),
        },
        include: { user: true, documents: true },
      });

      if (record.type === 'WORKER') {
        await tx.workerProfile.updateMany({
          where: { userId: record.userId },
          data: { verificationStatus: 'REJECTED' },
        });
      }

      return verification;
    });

    return res.json({
      success: true,
      message: 'Verification rejected',
      data: formatVerification(updated),
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const rerunVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { documents: true, user: true },
    });

    if (!record) {
      return res.status(404).json(errorResponse(404, 'Verification request not found'));
    }

    if (record.status === 'APPROVED') {
      return res.status(400).json(errorResponse(400, 'Cannot rerun AI review for approved verification'));
    }

    await verificationQueue.add('analyze-verification', {
      verificationId: record.id,
      documents: record.documents.map((doc) => ({
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        filePath: doc.filePath,
      })),
      documentType: record.documentType,
      services: record.services ?? null,
    });

    const updated = await prisma.verificationRequest.update({
      where: { id },
      data: {
        aiStatus: 'PENDING',
        aiSummary: null,
        aiConfidence: null,
        aiError: null,
      },
      include: { user: true, documents: true },
    });

    return res.json({
      success: true,
      message: 'AI review rerun queued',
      data: formatVerification(updated),
    });
  } catch (error) {
    console.error('Rerun verification error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};
