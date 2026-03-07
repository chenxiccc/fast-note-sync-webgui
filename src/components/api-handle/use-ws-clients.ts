import { addCacheBuster } from "@/lib/utils/cache-buster";
import { useState, useEffect, useCallback } from "react";
import { getBrowserLang } from "@/i18n/utils";
import env from "@/env.ts";


export interface WSPlatformInfo {
    isDesktop: boolean;
    isLinux: boolean;
    isMacOS: boolean;
    isMobile: boolean;
    isPhone: boolean;
    isTablet: boolean;
    isWin: boolean;
}

export interface WSClientInfo {
    uid: string;
    nickname: string;
    clientName: string;
    clientType: string;
    clientVersion: string;
    platformInfo: WSPlatformInfo;
    remoteAddr: string;
    startTime: string;
    traceId: string;
}

export function useWSClientInfo() {
    const [clients, setClients] = useState<WSClientInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem("token");

    const fetchWSClientInfo = useCallback(async (signal?: AbortSignal) => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/admin/ws_clients"), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    Lang: getBrowserLang(),
                },
                signal,
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const res = await response.json();
            if (signal?.aborted) {
                return;
            }
            if (res.code === 1 || res.status === true) {
                setClients(res.data || []);
            } else {
                setError(res.message || "Failed to get WS clients");
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }
            if (!signal?.aborted) {
                setError("Failed to get WS clients");
                console.error("WS client fetch error:", error);
            }
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false);
            }
        }
    }, [token]);

    useEffect(() => {
        const controller = new AbortController();
        fetchWSClientInfo(controller.signal);
        return () => {
            controller.abort();
        };
    }, [fetchWSClientInfo]);

    return {
        clients,
        isLoading,
        error,
        refresh: fetchWSClientInfo
    };
}
