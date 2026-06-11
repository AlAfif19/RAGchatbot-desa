export function ResponsiveTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
