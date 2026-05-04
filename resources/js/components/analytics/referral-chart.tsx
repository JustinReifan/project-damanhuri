import { cn } from '@/lib/utils';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ReferralData {
    referral_source: string;
    count: number;
}

interface ReferralChartProps {
    data: ReferralData[];
    className?: string;
}

const COLORS = [
    'oklch(0.75 0.15 85)', // primary
    'oklch(0.6 0.12 184)', // chart-2
    'oklch(0.4 0.07 227)', // chart-3
    'oklch(0.83 0.19 84)', // chart-4
    'oklch(0.77 0.19 70)', // chart-5
];

export function ReferralChart({ data, className }: ReferralChartProps) {
    const chartData = data.map((item, index) => ({
        name: item.referral_source === 'direct' ? 'Direct' : item.referral_source,
        value: item.count,
        color: COLORS[index % COLORS.length],
    }));

    return (
        <div
            className={cn(
                'border-border/50 bg-card/30 rounded-xl border p-6 backdrop-blur-sm',
                'hover:border-primary/30 hover:shadow-primary/10 transition-all duration-300 hover:shadow-lg',
                className,
            )}
        >
            <div className="mb-4">
                <h3 className="text-foreground text-lg font-semibold">Traffic Sources</h3>
                <p className="text-muted-foreground text-sm">Top referral sources breakdown</p>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="oklch(0.06 0 0)" strokeWidth={2}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'oklch(0.75 0.15 85)',
                                border: '1px solid oklch(0.15 0 0)',
                                borderRadius: '8px',
                                color: 'oklch(0.98 0 0)',
                            }}
                            formatter={(value: number) => [value.toLocaleString(), 'Visits']}
                        />
                        <Legend
                            wrapperStyle={{
                                fontSize: '12px',
                                color: 'oklch(0.65 0 0)',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
