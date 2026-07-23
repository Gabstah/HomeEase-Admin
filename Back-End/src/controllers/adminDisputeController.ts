import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { errorResponse } from '../utils/errorResponse.js';
import { formatDisplayId } from '../utils/formatters.js';
import { buildPaginationMeta, getPaginationParams } from '../utils/pagination.js';

function formatDispute(record: Prisma.DisputeGetPayload<{ include: { booking: { include: { worker: { select: { fullName: true } } } }; raisedBy: { select: { id: true; fullName: true } } } }>) {
  return {
    id: record.id,
    displayId: formatDisplayId(record.id),
    booking: record.booking ? formatDisplayId(record.booking.id) : '—',
    bookingId: record.booking?.id ?? null,
    raisedBy: record.raisedBy.fullName,
    raisedById: record.raisedBy.id,
    worker: record.booking?.worker?.fullName ?? '—',
    amount: record.booking?.amount ?? null,
    reason: record.reason,
    status: record.status,
    notes: record.notes,
    resolution: record.resolution,
    createdAt: record.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

function buildDisputeWhere(search: string, status?: string): Prisma.DisputeWhereInput {
  const where: Prisma.DisputeWhereInput = {};

  if (status && status.toLowerCase() !== 'all') {
    where.status = status.toUpperCase();
  }

  if (search) {
    where.OR = [
      { booking: { id: { contains: search } } },
      { raisedBy: { fullName: { contains: search } } },
      { reason: { contains: search } },
      { notes: { contains: search } },
      { resolution: { contains: search } },
    ];
  }

  return where;
}

export const listDisputes = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : 'all';

    const where = buildDisputeWhere(search, status);

    const [total, records] = await Promise.all([
      prisma.dispute.count({ where }),
      prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              worker: { select: { fullName: true } },
            },
          },
          raisedBy: { select: { id: true, fullName: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: records.map(formatDispute),
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error('List disputes error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const updateDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolution, notes } = req.body as {
      status?: string;
      resolution?: string | null;
      notes?: string | null;
    };

    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return res.status(404).json(errorResponse(404, 'Dispute not found'));
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        status: status ? status.toUpperCase() : dispute.status,
        resolution: resolution === undefined ? dispute.resolution : resolution,
        notes: notes === undefined ? dispute.notes : notes,
      },
      include: {
        booking: {
          include: {
            worker: { select: { fullName: true } },
          },
        },
        raisedBy: { select: { id: true, fullName: true } },
      },
    });

    return res.json({ success: true, data: formatDispute(updated) });
  } catch (error) {
    console.error('Update dispute error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};
