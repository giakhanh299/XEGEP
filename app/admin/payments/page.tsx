import { SectionCard } from '@/components/section-card';
import { mockDriverPayouts, mockPayments } from '@/lib/mock-data';
import { describePaymentMethod, listDriverPayouts, summarizeRevenue } from '@/lib/payments/payments';

export default function AdminPaymentsPage() {
  const summary = summarizeRevenue();
  const payoutCount = listDriverPayouts().length + mockDriverPayouts.length;

  return (
    <div className="grid gap-4">
      <SectionCard title="Revenue summary" description="Daily and monthly revenue placeholders.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Total paid: {summary.totalPaid}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Total unpaid: {summary.totalUnpaid}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Driver payouts: {payoutCount}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Payments" description="Track booking-level payment state.">
        <div className="space-y-3">
          {mockPayments.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="text-white">Booking {payment.bookingId}</p>
              <p>
                Amount: {payment.amount} via {describePaymentMethod(payment.method)}
              </p>
              <p>Status: {payment.status}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
