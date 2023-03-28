import { useState } from 'react'

import { ProjectInfo } from 'components/lowcode/ProjectList/type'

export function useData(originalRecords: ProjectInfo[]) {
  const [{ currentPage, pageSize }, setPageInfo] = useState({ pageSize: 10, currentPage: 0 })
  const [loading, setLoading] = useState(false)

  async function handleSetPageInfo(nextCurrentPage: number, nextPageSize: number) {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    setLoading(false)
    setPageInfo({ pageSize: nextPageSize, currentPage: nextCurrentPage })
  }

  return {
    records: originalRecords.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
    currentPage,
    pageSize,
    setPageInfo: handleSetPageInfo,
    total: originalRecords.length,
    loading,
    setLoading
  }
}
