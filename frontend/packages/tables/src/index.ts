export interface ColumnDef<T = unknown> { id: string; header: string; accessor: keyof T | ((row: T) => unknown); sortable?: boolean; filterable?: boolean; width?: number; }
export interface TableConfig<T = unknown> { columns: ColumnDef<T>[]; data: T[]; pagination?: { pageSize: number; pageIndex: number }; sorting?: { id: string; desc: boolean }[]; globalFilter?: string; virtualScroll?: boolean; }
