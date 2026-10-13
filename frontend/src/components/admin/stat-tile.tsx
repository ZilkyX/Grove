import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  isLoading?: boolean;
}

export function StatTile({ label, value, icon: Icon, isLoading }: StatTileProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center bg-secondary text-secondary-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {label}
          </span>
          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <span className="font-heading text-xl font-semibold">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
