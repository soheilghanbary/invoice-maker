import { cn } from "cn";
import type { ReactNode } from "react";

export function SectionCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("rounded-xl border border-border bg-card", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-b border-border px-5 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {action}
      </div>
      {description && (
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export function SectionBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-5 sm:p-6", className)}>{children}</div>;
}

export function LedgerRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-2", className)}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        aria-hidden="true"
        className="mx-1 min-w-4 flex-1 border-b border-dashed border-border"
      />
      {children}
    </div>
  );
}
