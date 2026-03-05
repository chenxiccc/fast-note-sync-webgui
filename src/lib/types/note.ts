export interface Note {
    id: number
    action: string
    path: string
    pathHash: string
    ctime: number
    mtime: number
    updatedTimestamp: number
    updatedAt: string
    createdAt: string
    version: number
}

export interface NoteDetail extends Note {
    content: string
    contentHash: string
    fileLinks: Record<string, string>
    convertContent?: string
}

export interface NoteResponse<T> {
    code: number
    status: boolean
    message: string
    data: T
    details?: string[]
}

export interface Pager {
    page: number
    pageSize: number
    totalRows: number
}

export interface NoteListResponse {
    list: Note[]
    pager: Pager
}

export interface NoteHistory {
    id: number
    noteId: number
    vaultId: number
    path: string
    clientName: string
    version: number
    createdAt: string
}

export interface NoteHistoryDetail extends NoteHistory {
    content: string
    diffs: { Type: number, Text: string }[]
}

export interface NoteHistoryListResponse {
    list: NoteHistory[]
    pager: Pager
}

/**
 * 笔记重命名请求
 */
export interface NoteRenameRequest {
    vault: string;
    oldPath: string;
    path: string;
    oldPathHash?: string;
    pathHash?: string;
}
