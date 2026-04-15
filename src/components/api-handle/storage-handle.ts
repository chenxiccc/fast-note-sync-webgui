import { useConfirmDialog } from "@/components/context/confirm-dialog-context";
import { addCacheBuster } from "@/lib/utils/cache-buster";
import { StorageConfig } from "@/lib/types/storage";
import { buildApiHeaders } from "@/lib/utils/api-headers";
import { toast } from "@/components/common/Toast";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import env from "@/env.ts";


/**
 * 存储配置 API 处理钩子
 */
export function useStorageHandle() {
    const { t } = useTranslation()
    const { openConfirmDialog } = useConfirmDialog()
    const token = localStorage.getItem("token")!

    /**
     * 获取存储配置列表
     */
    const handleStorageList = useCallback(async (callback: (list: StorageConfig[]) => void) => {
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/storage?limit=100"), {
                method: "GET",
                headers: buildApiHeaders({ token }),
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                callback(res.data || [])
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog(t("api.storage.list.error") + ": " + error, "error")
        }
    }, [token, openConfirmDialog, t])

    /**
     * 删除存储配置
     */
    const handleStorageDelete = async (id: string) => {
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/storage"), {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: buildApiHeaders({ token }),
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                openConfirmDialog(res.message || t("api.storage.delete.success"), "success")
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog(t("api.storage.delete.error") + ": " + error, "error")
        }
    }

    /**
     * 新增或更新存储配置
     */
    const handleStorageUpdate = async (data: StorageConfig, callback: (data: StorageConfig) => void) => {
        try {
            const formData = {
                ...data,
                isEnabled: data.isEnabled ? 1 : 0
            }

            const response = await fetch(addCacheBuster(env.API_URL + "/api/storage"), {
                method: "POST",
                body: JSON.stringify(formData),
                headers: buildApiHeaders({ token }),
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                openConfirmDialog(res.message, "success")
                data.id = res.data
                callback(data)
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog(t("api.storage.save.error") + ": " + error, "error")
        }
    }

    /**
     * 获取支持的存储类型
     */
    const handleStorageTypes = async (callback: (types: string[]) => void) => {
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/storage/enabled_types"), {
                method: "GET",
                headers: buildApiHeaders({ token }),
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                callback(res.data || [])
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog(t("api.storage.types.error") + ": " + error, "error")
        }
    }

    /**
     * 验证存储连接
     */
    const handleStorageValidate = useCallback(async (params: Partial<StorageConfig>, callback: () => void) => {
        try {
            const formData = {
                ...params,
                isEnabled: params.isEnabled ? 1 : 0,
                accessUrlPrefix: params.accessUrlPrefix || "http://placeholder",
            }

            const response = await fetch(addCacheBuster(env.API_URL + "/api/storage/validate"), {
                method: "POST",
                body: JSON.stringify(formData),
                headers: buildApiHeaders({ token }),
            })

            if (!response.ok) {
                throw new Error(t("api.storage.validate.error"))
            }

            const res = await response.json()
            if (res.code > 0 && res.code <= 200) {
                toast.success(t("api.storage.validate.success"))
                callback()
            } else {
                const detail = res.details || res.message || ""
                toast.error(detail ? `${t("api.storage.validate.error")}: ${detail}` : t("api.storage.validate.error"))
            }
        } catch (error) {
            console.error("StorageValidate error:", error)
            toast.error(error instanceof Error ? error.message : t("api.storage.validate.error"))
        }
    }, [token, t])

    return {
        handleStorageList,
        handleStorageDelete,
        handleStorageUpdate,
        handleStorageTypes,
        handleStorageValidate,
    }
}
