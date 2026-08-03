import { useEffect, useMemo, useState } from 'react'
import { activityLogService } from '@/services/activityLogService'
import type { ActivityLog } from '@/models'
import type { ActivityLogRow } from '@/types/activityLog'
import { timestampToMillis } from '@/utils/formatTimestamp'

interface UseActivityLogsResult {
  logs: ActivityLog[]
  rows: ActivityLogRow[]
  loading: boolean
  error: string | null
}

function buildRows(logs: ActivityLog[]): ActivityLogRow[] {
  return logs.map((log) => ({
    id: log.id,
    createdAt: timestampToMillis(log.createdAt),
    module: log.module,
    action: log.action,
    performedByName: log.performedByName || '—',
    targetName: log.targetName || '—',
    description: log.description || '—',
    performedByUid: log.performedByUid,
    targetId: log.targetId,
    metadata: log.metadata,
  }))
}

/** Real-time activity logs for the audit trail page. */
export function useActivityLogs(): UseActivityLogsResult {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = activityLogService.subscribeToActivityLogs(
      (nextLogs) => {
        setLogs(nextLogs)
        setLoading(false)
        setError(null)
      },
      (subscribeError) => {
        setLoading(false)
        setError(subscribeError.message || 'Failed to load activity logs.')
      },
    )

    return unsubscribe
  }, [])

  const rows = useMemo(() => buildRows(logs), [logs])

  return {
    logs,
    rows,
    loading,
    error,
  }
}
