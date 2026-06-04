import { SectionCard } from '@/components/section-card';
import { requireAdminSession } from '@/lib/auth/admin';
import { listAllDriversAdmin } from '@/lib/services/accounts';

export default async function AdminVehiclesPage() {
  await requireAdminSession();
  const drivers = await listAllDriversAdmin();

  return (
    <SectionCard title="Danh sách xe" description="Thông tin xe được lấy từ hồ sơ tài xế.">
      <div className="grid gap-3 sm:grid-cols-2">
        {drivers.map((driver) => (
          <div key={driver.userId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{driver.plateNumber}</p>
                <p className="text-sm text-slate-400">{driver.vehicleType}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs text-slate-200">
                {driver.approvalStatus}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <p>
                <strong className="text-white">Tài xế:</strong> {driver.driverName}
              </p>
              <p>
                <strong className="text-white">Số ghế:</strong> {driver.seatCount}
              </p>
              <p>
                <strong className="text-white">Khu vực hoạt động:</strong> {driver.serviceArea}
              </p>
              <p>
                <strong className="text-white">Hoạt động:</strong> {driver.active ? 'Đang hoạt động' : 'Không hoạt động'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
