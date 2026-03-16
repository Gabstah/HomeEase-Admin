export const CLIENTS = [
  {
    id: '1001',
    displayId: '#1001',
    name: 'Maria Santos',
    email: 'maria.s@email.com',
    phone: '0917 123 4567',
    status: 'active',
    bookings: 12,
    spent: '₱4,240',
    joined: 'Jan 15, 2025',
  },
  {
    id: '1003',
    displayId: '#1003',
    name: 'Ana Reyes',
    email: 'ana.r@email.com',
    phone: '0919 345 6789',
    status: 'active',
    bookings: 5,
    spent: '₱1,890',
    joined: 'Feb 10, 2025',
  },
  {
    id: '1004',
    displayId: '#1004',
    name: 'Pedro Garcia',
    email: 'pedro.g@email.com',
    phone: '0920 456 7890',
    status: 'active',
    bookings: 3,
    spent: '₱1,240',
    joined: 'Feb 20, 2025',
  },
]

export const WORKERS = [
  {
    id: 'W501',
    displayId: '#W501',
    name: 'Juan Dela Cruz',
    email: 'juan.d@email.com',
    services: 'Plumbing, Wiring, Installation',
    rating: '4.9',
    reviews: 128,
    status: 'Verified',
    earnings: '₱18,450',
    joined: 'Dec 10, 2024',
    verification: 'Verified',
  },
  {
    id: 'W502',
    displayId: '#W502',
    name: 'Maria Santos',
    email: 'maria.s@email.com',
    services: 'Cleaning, Laundry',
    rating: '4.8',
    reviews: 95,
    status: 'Verified',
    earnings: '₱12,100',
    joined: 'Jan 05, 2025',
    verification: 'Verified',
  },
  {
    id: 'W503',
    displayId: '#W503',
    name: 'Pedro Garcia',
    email: 'pedro.g@email.com',
    services: 'Electrical, HVAC',
    rating: '4.7',
    reviews: 82,
    status: 'Pending',
    earnings: '₱0',
    joined: 'Feb 01, 2025',
    verification: 'Pending',
  },
]

export function getClientById(id) {
  return CLIENTS.find((c) => c.id === id) || null
}

export function getWorkerById(id) {
  return WORKERS.find((w) => w.id === id) || null
}

