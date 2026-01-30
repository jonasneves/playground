interface StatCardProps {
  title: string;
  value: number | string;
}

export function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
      <h3 className="text-sm font-medium text-neutral-600 mb-2">{title}</h3>
      <div className="text-3xl font-semibold text-neutral-900">{value}</div>
    </div>
  );
}
