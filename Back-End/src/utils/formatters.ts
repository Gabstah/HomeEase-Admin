import { Prisma } from '@prisma/client';

export function formatVerification(
  record: Prisma.VerificationRequestGetPayload<{ include: { user: true; documents: true } }>
) {
  return {
    id: record.id,
    name: record.user.fullName,
    email: record.user.email,
    phone: record.user.phone,
    userId: record.user.id,
    type: record.type.toLowerCase(),
    documentType: record.documentType,
    services: record.services ?? '—',
    status: record.status,
    rejectReason: record.rejectReason,
    adminOverrideReason: record.adminOverrideReason ?? null,
    aiStatus: record.aiStatus ?? 'PENDING',
    aiSummary: record.aiSummary ?? null,
    aiConfidence: record.aiConfidence ?? null,
    aiError: record.aiError ?? null,
    submitted: record.submittedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    documents: record.documents.map((doc) => ({
      id: doc.id,
      name: doc.originalName,
      mimeType: doc.mimeType,
      url: `/uploads/verifications/${doc.fileName}`,
      fileSize: doc.fileSize,
      uploadedAt: doc.uploadedAt.toISOString(),
    })),
  };
}

export function formatDisplayId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function formatPeso(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function mapUserStatus(status: string) {
  return status.toLowerCase();
}
