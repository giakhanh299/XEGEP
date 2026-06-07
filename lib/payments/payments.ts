import { randomUUID } from 'crypto';
import { DriverPayoutRecord, PaymentMethod, PaymentRecord, PaymentStatus } from '@/lib/types';

const payments: PaymentRecord[] = [];
const payouts: DriverPayoutRecord[] = [];

export function createPayment(input: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  const payment: PaymentRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...input
  };
  payments.unshift(payment);
  return payment;
}

export function updatePaymentStatus(paymentId: string, status: PaymentStatus) {
  const payment = payments.find((item) => item.id === paymentId);
  if (!payment) return null;
  payment.status = status;
  payment.updatedAt = new Date().toISOString();
  return payment;
}

export function issueDriverPayout(driverId: string, amount: number, tripId?: string) {
  const payout: DriverPayoutRecord = {
    id: randomUUID(),
    driverId,
    tripId: tripId ?? null,
    amount,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  payouts.unshift(payout);
  return payout;
}

export function summarizeRevenue() {
  return payments.reduce(
    (summary, payment) => {
      if (payment.status === 'paid') {
        summary.totalPaid += payment.amount;
      }
      if (payment.status === 'unpaid') {
        summary.totalUnpaid += payment.amount;
      }
      return summary;
    },
    { totalPaid: 0, totalUnpaid: 0 }
  );
}

export function listPayments() {
  return payments;
}

export function listDriverPayouts() {
  return payouts;
}

export function describePaymentMethod(method: PaymentMethod) {
  return method === 'cash' ? 'Tiền mặt' : method === 'bank_transfer' ? 'Chuyển khoản' : 'Thanh toán QR';
}
