import { ShareListResponse, ShareCreateResponse } from "@/lib/types/share";
import { addCacheBuster } from "@/lib/utils/cache-buster";
import { buildApiHeaders } from "@/lib/utils/api-headers";
import { toast } from "@/components/common/Toast";
import { useCallback } from "react";
import env from "@/env.ts";


export function useShareHandle() {
    const token = localStorage.getItem("token")!

    const getHeaders = useCallback((extraHeaders: Record<string, string> = {}) => buildApiHeaders({
        token,
        extraHeaders,
    }), [token])

    const handleTokenExpired = useCallback(() => {
        localStorage.removeItem("token")
        window.location.reload()
    }, [])

    // 获取分享列表 GET /api/shares
    const handleShareList = useCallback(async (
        params: { page?: number; pageSize?: number },
        callback: (data: ShareListResponse) => void
    ) => {
        try {
            const query = new URLSearchParams()
            if (params.page) query.append("page", params.page.toString())
            if (params.pageSize) query.append("pageSize", params.pageSize.toString())

            const url = addCacheBuster(`${env.API_URL}/api/shares?${query.toString()}`)
            const response = await fetch(url, {
                method: "GET",
                headers: getHeaders(),
            })
            if (response.status === 401) {
                handleTokenExpired()
                return
            }
            const res = await response.json()
            if (res.code > 0 && res.data) {
                callback(res.data as ShareListResponse)
            } else {
                toast.error(res.message || "Failed to fetch share list")
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error))
        }
    }, [getHeaders, handleTokenExpired])

    // 按路径查询分享状态 GET /api/share?path=&pathHash=&vault=
    // 返回 ShareCreateResponse（含 token）
    const handleGetShareByPath = useCallback(async (
        vault: string,
        path: string,
        pathHash: string,
        callback: (data: ShareCreateResponse) => void,
        onNotFound?: () => void
    ) => {
        try {
            const url = addCacheBuster(
                `${env.API_URL}/api/share?path=${encodeURIComponent(path)}&pathHash=${encodeURIComponent(pathHash)}&vault=${encodeURIComponent(vault)}`
            )
            const response = await fetch(url, {
                method: "GET",
                headers: getHeaders(),
            })
            if (response.status === 401) {
                handleTokenExpired()
                return
            }
            const res = await response.json()
            if (res.code > 0 && res.data) {
                callback(res.data as ShareCreateResponse)
            } else {
                onNotFound?.()
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error))
        }
    }, [getHeaders, handleTokenExpired])

    // 创建分享 POST /api/share
    const handleCreateShare = useCallback(async (
        vault: string,
        path: string,
        pathHash: string,
        callback: (data: ShareCreateResponse) => void
    ) => {
        try {
            const response = await fetch(`${env.API_URL}/api/share`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ vault, path, pathHash }),
            })
            if (response.status === 401) {
                handleTokenExpired()
                return
            }
            const res = await response.json()
            if (res.code > 0 && res.data) {
                callback(res.data as ShareCreateResponse)
            } else {
                toast.error(res.message || "Failed to create share")
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error))
        }
    }, [getHeaders, handleTokenExpired])

    // 更新分享密码 POST /api/share/password
    const handleUpdateSharePassword = useCallback(async (
        params: { vault: string; path: string; pathHash: string; password?: string },
        callback?: () => void
    ) => {
        try {
            const response = await fetch(`${env.API_URL}/api/share/password`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(params),
            })
            if (response.status === 401) {
                handleTokenExpired()
                return
            }
            const res = await response.json()
            if (res.code > 0) {
                callback?.()
            } else {
                toast.error(res.message || "Failed to update share password")
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error))
        }
    }, [getHeaders, handleTokenExpired])

    // 创建分享短链接 POST /api/share/short_link
    const handleCreateShortLink = useCallback(async (
        params: { vault: string; path: string; pathHash: string; url?: string; isForce?: boolean },
        callback: (shortUrl: string) => void
    ) => {
        try {
            const response = await fetch(`${env.API_URL}/api/share/short_link`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(params),
            })
            if (response.status === 401) {
                handleTokenExpired()
                return
            }
            const res = await response.json()
            if (res.code > 0 && res.data) {
                callback(res.data)
            } else {
                toast.error(res.message || "Failed to create short link")
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error))
        }
    }, [getHeaders, handleTokenExpired])

    // 取消分享 DELETE /api/share
    // 支持按 id 取消，或按 path+pathHash+vault 取消
    const handleCancelShare = useCallback(async (
        params: { id?: number; path?: string; pathHash?: string; vault: string },
        callback?: () => void
    ) => {
        try {
            const response = await fetch(`${env.API_URL}/api/share`, {
                method: "DELETE",
                headers: getHeaders(),
                body: JSON.stringify(params),
            })
            if (response.status === 401) {
                handleTokenExpired()
                return
            }
            const res = await response.json()
            if (res.code > 0) {
                callback?.()
            } else {
                toast.error(res.message || "Failed to cancel share")
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error))
        }
    }, [getHeaders, handleTokenExpired])

    // 获取指定 vault 下有效分享的笔记路径列表 GET /api/notes/share-paths
    // Get active shared note paths for a vault
    const handleGetNoteSharePaths = useCallback(async (
        vault: string,
        callback: (paths: string[]) => void
    ) => {
        try {
            const url = addCacheBuster(`${env.API_URL}/api/notes/share-paths?vault=${encodeURIComponent(vault)}`)
            const response = await fetch(url, {
                method: "GET",
                headers: getHeaders(),
            })
            if (response.status === 401) {
                handleTokenExpired()
                return
            }
            const res = await response.json()
            if (res.code > 0 && res.data) {
                callback(res.data as string[])
            } else {
                callback([])
            }
        } catch {
            callback([])
        }
    }, [getHeaders, handleTokenExpired])

    return { handleShareList, handleGetShareByPath, handleCreateShare, handleCancelShare, handleUpdateSharePassword, handleCreateShortLink, handleGetNoteSharePaths }
}
