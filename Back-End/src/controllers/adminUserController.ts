import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { errorResponse } from '../utils/errorResponse.js';
import { formatDisplayId, formatPeso, mapUserStatus } from '../utils/formatters.js';
import { buildPaginationMeta, getPaginationParams } from '../utils/pagination.js';

function buildClientSearchWhere(search: string, status?: string): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { role: 'CLIENT' };

  if (status && status !== 'all') {
    where.status = status.toUpperCase();
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  return where;
}

async function formatClient(user: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: Date;
}) {
  const bookings = await prisma.booking.findMany({
    where: { clientId: user.id },
    select: { amount: true, status: true },
  });

  const totalSpent = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);

  return {
    id: user.id,
    displayId: formatDisplayId(user.id),
    name: user.fullName,
    email: user.email,
    phone: user.phone,
    status: mapUserStatus(user.status),
    bookings: bookings.length,
    spent: formatPeso(totalSpent),
    joined: user.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

export const listClients = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.toLowerCase() : 'all';

    const where = buildClientSearchWhere(search, status);

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const data = await Promise.all(users.map(formatClient));

    return res.json({
      success: true,
      data,
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error('List clients error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id, role: 'CLIENT' },
    });

    if (!user) {
      return res.status(404).json(errorResponse(404, 'Client not found'));
    }

    const client = await formatClient(user);

    const recentBookings = await prisma.booking.findMany({
      where: { clientId: id },
      include: {
        worker: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return res.json({
      success: true,
      data: {
        ...client,
        recentBookings: recentBookings.map((b) => ({
          id: formatDisplayId(b.id),
          bookingId: b.id,
          service: b.serviceType,
          worker: b.worker?.fullName ?? '—',
          date: b.scheduledAt
            ? b.scheduledAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : b.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
          status: b.status,
          amount: b.amount != null ? formatPeso(b.amount) : '—',
        })),
      },
    });
  } catch (error) {
    console.error('Get client error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

function buildWorkerSearchWhere(search: string, status?: string): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { role: 'WORKER' };

  if (status === 'verified') {
    where.workerProfile = { verificationStatus: 'VERIFIED' };
  } else if (status === 'pending') {
    where.workerProfile = { verificationStatus: 'PENDING' };
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { email: { contains: search } },
      { workerProfile: { services: { contains: search } } },
    ];
  }

  return where;
}

async function formatWorker(user: {
  id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: Date;
  workerProfile: {
    services: string | null;
    rating: number;
    reviewCount: number;
    verificationStatus: string;
  } | null;
}) {
  const completedBookings = await prisma.booking.findMany({
    where: { workerId: user.id, status: 'COMPLETED' },
    select: { amount: true },
  });

  const earnings = completedBookings.reduce((sum, b) => sum + (b.amount ?? 0), 0);

  const verificationStatus = user.workerProfile?.verificationStatus ?? 'PENDING';
  const statusLabel =
    verificationStatus === 'VERIFIED'
      ? 'Verified'
      : verificationStatus === 'REJECTED'
        ? 'Rejected'
        : 'Pending';

  return {
    id: user.id,
    displayId: formatDisplayId(user.id),
    name: user.fullName,
    email: user.email,
    services: user.workerProfile?.services ?? '—',
    rating: user.workerProfile?.rating.toFixed(1) ?? '0.0',
    reviews: user.workerProfile?.reviewCount ?? 0,
    status: statusLabel,
    verification: statusLabel,
    earnings: formatPeso(earnings),
    joined: user.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

export const listWorkers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.toLowerCase() : 'all';

    const where = buildWorkerSearchWhere(search, status);

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { workerProfile: true },
      }),
    ]);

    const data = await Promise.all(users.map(formatWorker));

    return res.json({
      success: true,
      data,
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error('List workers error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id, role: 'WORKER' },
      include: { workerProfile: true },
    });

    if (!user) {
      return res.status(404).json(errorResponse(404, 'Worker not found'));
    }

    const worker = await formatWorker(user);

    const recentBookings = await prisma.booking.findMany({
      where: { workerId: id },
      include: { client: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return res.json({
      success: true,
      data: {
        ...worker,
        recentBookings: recentBookings.map((b) => ({
          id: formatDisplayId(b.id),
          bookingId: b.id,
          client: b.client.fullName,
          service: b.serviceType,
          date: b.scheduledAt
            ? b.scheduledAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : b.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
          earnings: b.amount != null ? formatPeso(b.amount) : '—',
          status: b.status,
        })),
      },
    });
  } catch (error) {
    console.error('Get worker error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};
