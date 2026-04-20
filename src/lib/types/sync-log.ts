export interface SyncLogItem {
    id: number;
    vaultId: number;
    type: string;
    action: string;
    changedFields: string;
    path: string;
    pathHash: string;
    size: number;
    clientName: string;
    status: number;
    message: string;
    createdAt: string;
}

export interface SyncLogListRes {
    list: SyncLogItem[];
    pager: {
        totalRows: number;
        page: number;
        pageSize: number;
    };
}

export interface SyncLogResponse<T> {
    code: number;
    message: string;
    data: T;
}
