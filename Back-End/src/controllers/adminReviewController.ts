import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { errorResponse } from '../utils/errorResponse.js';
import { formatDisplayId } from '../utils/formatters.js';
import { buildPaginationMeta, getPaginationParams } from '../utils/pagination.js';

function formatReview(record: any) {
  return {
    id: record.id,
    displayId: formatDisplayId(record.id),
    booking: record.booking ? formatDisplayId(record.booking.id) : '—',
    bookingId: record.booking?.id ?? null,
    client: record.client?.fullName ?? '—',
    clientId: record.client?.id ?? null,
    worker: record.worker?.user?.fullName ?? '—',
    workerId: record.worker?.user?.id ?? null,
    rating: record.rating.toFixed(1),
    comment: record.comment ?? '',
    flagged: false,
    flagReason: null,
    status: 'VISIBLE',
    createdAt: record.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

function buildReviewWhere(search: string, flagged?: string): Prisma.ReviewWhereInput {
  const where: Prisma.ReviewWhereInput = {};

  if (search) {
    where.OR = [
      { booking: { id: { contains: search } } },
      { client: { fullName: { contains: search } } },
      { comment: { contains: search } },
    ];
  }

  return where;
}

export const listReviews = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const flagged = typeof req.query.flagged === 'string' ? req.query.flagged : undefined;

    const where = buildReviewWhere(search, flagged);

    const [total, records] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: true,
          client: { select: { id: true, fullName: true } },
          worker: {
            include: {
              user: { select: { id: true, fullName: true } },
            },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: records.map(formatReview),
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error('List reviews error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await prisma.review.findUnique({
      where: { id },
      include: {
        booking: true,
        client: { select: { id: true, fullName: true } },
        worker: {
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    if (!record) {
      return res.status(404).json(errorResponse(404, 'Review not found'));
    }

    return res.json({ success: true, data: formatReview(record) });
  } catch (error) {
    console.error('Get review error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body as {
      rating?: number;
      comment?: string | null;
    };

    const record = await prisma.review.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json(errorResponse(404, 'Review not found'));
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        rating: typeof rating === 'number' ? rating : record.rating,
        comment: comment === undefined ? record.comment : comment,
      },
      include: {
        booking: true,
        client: { select: { id: true, fullName: true } },
        worker: {
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    return res.json({ success: true, data: formatReview(updated) });
  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};