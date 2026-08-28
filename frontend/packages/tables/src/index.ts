export interface ColumnDef<T = unknown> { id: string; header: string; accessor: keyof T | ((row: T) => unknown); sortable?: boolean; filterable?: boolean; width?: number; }
export interface TableConfig<T = unknown> { columns: ColumnDef<T>[]; data: T[]; pagination?: { pageSize: number; pageIndex: number }; sorting?: { id: string; desc: boolean }[]; globalFilter?: string; virtualScroll?: boolean; }

export class DataTableModel<T = Record<string, unknown>> {
  constructor(private config: TableConfig<T>) {}

  public paginate(page: number, pageSize: number): T[] {
    const start = page * pageSize;
    return this.config.data.slice(start, start + pageSize);
  }

  public getTotalRows(): number {
    return this.config.data.length;
  }
}
