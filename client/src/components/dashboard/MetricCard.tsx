import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MetricCardProps } from "@/types";

export function MetricCard({
  title,
  value,
  maxValue,
  progress = 0,
  trend,
  icon,
  footnote,
  color = "primary"
}: MetricCardProps) {
  const colorClasses = {
    primary: {
      icon: "text-primary-500",
      trend: "text-accent-500",
      progress: "bg-primary-500"
    },
    secondary: {
      icon: "text-secondary-500",
      trend: "text-accent-500",
      progress: "bg-secondary-500"
    },
    accent: {
      icon: "text-accent-500",
      trend: "text-accent-500",
      progress: "bg-accent-500"
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
          <span className={cn("material-icons", colorClasses[color].icon)}>{icon}</span>
        </div>
        <div className="flex items-end">
          <p className="text-2xl font-bold">{value}</p>
          {maxValue && <p className="ml-1 text-sm text-neutral-600">/{maxValue}</p>}
          {trend && (
            <span className={cn("ml-auto text-sm font-medium flex items-center", colorClasses[color].trend)}>
              <span className={cn("material-icons text-sm mr-0.5")}>
                {trend.direction === 'up' ? 'arrow_upward' : 'arrow_downward'}
              </span>
              {trend.value}%
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center">
          <Progress className="h-2.5 w-full" value={progress} />
        </div>
        {footnote && <p className="mt-3 text-xs text-neutral-500">{footnote}</p>}
      </CardContent>
    </Card>
  );
}

export default MetricCard;
