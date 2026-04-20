import { SyncLogListRes, SyncLogResponse } from "@/lib/types/sync-log";
import { addCacheBuster } from "@/lib/utils/cache-buster";
import { buildApiHeaders } from "@/lib/utils/api-headers";
import { toast } from "@/components/common/Toast";
import { useCallback, useMemo } from "react";
import env from "@/env.ts";


export function useSyncLogHandle() {
    const token = localStorage.getItem("token")!

    const getHeaders = useCallback(() => ({
        ...buildApiHeaders({ token }),
    }), [token])

    /**
     * 获取同步日志列表
     */
    const handleSyncLogList = useCallback(async (
        params: {
            vault?: string,
            type?: string,
            action?: string,
            page?: number,
            pageSize?: number
        },
        callback: (data: SyncLogListRes) => void,
        failCallback?: () => void
    ) => {
        try {
            const { vault, type, action, page = 1, pageSize = 20 } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            if (vault) queryParams.append("vault", vault);
            if (type) queryParams.append("type", type);
            if (action) queryParams.append("action", action);

            const url = addCacheBuster(`${env.API_URL}/api/sync-logs?${queryParams.toString()}`);
            const response = await fetch(url, {
                method: "GET",
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const res: SyncLogResponse<SyncLogListRes> = await response.json();
            if (res.code > 0 && res.code <= 200) {
                callback(res.data);
            } else {
                toast.error(res.message);
                if (failCallback) failCallback();
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error));
            if (failCallback) failCallback();
        }
    }, [getHeaders])

    return useMemo(() => ({
        handleSyncLogList,
    }), [handleSyncLogList]);
}
