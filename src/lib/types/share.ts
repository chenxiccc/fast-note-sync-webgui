export interface ShareNoteInfo {
  id: number
  path: string
  vault_name: string
  ctime: number
  mtime: number
  version: number
}

// 对应 dto.ShareListItem
export interface ShareItem {
  id: number
  uid: number
  title: string           // 资源标题（笔记标题或文件名）
  url: string             // 分享链接路径，例如 /share/1/token
  res: Record<string, string[]>
  status: number          // 1: active, 2: cancelled
  token?: string          // 按路径查询单个分享时有
  view_count: number
  last_viewed_at: string
  expires_at: string
  created_at: string
  updated_at: string
  note_info?: ShareNoteInfo  // 后端可能附加返回
}

// 对应 dto.ShareListResponse (data 部分)
export interface ShareListResponse {
  list: ShareItem[]
  pager: {
    page: number
    pageSize: number
    totalRows: number
  }
}

// 对应 dto.ShareCreateResponse（创建分享 / 按路径查询单个分享的响应）
export interface ShareCreateResponse {
  id: number
  token: string
  type: string            // "note" | "file"
  url: string             // 分享链接路径
  expires_at: string
}

// 取消分享请求（对应 dto.ShareCancelRequest）
export interface ShareCancelRequest {
  id?: number
  path?: string
  pathHash?: string
  vault: string
}
