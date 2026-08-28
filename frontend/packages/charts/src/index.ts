export interface ChartData { labels: string[]; datasets: { label: string; data: number[]; color?: string }[]; }
export interface BarChartProps { data: ChartData; stacked?: boolean; horizontal?: boolean; }
export interface LineChartProps { data: ChartData; smooth?: boolean; area?: boolean; }
export interface PieChartProps { data: ChartData; donut?: boolean; }
export interface GaugeChartProps { value: number; min: number; max: number; thresholds: { value: number; color: string }[]; }
export interface FunnelChartProps { stages: { label: string; value: number }[]; }
export interface HeatmapChartProps { data: number[][]; xLabels: string[]; yLabels: string[]; }
export interface SankeyChartProps { nodes: { name: string }[]; links: { source: number; target: number; value: number }[]; }
export interface TreemapChartProps { data: { name: string; value: number; children?: unknown[] }[]; }

export class ChartFormatter {
  static formatCurrency(val: number): string {
    return '$' + val.toLocaleString();
  }

  static formatPercentage(val: number): string {
    return (val * 100).toFixed(1) + '%';
  }
}
