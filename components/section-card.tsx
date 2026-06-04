import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionCard({
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('glass rounded-[1.75rem] p-5', className)}>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
