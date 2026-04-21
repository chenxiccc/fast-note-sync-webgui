import { getBrowserLang } from "@/i18n/utils";


export interface ApiHeadersOptions {
    token?: string | null;
    includeContentType?: boolean;
    includeDomain?: boolean;
    includeLang?: boolean;
    extraHeaders?: Record<string, string>;
}

export function buildApiHeaders({
    token,
    includeContentType = true,
    includeDomain = true,
    includeLang = true,
    extraHeaders = {},
}: ApiHeadersOptions = {}): Record<string, string> {
    const headers: Record<string, string> = {
        "X-Client": "WebGui",
        "X-Client-Name": encodeURIComponent("Web"),
        "X-Client-Version": "1.0.0",
    };

    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (includeDomain) {
        headers["Domain"] = window.location.origin;
    }

    if (includeLang) {
        headers["Lang"] = getBrowserLang();
    }

    return {
        ...headers,
        ...extraHeaders,
    };
}
