export interface ShareNoteInfo {
  id: number
  path: string
  vault_name: string
  ctime: number
  mtime: number
  version: number
}

export interface ShareItem {
  id: number
  uid: number
  res: Record<string, string[]>
  status: number          // 1: active, 2: cancelled
  token?: string          // Share token (only for active shares)
  view_count: number
  last_viewed_at: string
  expires_at: string
  created_at: string
  updated_at: string
  note_info?: ShareNoteInfo
}

export interface ShareListResponse {
  items: ShareItem[] | null
}
