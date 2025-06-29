"use client"
import type { ReactNode } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex: string
  width?: string
  sortable?: boolean
  render?: (value: any, record: T, index: number) => ReactNode
  align?: "left" | "center" | "right"
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  className?: string
  rowKey?: string | ((record: T) => string)
  onRowClick?: (record: T, index: number) => void
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (key: string, order: "asc" | "desc") => void
  emptyText?: string
}

export function Table<T = any>({
  columns,
  data,
  loading = false,
  className = "",
  rowKey = "id",
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  emptyText = "No data available",
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record)
    }
    return (record as any)[rowKey] || index.toString()
  }

  const handleSort = (columnKey: string) => {
    if (!onSort) return

    let newOrder: "asc" | "desc" = "asc"
    if (sortBy === columnKey && sortOrder === "asc") {
      newOrder = "desc"
    }
    onSort(columnKey, newOrder)
  }

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
    ) : (
      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
    )
  }

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-300 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.width ? `w-${column.width}` : ""
                  } ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""}`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.dataIndex)}
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      {column.title}
                      {renderSortIcon(column.dataIndex)}
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((column) => {
                    const value = (record as any)[column.dataIndex]
                    const content = column.render ? column.render(value, record, index) : value

                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${
                          column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""
                        }`}
                      >
                        {content}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
