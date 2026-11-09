import type { ReactNode } from "react";
import EmptyState from "./EmptyState";

export interface DataTableColumn<T> {
  header: ReactNode;
  key: string;
  className?: string;
  headerClassName?: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  items: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (item: T) => string;
  emptyState: {
    title: string;
    description?: string;
  };
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
}

export default function DataTable<T>({
  items,
  columns,
  getRowKey,
  emptyState,
  className = "",
  headerClassName = "",
  rowClassName = "",
}: DataTableProps<T>) {
  return (
    <div className={`overflow-hidden rounded-xl bg-white ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-left">
          <thead className={headerClassName}>
            <tr className="text-xs font-medium text-zinc-800">
              {columns.map((column) => (
                <th key={column.key} className={column.headerClassName ?? column.className}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={getRowKey(item)}
                className={`border-t border-zinc-100 text-sm ${rowClassName}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && <EmptyState {...emptyState} />}
    </div>
  );
}
