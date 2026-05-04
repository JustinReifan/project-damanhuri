
import { cn } from '@/lib/utils';

interface FunnelStage {
    stage: string;
    count: number;
    percentage: number;
}

interface ConversionFunnelProps {
    data: FunnelStage[];
    className?: string;
}

export function ConversionFunnel({ data, className }: ConversionFunnelProps) {
    const maxCount = Math.max(...data.map(item => item.count));

    return (
        <div className={cn(
            'rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm',
            'hover:border-primary/30 hover:shadow-primary/10 hover:shadow-lg transition-all duration-300',
            className
        )}>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Conversion Funnel</h3>
                <p className="text-sm text-muted-foreground">User journey from visit to payment</p>
            </div>
            
            <div className="space-y-4">
                {data.map((stage, index) => {
                    const width = (stage.count / maxCount) * 100;
                    const isLast = index === data.length - 1;
                    
                    return (
                        <div key={stage.stage} className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground">
                                    {stage.stage}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        {stage.count.toLocaleString()}
                                    </span>
                                    <span className={cn(
                                        'text-xs font-bold px-2 py-1 rounded-full',
                                        isLast 
                                            ? 'bg-primary/20 text-primary' 
                                            : 'bg-muted/20 text-muted-foreground'
                                    )}>
                                        {stage.percentage}%
                                    </span>
                                </div>
                            </div>
                            
                            <div className="h-8 bg-muted/20 rounded-lg overflow-hidden">
                                <div 
                                    className={cn(
                                        'h-full rounded-lg transition-all duration-1000 ease-out',
                                        'bg-gradient-to-r from-primary/60 via-primary to-primary/80',
                                        isLast && 'from-primary via-yellow-400 to-yellow-400'
                                    )}
                                    style={{ 
                                        width: `${width}%`,
                                        animationDelay: `${index * 200}ms`
                                    }}
                                />
                            </div>
                            
                            {index < data.length - 1 && (
                                <div className="flex justify-center mt-2">
                                    <div className="h-6 w-px bg-border/50" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
