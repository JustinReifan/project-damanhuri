import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPercent, safeNumber, toSafeArray } from '@/lib/safe-data';
import type { AudienceSegmentationProps, DepthAnalysis, Persona } from '@/types/analytics';
import { Eye, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PERSONA_COLORS: Record<string, string> = {
    Bouncers: 'var(--destructive)',
    Skimmers: 'var(--chart-3)',
    'Deep Readers': 'var(--chart-4)',
    Casuals: 'var(--chart-2)',
};

const DEPTH_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

type TabType = 'personas' | 'heatmap';

export function AudienceSegmentation({ readers, heatmap }: AudienceSegmentationProps) {
    const [activeTab, setActiveTab] = useState<TabType>('personas');

    const safeReaders = toSafeArray(readers);
    const safeHeatmap = toSafeArray(heatmap);

    // Transform readers data for stacked bar chart
    const personaChartData = useMemo(() => {
        return safeReaders.map((r) => {
            const dataPoint: Record<string, string | number> = { name: r.landing_source };
            const personas = toSafeArray<Persona>(r.personas);
            personas.forEach((p) => {
                dataPoint[p.name] = safeNumber(p.percentage);
            });
            return dataPoint;
        });
    }, [safeReaders]);

    // Transform heatmap data for bar chart
    const heatmapChartData = useMemo(() => {
        const depths = [25, 50, 75, 90];
        return depths.map((depth) => {
            const dataPoint: Record<string, string | number> = { name: `${depth}%`, depth };
            safeHeatmap.forEach((h) => {
                const depthAnalysis = toSafeArray<DepthAnalysis>(h.depth_analysis);
                const analysis = depthAnalysis.find((d) => d.depth === depth);
                dataPoint[h.landing_source] = safeNumber(analysis?.percentage);
            });
            return dataPoint;
        });
    }, [safeHeatmap]);

    const personaNames = useMemo(() => {
        if (safeReaders.length === 0) return [];
        const personas = toSafeArray<Persona>(safeReaders[0].personas);
        return personas.map((p) => p.name);
    }, [safeReaders]);

    const landingSources = safeHeatmap.map((h) => h.landing_source);
    const hasData = safeReaders.length > 0 || safeHeatmap.length > 0;

    if (!hasData) {
        return (
            <Card className="py-12 text-center">
                <CardContent>
                    <Users className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
                    <p className="text-muted-foreground">No audience segmentation data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Users className="text-primary h-5 w-5" />
                <div>
                    <h2 className="text-foreground text-xl font-semibold">Audience Segmentation</h2>
                    <p className="text-muted-foreground text-sm">User behavior patterns and content consumption</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    {/* Tab Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('personas')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                                activeTab === 'personas' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            Personas
                        </button>
                        <button
                            onClick={() => setActiveTab('heatmap')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                                activeTab === 'heatmap' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            <Eye className="h-4 w-4" />
                            Scroll Heatmap
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeTab === 'personas' && safeReaders.length > 0 && (
                        <div className="space-y-6">
                            <div>
                                <CardTitle className="text-base">Behavioral Personas</CardTitle>
                                <CardDescription>Traffic composition by reader type</CardDescription>
                            </div>

                            <div className="border-border/50 bg-muted/20 space-y-3 rounded-lg border p-4">
                                {/* Persona Legend */}
                                <div className="flex flex-wrap gap-4">
                                    {personaNames.map((name) => (
                                        <div key={name} className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PERSONA_COLORS[name] }} />
                                            <span className="text-muted-foreground text-sm">{name}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Persona Descriptions */}
                                <div className="border-border/50 text-muted-foreground grid grid-cols-1 gap-x-4 gap-y-2 border-t pt-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-foreground flex items-center gap-1 font-semibold">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--destructive)]"></span> Bouncers
                                        </span>
                                        <span>Scroll &lt; 25% & Dwell &lt; 15s (Immediate exit)</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-foreground flex items-center gap-1 font-semibold">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--chart-3)]"></span> Skimmers
                                        </span>
                                        <span>Scroll &gt; 75% & Dwell &lt; 60s (Scanning only)</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-foreground flex items-center gap-1 font-semibold">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--chart-4)]"></span> Deep Readers
                                        </span>
                                        <span>Total Dwell Time &gt; 2 mins (Highly engaged)</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-foreground flex items-center gap-1 font-semibold">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--chart-2)]"></span> Casuals
                                        </span>
                                        <span>Moderate scroll & dwell time</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stacked Bar Chart */}
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={personaChartData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis type="number" domain={[0, 100]} unit="%" className="fill-muted-foreground text-xs" />
                                        <YAxis dataKey="name" type="category" className="fill-muted-foreground text-xs" width={70} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--popover)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '8px',
                                                color: 'var(--popover-foreground)',
                                            }}
                                            formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`]}
                                        />
                                        {personaNames.map((name) => (
                                            <Bar key={name} dataKey={name} stackId="a" fill={PERSONA_COLORS[name]} />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Insight Cards */}
                            <div className="grid gap-3 md:grid-cols-2">
                                {safeReaders.map((r) => {
                                    const rPersonas = toSafeArray<Persona>(r.personas);
                                    const bouncers = rPersonas.find((p) => p.name === 'Bouncers');
                                    const deepReaders = rPersonas.find((p) => p.name === 'Deep Readers');
                                    const hasIssue = safeNumber(bouncers?.percentage) > 50;
                                    const hasWin = safeNumber(deepReaders?.percentage) > 20;

                                    return (
                                        <div
                                            key={r.landing_source}
                                            className={`rounded-lg border p-3 ${
                                                hasIssue
                                                    ? 'border-destructive/50 bg-destructive/10'
                                                    : hasWin
                                                      ? 'border-chart-4/50 bg-chart-4/10'
                                                      : 'border-border'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-foreground font-mono text-sm font-medium">{r.landing_source}</span>
                                                {hasIssue && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        High Bounce
                                                    </Badge>
                                                )}
                                                {hasWin && !hasIssue && <Badge className="bg-chart-4 text-foreground text-xs">Engaged</Badge>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                {rPersonas.map((p) => (
                                                    <div key={p.name} className="flex justify-between">
                                                        <span className="text-muted-foreground">{p.name}:</span>
                                                        <span className="text-foreground font-medium">{formatPercent(p.percentage, 1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'heatmap' && safeHeatmap.length > 0 && (
                        <div className="space-y-6">
                            <div>
                                <CardTitle className="text-base">Scroll Depth Heatmap</CardTitle>
                                <CardDescription>Content consumption drop-off visualization</CardDescription>
                            </div>

                            {/* Grouped Bar Chart */}
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={heatmapChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis dataKey="name" className="fill-muted-foreground text-xs" />
                                        <YAxis domain={[0, 100]} unit="%" className="fill-muted-foreground text-xs" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--popover)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '8px',
                                                color: 'var(--popover-foreground)',
                                            }}
                                            formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`]}
                                        />
                                        <Legend />
                                        {landingSources.map((source, index) => (
                                            <Bar
                                                key={source}
                                                dataKey={source}
                                                fill={DEPTH_COLORS[index % DEPTH_COLORS.length]}
                                                radius={[4, 4, 0, 0]}
                                            />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Drop-off Analysis */}
                            <div className="space-y-3">
                                <h4 className="text-foreground text-sm font-medium">Drop-off Analysis</h4>
                                {safeHeatmap.map((h) => {
                                    const depths = toSafeArray<DepthAnalysis>(h.depth_analysis).sort(
                                        (a, b) => safeNumber(a.depth) - safeNumber(b.depth),
                                    );
                                    const hasCliff =
                                        depths.length >= 2 && safeNumber(depths[0].percentage) - safeNumber(depths[1].percentage) > 40;

                                    return (
                                        <div
                                            key={h.landing_source}
                                            className={`rounded-lg border p-3 ${hasCliff ? 'border-destructive/50' : 'border-border'}`}
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-foreground font-mono text-sm font-medium">{h.landing_source}</span>
                                                {hasCliff && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Drop-off Cliff
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {depths.map((d) => (
                                                    <div key={d.depth} className="flex-1">
                                                        <div className="mb-1 text-center text-xs">
                                                            <span className="text-muted-foreground">{d.depth}%</span>
                                                        </div>
                                                        <div className="bg-muted h-8 w-full overflow-hidden rounded">
                                                            <div
                                                                className="bg-primary h-full transition-all"
                                                                style={{
                                                                    height: `${safeNumber(d.percentage)}%`,
                                                                    opacity: 0.4 + (safeNumber(d.percentage) / 100) * 0.6,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="mt-1 text-center text-xs font-medium">
                                                            {formatPercent(d.percentage, 0)}%
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'personas' && safeReaders.length === 0 && (
                        <p className="text-muted-foreground py-8 text-center">No persona data available</p>
                    )}

                    {activeTab === 'heatmap' && safeHeatmap.length === 0 && (
                        <p className="text-muted-foreground py-8 text-center">No heatmap data available</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
