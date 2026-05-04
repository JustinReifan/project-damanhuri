import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import {
    formatCurrency,
    formatDuration,
    formatNumber,
    formatPercent,
    safeNumber,
    toSafeArray,
} from '@/lib/safe-data';
import type {
    FunnelItem,
    LabsPageProps,
    MatrixItem,
    QualityMetrics,
} from '@/types/analytics';

import { DateRangePicker } from '@/components/date-range-picker';
import { AudienceSegmentation } from '@/components/labs/audience-segmentation';
import { CtaAnalysis } from '@/components/labs/cta-analysis';
import { DeviceComparison } from '@/components/labs/device-comparison';
import { Head, router, useHttp } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import {
    Activity,
    AlertTriangle,
    ArrowUpDown,
    BarChart3,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    Filter,
    FlaskConical,
    MousePointerClick,
    RefreshCw,
    Target,
    TrendingUp,
    Trophy,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// ==================== HELPERS ====================

const transformFunnelData = (
    funnel: FunnelItem[],
    selectedSources: string[],
) => {
    if (funnel.length === 0 || selectedSources.length === 0) return [];

    const stages = ['Visits', 'Engaged', 'Intent', 'Leads', 'Sales'];

    return stages.map((stage) => {
        const dataPoint: Record<string, string | number> = { name: stage };

        selectedSources.forEach((source) => {
            const funnelItem = funnel.find((f) => f.landing_source === source);
            if (funnelItem) {
                const steps = toSafeArray(funnelItem.steps);
                const step = steps.find((s) => s.stage === stage);
                dataPoint[source] = step?.count ?? 0;
            }
        });

        return dataPoint;
    });
};

const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

// ==================== MAIN COMPONENT ====================

export default function LabsIndex({
    matrix: rawMatrix,
    funnel: rawFunnel,
    quality: rawQuality,
    devices: rawDevices,
    cta: rawCta,
    readers: rawReaders,
    heatmap: rawHeatmap,
    availableSources: rawAvailableSources,
    filters,
}: LabsPageProps) {
    // Normalise all props — PHP Collections can serialize as objects
    const matrix = toSafeArray<MatrixItem>(rawMatrix);
    const safeFunnel = toSafeArray<FunnelItem>(rawFunnel);
    const quality = toSafeArray(rawQuality);
    const devices = toSafeArray(rawDevices);
    const cta = toSafeArray(rawCta);
    const readers = toSafeArray(rawReaders);
    const heatmap = toSafeArray(rawHeatmap);
    const availableSources = toSafeArray<string>(rawAvailableSources);

    // useHttp for cache-clear (replaces deprecated axios)
    const http = useHttp({
        range: filters.range,
        source: filters.source ?? '',
        start_date: filters.start_date,
        end_date: filters.end_date,
    });
    // State
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sortColumn, setSortColumn] = useState<keyof MatrixItem>('rpv');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Date range state for custom filter
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (filters.start_date && filters.end_date) {
            return {
                from: parse(filters.start_date, 'yyyy-MM-dd', new Date()),
                to: parse(filters.end_date, 'yyyy-MM-dd', new Date()),
            };
        }
        return undefined;
    });

    const triggerToast = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
        }, 4000);
    };

    const [selectedFunnelSources, setSelectedFunnelSources] = useState<
        string[]
    >(() => {
        // Default: Top 2 by RPV
        return matrix.slice(0, 2).map((m) => m.landing_source);
    });

    const itemsPerPage = 10;

    // Find winner (highest RPV)
    const winner = useMemo(() => {
        if (matrix.length === 0) return null;
        return matrix.reduce((prev, curr) =>
            curr.rpv > prev.rpv ? curr : prev,
        );
    }, [matrix]);

    // Sorted matrix data
    const sortedMatrix = useMemo(() => {
        return [...matrix].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (sortDirection === 'asc') {
                return (aVal as number) > (bVal as number) ? 1 : -1;
            }
            return (aVal as number) < (bVal as number) ? 1 : -1;
        });
    }, [matrix, sortColumn, sortDirection]);

    // Paginated matrix
    const paginatedMatrix = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedMatrix.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedMatrix, currentPage]);

    const totalPages = Math.ceil(sortedMatrix.length / itemsPerPage);

    // Transform funnel data for chart
    const chartData = useMemo(() => {
        return transformFunnelData(safeFunnel, selectedFunnelSources);
    }, [safeFunnel, selectedFunnelSources]);

    // Handlers
    const handleRangeChange = (value: string) => {
        if (value === 'custom') {
            // Just show the date picker, don't trigger router yet
            router.get(
                '/admin/labs',
                {
                    range: 'custom',
                    start_date: filters.start_date,
                    end_date: filters.end_date,
                    source: filters.source || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        } else {
            // Preset range - trigger immediately
            router.get(
                '/admin/labs',
                {
                    range: value,
                    source: filters.source || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }
    };

    const handleDateUpdate = (date: DateRange | undefined) => {
        setDateRange(date);
        // Only trigger router if both dates are selected
        if (date?.from && date?.to) {
            router.get(
                '/admin/labs',
                {
                    range: 'custom',
                    start_date: format(date.from, 'yyyy-MM-dd'),
                    end_date: format(date.to, 'yyyy-MM-dd'),
                    source: filters.source || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }
    };

    const handleSourceChange = (value: string) => {
        const sourceValue = value === 'all' ? undefined : value;
        const params: Record<string, string | undefined> = {
            range: filters.range,
            source: sourceValue,
        };
        // Preserve custom date range parameters
        if (filters.range === 'custom') {
            params.start_date = filters.start_date;
            params.end_date = filters.end_date;
        }
        router.get('/admin/labs', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearSource = () => {
        const params: Record<string, string | undefined> = {
            range: filters.range,
            source: undefined,
        };
        // Preserve custom date range parameters
        if (filters.range === 'custom') {
            params.start_date = filters.start_date;
            params.end_date = filters.end_date;
        }
        router.get('/admin/labs', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleRefreshCache = () => {
        setIsRefreshing(true);
        http.post('/admin/labs/clear-cache', {
            onSuccess: () => {
                triggerToast('Data cached successfully', 'success');
                router.reload();
            },
            onError: () => {
                triggerToast('Failed to cache data', 'error');
            },
            onFinish: () => {
                setIsRefreshing(false);
            },
        });
    };

    const handleSort = (column: keyof MatrixItem) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const toggleFunnelSource = (source: string) => {
        setSelectedFunnelSources((prev) =>
            prev.includes(source)
                ? prev.filter((s) => s !== source)
                : [...prev, source],
        );
    };

    const hasData = matrix.length > 0;

    return (
        <AdminLayout>
            <Head title="A/B Testing Labs" />

            <div className="container mx-auto space-y-8 p-4 md:p-6">
                {showToast && (
                    <div className="animate-fade-in fixed top-20 right-4 z-50 w-auto max-w-sm">
                        <Alert
                            className={
                                toastType === 'success'
                                    ? 'border-primary/50 bg-primary/10 backdrop-blur-sm'
                                    : 'border-red-500/50 bg-red-900/50 backdrop-blur-sm'
                            }
                        >
                            {toastType === 'success' ? (
                                <CheckCircle className="h-4 w-4 text-primary" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                            )}
                            <AlertDescription
                                className={
                                    toastType === 'success'
                                        ? 'font-medium text-primary'
                                        : 'font-medium text-red-300'
                                }
                            >
                                {toastMessage}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* ==================== CONTROL BAR ==================== */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                            <FlaskConical className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                                A/B Testing Labs
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Optimize your landing page performances
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Source Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={filters.source || 'all'}
                                onValueChange={handleSourceChange}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="All Sources" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Sources
                                    </SelectItem>
                                    {availableSources.map((source) => (
                                        <SelectItem key={source} value={source}>
                                            {source === 'direct'
                                                ? 'Direct Traffic'
                                                : source}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {filters.source && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearSource}
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Date Range Dropdown */}
                        <Select
                            value={filters.range}
                            onValueChange={handleRangeChange}
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">Last 3 Days</SelectItem>
                                <SelectItem value="5">Last 5 Days</SelectItem>
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="14">Last 14 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="custom">
                                    Custom Range
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Custom Date Range Picker - Conditional */}
                        {filters.range === 'custom' && (
                            <DateRangePicker
                                date={dateRange}
                                onUpdate={handleDateUpdate}
                            />
                        )}

                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleRefreshCache}
                            disabled={isRefreshing}
                            className="gap-2"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                            />
                            <span className="hidden sm:inline">
                                Refresh Data
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Date Range Info & Active Filters */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>
                        Showing data from{' '}
                        <span className="font-medium text-foreground">
                            {filters.start_date}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium text-foreground">
                            {filters.end_date}
                        </span>
                    </span>
                    {filters.source && (
                        <Badge variant="secondary" className="gap-1">
                            <Filter className="h-3 w-3" />
                            {filters.source === 'direct'
                                ? 'Direct Traffic'
                                : filters.source}
                        </Badge>
                    )}
                </div>

                {!hasData ? (
                    <Card className="py-16 text-center">
                        <CardContent>
                            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">
                                No Analytics Data
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                                There's no data available for the selected
                                filters. Try adjusting the date range or source
                                filter.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* ==================== SECTION A: PERFORMANCE MATRIX ==================== */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Trophy className="h-5 w-5 text-primary" />
                                    <div>
                                        <CardTitle>
                                            Performance Matrix
                                        </CardTitle>
                                        <CardDescription>
                                            Landing page comparison sorted by
                                            Revenue Per Visit
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Desktop Table */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                                                    Source
                                                </th>
                                                <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                                                    <button
                                                        onClick={() =>
                                                            handleSort('visits')
                                                        }
                                                        className="flex items-center gap-1 hover:text-foreground"
                                                    >
                                                        <Eye className="h-4 w-4" />{' '}
                                                        Visits
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                                                    <button
                                                        onClick={() =>
                                                            handleSort(
                                                                'bounce_rate',
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-foreground"
                                                    >
                                                        Bounce
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                                                    <button
                                                        onClick={() =>
                                                            handleSort(
                                                                'conversions',
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-foreground"
                                                    >
                                                        <MousePointerClick className="h-4 w-4" />{' '}
                                                        Intent
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                                                    <button
                                                        onClick={() =>
                                                            handleSort(
                                                                'lead_cr',
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-foreground"
                                                    >
                                                        Lead CR
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                                                    <button
                                                        onClick={() =>
                                                            handleSort(
                                                                'strict_cr',
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-foreground"
                                                    >
                                                        <Target className="h-4 w-4" />{' '}
                                                        Sales CR
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                                                    <button
                                                        onClick={() =>
                                                            handleSort('rpv')
                                                        }
                                                        className="flex items-center gap-1 hover:text-foreground"
                                                    >
                                                        <TrendingUp className="h-4 w-4" />{' '}
                                                        RPV
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                                                    Revenue
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedMatrix.map((item) => {
                                                const isWinner =
                                                    winner &&
                                                    item.landing_source ===
                                                        winner.landing_source;
                                                const isHighBounce =
                                                    item.bounce_rate > 80;

                                                return (
                                                    <tr
                                                        key={
                                                            item.landing_source
                                                        }
                                                        className="border-b border-border transition hover:bg-muted/50"
                                                    >
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-sm font-medium text-foreground">
                                                                    {
                                                                        item.landing_source
                                                                    }
                                                                </span>
                                                                {isWinner && (
                                                                    <Badge
                                                                        variant="default"
                                                                        className="gap-1 bg-chart-4 text-foreground"
                                                                    >
                                                                        <Trophy className="h-3 w-3" />{' '}
                                                                        Winner
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 font-medium text-foreground">
                                                            {formatNumber(
                                                                item.visits,
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <span
                                                                className={
                                                                    isHighBounce
                                                                        ? 'font-medium text-destructive'
                                                                        : 'text-foreground'
                                                                }
                                                            >
                                                                {formatPercent(
                                                                    item.bounce_rate,
                                                                    1,
                                                                )}
                                                                %
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-foreground">
                                                            {formatPercent(
                                                                item.intent_rate,
                                                                2,
                                                            )}
                                                            %
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge variant="secondary">
                                                                {formatPercent(
                                                                    item.lead_cr,
                                                                    2,
                                                                )}
                                                                %
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge variant="outline">
                                                                {formatPercent(
                                                                    item.strict_cr,
                                                                    2,
                                                                )}
                                                                %
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4">
                                                            <span
                                                                className={`font-bold ${isWinner ? 'text-chart-4' : 'text-foreground'}`}
                                                            >
                                                                {formatCurrency(
                                                                    item.rpv,
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-foreground">
                                                            {formatCurrency(
                                                                item.revenue,
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="space-y-4 lg:hidden">
                                    {paginatedMatrix.map((item) => {
                                        const isWinner =
                                            winner &&
                                            item.landing_source ===
                                                winner.landing_source;
                                        const isHighBounce =
                                            item.bounce_rate > 80;

                                        return (
                                            <Card
                                                key={item.landing_source}
                                                className={`${isWinner ? 'border-2 border-chart-4' : ''}`}
                                            >
                                                <CardContent className="space-y-3 pt-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono font-medium text-foreground">
                                                            {
                                                                item.landing_source
                                                            }
                                                        </span>
                                                        {isWinner && (
                                                            <Badge
                                                                variant="default"
                                                                className="gap-1 bg-chart-4 text-foreground"
                                                            >
                                                                <Trophy className="h-3 w-3" />{' '}
                                                                Winner
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">
                                                                Visits:
                                                            </span>{' '}
                                                            <span className="font-medium text-foreground">
                                                                {formatNumber(
                                                                    item.visits,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">
                                                                Bounce:
                                                            </span>{' '}
                                                            <span
                                                                className={
                                                                    isHighBounce
                                                                        ? 'text-destructive'
                                                                        : 'text-foreground'
                                                                }
                                                            >
                                                                {formatPercent(
                                                                    item.bounce_rate,
                                                                    1,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">
                                                                Lead CR:
                                                            </span>{' '}
                                                            <Badge variant="secondary">
                                                                {formatPercent(
                                                                    item.lead_cr,
                                                                    2,
                                                                )}
                                                                %
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">
                                                                Sales CR:
                                                            </span>{' '}
                                                            <Badge variant="outline">
                                                                {formatPercent(
                                                                    item.strict_cr,
                                                                    2,
                                                                )}
                                                                %
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">
                                                                RPV:
                                                            </span>{' '}
                                                            <span
                                                                className={`font-bold ${isWinner ? 'text-chart-4' : 'text-foreground'}`}
                                                            >
                                                                {formatCurrency(
                                                                    item.rpv,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">
                                                                Revenue:
                                                            </span>{' '}
                                                            <span className="text-foreground">
                                                                {formatCurrency(
                                                                    item.revenue,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-center gap-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.max(
                                                        1,
                                                        currentPage - 1,
                                                    ),
                                                )
                                            }
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.min(
                                                        totalPages,
                                                        currentPage + 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* ==================== SECTION B: SPLIT FUNNEL ==================== */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-primary" />
                                        <div>
                                            <CardTitle>Split Funnel</CardTitle>
                                            <CardDescription>
                                                Compare conversion journey
                                                across landing pages
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Source Selector */}
                                <div className="flex flex-wrap gap-4">
                                    {safeFunnel.map((f, index) => (
                                        <div
                                            key={f.landing_source}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`funnel-${f.landing_source}`}
                                                checked={selectedFunnelSources.includes(
                                                    f.landing_source,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleFunnelSource(
                                                        f.landing_source,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`funnel-${f.landing_source}`}
                                                className="flex cursor-pointer items-center gap-2 text-sm"
                                            >
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            CHART_COLORS[
                                                                index %
                                                                    CHART_COLORS.length
                                                            ],
                                                    }}
                                                />
                                                {f.landing_source}
                                            </Label>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart */}
                                {selectedFunnelSources.length > 0 ? (
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={chartData}
                                                margin={{
                                                    top: 20,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    className="stroke-border"
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    className="fill-muted-foreground text-xs"
                                                />
                                                <YAxis className="fill-muted-foreground text-xs" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor:
                                                            'var(--popover)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '8px',
                                                        color: 'var(--popover-foreground)',
                                                    }}
                                                    formatter={(
                                                        value,
                                                        name,
                                                    ) => [
                                                        formatNumber(
                                                            Number(value ?? 0),
                                                        ),
                                                        String(name ?? ''),
                                                    ]}
                                                />
                                                <Legend />
                                                {selectedFunnelSources.map(
                                                    (source, index) => (
                                                        <Bar
                                                            key={source}
                                                            dataKey={source}
                                                            fill={
                                                                CHART_COLORS[
                                                                    safeFunnel.findIndex(
                                                                        (f) =>
                                                                            f.landing_source ===
                                                                            source,
                                                                    ) %
                                                                        CHART_COLORS.length
                                                                ]
                                                            }
                                                            radius={[
                                                                4, 4, 0, 0,
                                                            ]}
                                                        />
                                                    ),
                                                )}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-muted-foreground">
                                        Select at least one landing page to view
                                        the funnel chart
                                    </div>
                                )}

                                {/* Funnel Details Table */}
                                {selectedFunnelSources.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="p-3 text-left font-medium text-muted-foreground">
                                                        Stage
                                                    </th>
                                                    {selectedFunnelSources.map(
                                                        (source) => (
                                                            <th
                                                                key={source}
                                                                className="p-3 text-left font-medium text-muted-foreground"
                                                            >
                                                                {source}
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    'Visits',
                                                    'Engaged',
                                                    'Intent',
                                                    'Leads',
                                                    'Sales',
                                                ].map((stage) => (
                                                    <tr
                                                        key={stage}
                                                        className="border-b border-border"
                                                    >
                                                        <td className="p-3 font-medium text-foreground">
                                                            {stage}
                                                        </td>
                                                        {selectedFunnelSources.map(
                                                            (source) => {
                                                                const funnelItem =
                                                                    safeFunnel.find(
                                                                        (f) =>
                                                                            f.landing_source ===
                                                                            source,
                                                                    );
                                                                const steps =
                                                                    toSafeArray(
                                                                        funnelItem?.steps,
                                                                    );
                                                                const step =
                                                                    steps.find(
                                                                        (s) =>
                                                                            s.stage ===
                                                                            stage,
                                                                    );
                                                                return (
                                                                    <td
                                                                        key={
                                                                            source
                                                                        }
                                                                        className="p-3"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-foreground">
                                                                                {formatNumber(
                                                                                    step?.count ??
                                                                                        0,
                                                                                )}
                                                                            </span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                (
                                                                                {formatPercent(
                                                                                    step?.percentage,
                                                                                    1,
                                                                                )}
                                                                                %)
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                );
                                                            },
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* ==================== SECTION C: DEVICE PERFORMANCE ==================== */}
                        {devices && devices.length > 0 && (
                            <DeviceComparison data={devices} />
                        )}

                        {/* ==================== SECTION D: CTA ANALYSIS ==================== */}
                        {cta && cta.length > 0 && <CtaAnalysis data={cta} />}

                        {/* ==================== SECTION E: AUDIENCE SEGMENTATION ==================== */}
                        {((readers && readers.length > 0) ||
                            (heatmap && heatmap.length > 0)) && (
                            <AudienceSegmentation
                                readers={readers || []}
                                heatmap={heatmap || []}
                            />
                        )}

                        {/* ==================== SECTION F: QUALITY ANALYSIS ==================== */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground">
                                        Behavior Analysis
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Buyers vs Non-Buyers engagement
                                        comparison
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {quality.map((item) => {
                                    const defaultMetrics: QualityMetrics = {
                                        count: 0,
                                        avg_scroll_depth: 0,
                                        avg_dwell_time: 0,
                                    };
                                    const buyers =
                                        item.buyers ?? defaultMetrics;
                                    const nonBuyers =
                                        item.non_buyers ?? defaultMetrics;

                                    const scrollGap = Math.abs(
                                        buyers.avg_scroll_depth -
                                            nonBuyers.avg_scroll_depth,
                                    );
                                    const dwellGap = Math.abs(
                                        buyers.avg_dwell_time -
                                            nonBuyers.avg_dwell_time,
                                    );
                                    const hasSignificantGap =
                                        scrollGap > 30 || dwellGap > 60;

                                    return (
                                        <Card
                                            key={item.landing_source}
                                            className={
                                                hasSignificantGap
                                                    ? 'border-chart-4/50'
                                                    : ''
                                            }
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="font-mono text-sm">
                                                        {item.landing_source}
                                                    </CardTitle>
                                                    {hasSignificantGap && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-chart-4 text-xs text-chart-4"
                                                        >
                                                            High Gap
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Scroll Depth Comparison */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <TrendingUp className="h-3 w-3" />{' '}
                                                            Scroll Depth
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-primary">
                                                                Buyers (
                                                                {buyers.count})
                                                            </span>
                                                            <span className="font-medium text-foreground">
                                                                {formatPercent(
                                                                    buyers.avg_scroll_depth,
                                                                    1,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full bg-primary transition-all"
                                                                style={{
                                                                    width: `${Math.min(buyers.avg_scroll_depth, 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">
                                                                Others (
                                                                {
                                                                    nonBuyers.count
                                                                }
                                                                )
                                                            </span>
                                                            <span className="text-foreground">
                                                                {formatPercent(
                                                                    nonBuyers.avg_scroll_depth,
                                                                    1,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full bg-muted-foreground transition-all"
                                                                style={{
                                                                    width: `${Math.min(nonBuyers.avg_scroll_depth, 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dwell Time Comparison */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <Clock className="h-3 w-3" />{' '}
                                                            Dwell Time
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-primary">
                                                                {formatDuration(
                                                                    buyers.avg_dwell_time,
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Buyers
                                                            </div>
                                                        </div>
                                                        <div className="text-xl text-muted-foreground">
                                                            vs
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-foreground">
                                                                {formatDuration(
                                                                    nonBuyers.avg_dwell_time,
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Others
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
