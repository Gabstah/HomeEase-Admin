import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { errorResponse } from '../utils/errorResponse.js';
import { formatVerification } from '../utils/formatters.js';
import { verificationQueue } from '../queues/verificationQueue.js';

export const uploadVerificationDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse(401, 'Unauthorized'));
    }

    const { documentType, services } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!documentType) {
      return res.status(400).json(errorResponse(400, 'documentType is required'));
    }

    if (!files?.length) {
      return res.status(400).json(errorResponse(400, 'At least one document file is required'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json(errorResponse(404, 'User not found'));
    }

    if (user.role !== 'CLIENT' && user.role !== 'WORKER') {
      return res.status(403).json(errorResponse(403, 'Only clients and workers can submit verification'));
    }

    const verification = await prisma.verificationRequest.create({
      data: {
        userId: user.id,
        type: user.role,
        documentType,
        services: services || null,
        status: 'PENDING',
        aiStatus: 'PENDING',
        documents: {
          create: files.map((file) => ({
            fileName: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            filePath: file.path,
            fileSize: file.size,
          })),
        },
      },
      include: {
        user: true,
        documents: true,
      },
    });

    await verificationQueue.add('analyze-verification', {
      verificationId: verification.id,
      documents: verification.documents.map((doc) => ({
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        filePath: doc.filePath,
      })),
      documentType,
      services: services || null,
    });

    if (user.role === 'WORKER') {
      await prisma.workerProfile.updateMany({
        where: { userId: user.id },
        data: { verificationStatus: 'PENDING' },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Verification documents uploaded successfully',
      data: formatVerification(verification),
    });
  } catch (error) {
    console.error('Upload verification error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const getMyVerifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse(401, 'Unauthorized'));
    }

    const records = await prisma.verificationRequest.findMany({
      where: { userId: req.user.userId },
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
    console.error('Get my verifications error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};
