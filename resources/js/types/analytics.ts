// ============================================================
// Labs Analytics — Shared Type Definitions
// Matches the data shapes returned by AbTestingService.php
// ============================================================

// ── Performance Matrix ──────────────────────────────────────

export interface MatrixItem {
    landing_source: string;
    visits: number;
    bounce_rate: number;
    lead_cr: number;
    strict_cr: number;
    rpv: number;
    revenue: number;
    conversions: number;
    intent_rate: number;
    payments: number;
    cta_clicks: number;
}

// ── Split Funnel ────────────────────────────────────────────

export interface FunnelStep {
    stage: string;
    count: number;
    percentage: number;
}

export interface FunnelItem {
    landing_source: string;
    steps: FunnelStep[];
}

// ── Quality / Behavior Analysis ─────────────────────────────

export interface QualityMetrics {
    count: number;
    avg_scroll_depth: number;
    avg_dwell_time: number;
}

export interface QualityItem {
    landing_source: string;
    buyers: QualityMetrics;
    non_buyers: QualityMetrics;
}

// ── Device Performance ──────────────────────────────────────

export interface DeviceMetrics {
    visits: number;
    payments: number;
    conversion_rate: number;
}

export interface DeviceData {
    landing_source: string;
    mobile: DeviceMetrics;
    desktop: DeviceMetrics;
}

// ── CTA Performance ─────────────────────────────────────────

export interface CtaLocation {
    location: string;
    click_count: number;
    conversions: number;
    conversion_rate: number;
}

export interface CtaData {
    landing_source: string;
    cta_locations: CtaLocation[];
    total_clicks: number;
}

// ── Reader / Audience Segmentation ──────────────────────────

export interface Persona {
    name: string;
    description: string;
    count: number;
    percentage: number;
}

export interface ReaderData {
    landing_source: string;
    total_sessions: number;
    personas: Persona[];
}

// ── Scroll Heatmap ──────────────────────────────────────────

export interface DepthAnalysis {
    depth: number;
    sessions: number;
    percentage: number;
}

export interface HeatmapData {
    landing_source: string;
    total_visits: number;
    depth_analysis: DepthAnalysis[];
}

// ── Filters ─────────────────────────────────────────────────

export interface LabsFilters {
    start_date: string;
    end_date: string;
    range: string;
    source?: string | null;
}

// ── Page Props ──────────────────────────────────────────────

export interface LabsPageProps {
    matrix: MatrixItem[];
    funnel: FunnelItem[];
    quality: QualityItem[];
    devices: DeviceData[];
    cta: CtaData[];
    readers: ReaderData[];
    heatmap: HeatmapData[];
    availableSources: string[];
    filters: LabsFilters;
}

// ── Component Props ─────────────────────────────────────────

export interface DeviceComparisonProps {
    data: DeviceData[];
}

export interface CtaAnalysisProps {
    data: CtaData[];
}

export interface AudienceSegmentationProps {
    readers: ReaderData[];
    heatmap: HeatmapData[];
}
