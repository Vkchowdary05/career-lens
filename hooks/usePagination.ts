import { useState, useMemo } from 'react'

interface PaginationOptions {
  itemsPerPage?: number
  initialPage?: number
}

export function usePagination<T>(
  items: T[],
  options: PaginationOptions = {}
) {
  const { itemsPerPage = 10, initialPage = 1 } = options
  const [currentPage, setCurrentPage] = useState(initialPage)

  const pagination = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = items.slice(startIndex, endIndex)

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      currentItems,
      totalItems: items.length,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }
  }, [items, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, pagination.totalPages))
    setCurrentPage(pageNumber)
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  return {
    ...pagination,
    goToPage,
    nextPage,
    prevPage,
  }
}
