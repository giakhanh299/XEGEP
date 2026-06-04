import Link from 'next/link';
import { ArrowRight, MapPinned, Sparkles, Zap } from 'lucide-react';
import { mockMetrics, routeHighlights } from '@/lib/mock-data';
import { StatCard } from '@/components/stat-card';
import { SectionCard } from '@/components/section-card';

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="glass overflow-hidden rounded-[2rem] border border-white/10">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Đã có tài khoản khách hàng và tài xế
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Xe Ghép Đại Lộc
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Nền tảng đặt xe ghép tối ưu cho điện thoại, có tài khoản khách hàng, tài xế, chọn xe, lịch sử đặt xe và
                quản lý chuyến.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950">
                Đăng nhập
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/vehicles" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white">
                Xem danh sách xe
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {mockMetrics.map((metric) => (
                <StatCard key={metric.label} {...metric} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <SectionCard title="Tuyến chính" description="Tập trung vào tuyến vận hành ban đầu.">
              <div className="space-y-3">
                {routeHighlights.map((route) => (
                  <div key={route.label} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{route.label}</p>
                        <p className="mt-1 text-sm text-slate-300">{route.description}</p>
                      </div>
                      <MapPinned className="h-5 w-5 text-emerald-300" />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Khu vực hệ thống" description="Giữ nguyên luồng cho khách hàng, tài xế và quản trị.">
              <div className="grid gap-3 sm:grid-cols-2">
                {['Đặt chuyến cho khách', 'Chọn xe', 'Bảng điều khiển tài xế', 'Quản lý hồ sơ'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                    <div className="mb-2 flex items-center gap-2 text-emerald-300">
                      <Zap className="h-4 w-4" />
                      Đang hoạt động
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </section>
    </main>
  );
}
