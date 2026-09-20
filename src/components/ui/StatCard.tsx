import { Card, CardContent } from './Card';

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-lg text-primary">
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
