import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/passwordHash.js';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'HomeEaseAdmin@gmail.com';
  const adminPassword = 'Admin1234';
  const workerEmail = 'pedro.g@email.com';
  const workerPassword = 'Worker1234';
  const clientEmail = 'maria.s@email.com';
  const clientPassword = 'Client1234';

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        fullName: 'HomeEase Admin',
        email: adminEmail,
        phone: '+639171234567',
        password: await hashPassword(adminPassword),
        role: 'ADMIN',
      },
    });
    console.log('Admin created:', adminEmail, '/', adminPassword);
  }

  let worker = await prisma.user.findUnique({ where: { email: workerEmail } });

  if (!worker) {
    worker = await prisma.user.create({
      data: {
        fullName: 'Pedro Garcia',
        email: workerEmail,
        phone: '+639181234567',
        password: await hashPassword(workerPassword),
        role: 'WORKER',
        workerProfile: {
          create: {
            services: 'Electrical, HVAC',
            verificationStatus: 'PENDING',
          },
        },
      },
    });
    console.log('Worker created:', workerEmail, '/', workerPassword);
  }

  let client = await prisma.user.findUnique({ where: { email: clientEmail } });

  if (!client) {
    client = await prisma.user.create({
      data: {
        fullName: 'Maria Santos',
        email: clientEmail,
        phone: '+639191234567',
        password: await hashPassword(clientPassword),
        role: 'CLIENT',
        clientProfile: {
          create: {
            address: 'Quezon City, Metro Manila',
          },
        },
      },
    });
    console.log('Client created:', clientEmail, '/', clientPassword);
  }

  const existingVerification = await prisma.verificationRequest.findFirst({
    where: { userId: worker!.id },
  });

  if (existingVerification) {
    await prisma.verificationRequest.delete({
      where: { id: existingVerification.id },
    });
    console.log('Removed old verification for worker so a fresh one can be created');
  }

  await prisma.verificationRequest.create({
    data: {
      userId: worker!.id,
      type: 'WORKER',
      documentType: 'ID + Proof of Address',
      services: 'Electrical, HVAC',
      status: 'PENDING',
      aiStatus: 'PENDING',
      documents: {
        create: [
          {
            fileName: 'seed-government-id.pdf',
            originalName: 'Government ID.pdf',
            mimeType: 'application/pdf',
            filePath: 'seed-government-id.pdf',
            fileSize: 0,
          },
          {
            fileName: 'seed-proof-of-address.pdf',
            originalName: 'Proof of Address.pdf',
              mimeType: 'application/pdf',
              filePath: 'seed-proof-of-address.pdf',
              fileSize: 0,
            },
          ],
        },
      },
    });

    await prisma.workerProfile.updateMany({
      where: { userId: worker!.id },
      data: { verificationStatus: 'PENDING' },
    });

    console.log('Sample pending verification created for worker');

  const bookingCount = await prisma.booking.count();

  if (bookingCount === 0 && client && worker) {
    const booking1 = await prisma.booking.create({
      data: {
        clientId: client.id,
        workerId: worker.id,
        serviceType: 'Electrical Repair',
        status: 'COMPLETED',
        scheduledAt: new Date('2025-03-01T14:00:00'),
        amount: 620,
      },
    });

    const booking2 = await prisma.booking.create({
      data: {
        clientId: client.id,
        workerId: worker.id,
        serviceType: 'HVAC Maintenance',
        status: 'PENDING',
        scheduledAt: new Date('2025-03-05T10:00:00'),
        amount: 450,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking1.id,
        userId: client.id,
        amount: 620,
        status: 'COMPLETED',
        method: 'GCash',
      },
    });

    await prisma.dispute.create({
      data: {
        bookingId: booking2.id,
        raisedById: client.id,
        reason: 'Worker did not arrive at scheduled time',
        status: 'OPEN',
        notes: 'Client reports the worker did not arrive at the scheduled time.',
      },
    });

    await prisma.review.create({
      data: {
        bookingId: booking1.id,
        clientId: client.id,
        workerId: worker.id,
        rating: 4.9,
        comment: 'Very professional and completed the work on time.',
        flagged: false,
        status: 'VISIBLE',
      },
    });

    await prisma.workerProfile.updateMany({
      where: { userId: worker.id },
      data: { reviewCount: 1 },
    });

    console.log('Sample bookings, payment, dispute, and review created');
  }
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
