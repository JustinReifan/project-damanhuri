
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        isPositive: boolean;
    };
    icon: LucideIcon;
    className?: string;
    description?: string;
}

export function MetricCard({ title, value, change, icon: Icon, className, description }: MetricCardProps) {
    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm',
                'hover:border-primary/30 hover:shadow-primary/10 hover:shadow-lg transition-all duration-300',
                className
            )}
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    </div>
                    {change && (
                        <div className={cn(
                            'flex items-center gap-1 text-xs font-medium',
                            change.isPositive ? 'text-green-400' : 'text-red-400'
                        )}>
                            <span>{change.isPositive ? '+' : ''}{change.value}%</span>
                        </div>
                    )}
                </div>
                
                <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {value}
                    </div>
                    {description && (
                        <div className="text-xs text-muted-foreground">
                            {description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
