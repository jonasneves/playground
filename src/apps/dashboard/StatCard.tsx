interface StatCardProps {
  title: string;
  value: number | string;
}

export function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
    </div>
  );
}
