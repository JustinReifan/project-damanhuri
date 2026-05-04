import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPercent, safeNumber, toSafeArray } from '@/lib/safe-data';
import type { DeviceComparisonProps, DeviceMetrics } from '@/types/analytics';
import { AlertTriangle, Monitor, Smartphone } from 'lucide-react';

const DEFAULT_DEVICE: DeviceMetrics = { visits: 0, payments: 0, conversion_rate: 0 };

export function DeviceComparison({ data }: DeviceComparisonProps) {
    const safeData = toSafeArray(data);

    if (safeData.length === 0) {
        return (
            <Card className="py-12 text-center">
                <CardContent>
                    <Smartphone className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
                    <p className="text-muted-foreground">No device performance data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Smartphone className="text-primary h-5 w-5" />
                <div>
                    <h2 className="text-foreground text-xl font-semibold">Device Performance</h2>
                    <p className="text-muted-foreground text-sm">Mobile vs Desktop conversion comparison</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {safeData.map((item) => {
                    const mobile = item.mobile ?? DEFAULT_DEVICE;
                    const desktop = item.desktop ?? DEFAULT_DEVICE;

                    const mobileRate = safeNumber(mobile.conversion_rate);
                    const desktopRate = safeNumber(desktop.conversion_rate);
                    const gap = desktopRate - mobileRate;
                    const isMobileUnderperforming = mobileRate < desktopRate * 0.5 && desktopRate > 0;
                    const maxRate = Math.max(mobileRate, desktopRate, 0.01);

                    return (
                        <Card
                            key={item.landing_source}
                            className={isMobileUnderperforming ? 'border-destructive/50 bg-destructive/5' : ''}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="font-mono text-sm">{item.landing_source}</CardTitle>
                                    {isMobileUnderperforming && (
                                        <Badge variant="destructive" className="gap-1 text-xs">
                                            <AlertTriangle className="h-3 w-3" />
                                            Mobile Issue
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    {isMobileUnderperforming
                                        ? 'Mobile conversion is significantly lower'
                                        : 'Device performance comparison'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Mobile Stats */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <Smartphone className="text-primary h-4 w-4" />
                                            <span className="text-muted-foreground">Mobile</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-xs">
                                                {safeNumber(mobile.visits).toLocaleString()} visits
                                            </span>
                                            <span className={`font-bold ${isMobileUnderperforming ? 'text-destructive' : 'text-foreground'}`}>
                                                {formatPercent(mobileRate, 2)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                                        <div
                                            className={`h-full rounded-full transition-all ${isMobileUnderperforming ? 'bg-destructive' : 'bg-primary'}`}
                                            style={{ width: `${(mobileRate / maxRate) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Desktop Stats */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <Monitor className="text-chart-2 h-4 w-4" />
                                            <span className="text-muted-foreground">Desktop</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-xs">
                                                {safeNumber(desktop.visits).toLocaleString()} visits
                                            </span>
                                            <span className="text-foreground font-bold">{formatPercent(desktopRate, 2)}%</span>
                                        </div>
                                    </div>
                                    <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                                        <div
                                            className="bg-chart-2 h-full rounded-full transition-all"
                                            style={{ width: `${(desktopRate / maxRate) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Gap Indicator */}
                                {gap !== 0 && (
                                    <div className="border-border flex items-center justify-between border-t pt-3 text-xs">
                                        <span className="text-muted-foreground">Gap</span>
                                        <span className={gap > 0 ? 'text-destructive' : 'text-chart-4'}>
                                            {gap > 0 ? '+' : ''}
                                            {formatPercent(gap, 2)}% {gap > 0 ? 'Desktop leads' : 'Mobile leads'}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
