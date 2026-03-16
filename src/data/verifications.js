export const VERIFICATIONS = [
  {
    id: 'v-pedro',
    name: 'Pedro Garcia',
    email: 'pedro.g@email.com',
    type: 'worker',
    services: 'Electrical, HVAC',
    submitted: 'Feb 28, 2025',
    documentType: 'ID + Proof of Address',
    documents: ['Government ID', 'Proof of Address'],
  },
  {
    id: 'v-rosa',
    name: 'Rosa Martinez',
    email: 'rosa.m@email.com',
    type: 'worker',
    services: 'Cleaning',
    submitted: 'Feb 27, 2025',
    documentType: 'ID + Proof of Address',
    documents: ['Government ID', 'Proof of Address'],
  },
  {
    id: 'v-maria',
    name: 'Maria Santos',
    email: 'maria.s@email.com',
    type: 'client',
    services: 'Account verification',
    submitted: 'Mar 2, 2025',
    documentType: 'Valid ID',
    documents: ['Government ID'],
  },
]

export function getVerificationById(id) {
  return VERIFICATIONS.find((v) => v.id === id) || null
}

