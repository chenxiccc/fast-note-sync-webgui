import { Info, GitBranch, Tag, RefreshCw, AlertCircle, CheckCircle, ExternalLink, Loader2, ArrowUpCircle } from "lucide-react";
import { useUpdateCheck } from "@/components/api-handle/use-update-check";
import { useVersion } from "@/components/api-handle/use-version";
import { addCacheBuster } from "@/lib/utils/cache-buster";
import { buildApiHeaders } from "@/lib/utils/api-headers";
import { toast } from "@/components/common/Toast";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import env from "@/env.ts";


const getSafeHttpUrl = (url?: string | null): string | null => {
    if (!url) return null
    try {
        const parsedUrl = new URL(url)
        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:" ? url : null
    } catch {
        return null
    }
}

export function VersionOverview({ showUpgrade = true, children }: { showUpgrade?: boolean, children?: React.ReactNode }) {
    const { t } = useTranslation()
    const { versionInfo, isLoading: versionLoading } = useVersion()
    const { checkUpdate, isChecking, updateResult } = useUpdateCheck()
    const [isUpgrading, setIsUpgrading] = useState(false)

    const safeVersionNewLink = getSafeHttpUrl(versionInfo?.versionNewLink)
    const safeReleaseUrl = getSafeHttpUrl(updateResult?.releaseUrl || versionInfo?.versionNewLink)

    const handleCheckUpdate = async () => {
        if (versionInfo?.version) {
            const result = await checkUpdate(versionInfo.version)
            if (result) {
                toast.success(result.hasUpdate ? t("ui.system.newVersionAvailable") : t("ui.system.alreadyLatest"))
            }
        }
    }

    const handleUpgrade = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        setIsUpgrading(true)
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/admin/upgrade?version=latest"), {
                headers: buildApiHeaders({
                    token,
                    includeContentType: false,
                    includeDomain: false,
                }),
            })
            const res = await response.json()
            if (res.code === 0 || (res.code < 100 && res.code > 0)) {
                toast.success(t("ui.system.upgradeSuccess"))
                setTimeout(() => {
                    window.location.reload()
                }, 4000)
            } else {
                toast.error(res.message || t("ui.system.upgradeFailed"))
                setIsUpgrading(false)
            }
        } catch {
            toast.error(t("ui.system.upgradeFailed"))
            setIsUpgrading(false)
        }
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 custom-shadow">
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t("ui.system.versionInfo")}
            </h2>
            <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <GitBranch className="h-4 w-4" />
                        <span>{t("ui.system.repo")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                    <a href="https://github.com/haierkeys/fast-note-sync-service" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-37.5 sm:max-w-none">
                        {t("ui.system.githubRepo")}
                    </a>
                    <span className="text-muted-foreground">/</span>
                    <a href="https://cnb.cool/haierkeys/fast-note-sync-service" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-37.5 sm:max-w-none">
                        {t("ui.system.cnbMirror")}
                    </a>
                </div>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <Tag className="h-4 w-4" />
                        <span>{t("ui.system.currentVersion")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {versionLoading ? (
                            <code className="font-mono text-muted-foreground">{t("ui.common.loading")}</code>
                        ) : (
                            <>
                                {safeVersionNewLink ? (
                                    <a
                                        href={safeVersionNewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-primary hover:underline"
                                    >
                                        {versionInfo?.version}
                                    </a>
                                ) : (
                                    <code className="font-mono text-muted-foreground">
                                        {versionInfo?.version || t("ui.common.unknown")}
                                    </code>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="border-t border-border/50" />
            <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                        <span>{t("ui.system.checkUpdate")}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCheckUpdate} disabled={isChecking || versionLoading || !versionInfo?.version} className="rounded-xl px-3">
                        {isChecking ? t("ui.system.checking") : t("ui.system.checkNow")}
                    </Button>
                </div>
                {updateResult || versionInfo?.versionIsNew ? (
                    <div className={`rounded-xl p-4 ${(updateResult?.hasUpdate || versionInfo?.versionIsNew) ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3">
                                {(updateResult?.hasUpdate || versionInfo?.versionIsNew) ? <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />}
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="text-sm font-medium">{(updateResult?.hasUpdate || versionInfo?.versionIsNew) ? t("ui.system.newVersionAvailable") : t("ui.system.alreadyLatest")}</span>
                                    <div className="flex items-center gap-2">
                                        {(updateResult?.latestVersion || versionInfo?.versionNewName || versionInfo?.version) && <code className="text-xs font-mono bg-background px-2 py-0.5 rounded">{updateResult?.latestVersion || versionInfo?.versionNewName || versionInfo?.version}</code>}
                                        {(updateResult?.hasUpdate || versionInfo?.versionIsNew) && safeReleaseUrl && (
                                            <a href={safeReleaseUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                                {t("ui.system.viewRelease")} <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                        {showUpgrade && (updateResult?.hasUpdate || versionInfo?.versionIsNew) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isUpgrading}
                                                onClick={handleUpgrade}
                                                className="h-6 px-2 text-xs text-primary hover:bg-primary/10 rounded-md gap-1 ml-1 relative group transition-all duration-300"
                                            >
                                                {isUpgrading ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <ArrowUpCircle className="h-3 w-3 group-hover:scale-110 transition-transform duration-300" />
                                                )}
                                                <span className="relative">
                                                    {isUpgrading ? t("ui.system.upgrading") : t("ui.system.upgradeNow")}
                                                    {!isUpgrading && (
                                                        <span className="absolute -top-1 -right-1.5 flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500 border border-background"></span>
                                                        </span>
                                                    )}
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {(updateResult?.releaseNotesContent || versionInfo?.versionNewChangelogContent) && (
                                    <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/50 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                        {updateResult?.releaseNotesContent || versionInfo?.versionNewChangelogContent}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
            {children && (
                <>
                    <div className="border-t border-border" />
                    {children}
                </>
            )}
        </div>
    )
}
