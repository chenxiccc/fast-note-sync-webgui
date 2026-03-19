import { ShareListResponse } from "@/lib/types/share";
import { addCacheBuster } from "@/lib/utils/cache-buster";
import { toast } from "@/components/common/Toast";
import { getBrowserLang } from "@/i18n/utils";
import { useCallback } from "react";
import env from "@/env.ts";


export function useShareHandle() {
    const token = localStorage.getItem("token")!

    const getHeaders = useCallback(() => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        Domain: window.location.origin,
        Lang: getBrowserLang(),
    }), [token])

    const handleTokenExpired = useCallback(() => {
        localStorage.removeItem("token")
        window.location.reload()
    }, [])

    const handleShareList = useCallback(async (
        callback: (data: ShareListResponse) => void
    ) => {
        try {
            const url = addCacheBuster(`${env.API_URL}/api/shares`)
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

    const handleCancelShare = useCallback(async (
        id: number,
        callback?: () => void
    ) => {
        try {
            const response = await fetch(`${env.API_URL}/api/share`, {
                method: "DELETE",
                headers: getHeaders(),
                body: JSON.stringify({ id }),
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

    return { handleShareList, handleCancelShare }
}
