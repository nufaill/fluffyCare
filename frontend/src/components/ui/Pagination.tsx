"use client"

import type React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface PaginationProps {
  current: number
  total: number
  pageSize: number
  onChange: (page: number, pageSize?: number) => void
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode)
  pageSizeOptions?: number[]
  className?: string
  disabled?: boolean
}

export function Pagination({
  current = 1,
  total = 0,
  pageSize = 10,
  onChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
  disabled = false,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (current - 1) * pageSize + 1
  const endIndex = Math.min(current * pageSize, total)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current && !disabled) {
      onChange(page, pageSize)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    if (!disabled) {
      const newPage = Math.min(current, Math.ceil(total / newPageSize))
      onChange(newPage, newPageSize)
    }
  }

  const renderPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5 // Number of page buttons to show

    if (totalPages <= showPages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      if (current > 3) {
        pages.push("...")
      }

      // Show pages around current page
      const start = Math.max(2, current - 1)
      const end = Math.min(totalPages - 1, current + 1)

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }

      if (current < totalPages - 2) {
        pages.push("...")
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const renderTotal = () => {
    if (!showTotal) return null

    if (typeof showTotal === "function") {
      return showTotal(total, [startIndex, endIndex])
    }

    return (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        Showing {startIndex} to {endIndex} of {total} entries
      </span>
    )
  }

  if (totalPages <= 1 && !showTotal) return null

  return (
    <div
      className={`flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-600 ${className}`}
    >
      <div className="flex items-center gap-4">
        {renderTotal()}

        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={disabled}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showQuickJumper && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-16 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const page = Number.parseInt((e.target as HTMLInputElement).value)
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page)
                  }
                }
              }}
              disabled={disabled}
            />
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current - 1)}
          disabled={current <= 1 || disabled}
          className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {renderPageNumbers().map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  variant={current === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  disabled={disabled}
                  className={
                    current === page
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                      : "text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current + 1)}
          disabled={current >= totalPages || disabled}
          className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
