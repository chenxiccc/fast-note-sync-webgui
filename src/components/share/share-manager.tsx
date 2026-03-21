import { RefreshCw, Calendar, Clock, History, SortDesc, SortAsc, Share2, Link2Off, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirmDialog } from "@/components/context/confirm-dialog-context";
import { useShareHandle } from "@/components/api-handle/share-handle";
import { useState, useEffect, useCallback } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/common/Toast";
import type { ShareItem } from "@/lib/types/share";
import type { VaultType } from "@/lib/types/vault";
import { format } from "date-fns";


type TabType = "all" | "active" | "ended";
type SortBy = "mtime" | "ctime" | "share_start" | "share_end";
type SortOrder = "desc" | "asc";

interface ShareManagerProps {
    vault: string;
    vaults: VaultType[];
    onVaultChange: (vault: string) => void;
}

export function ShareManager({ vault, vaults, onVaultChange }: ShareManagerProps) {
    const { t } = useTranslation();
    const { handleShareList, handleCancelShare } = useShareHandle();
    const { openConfirmDialog } = useConfirmDialog();

    const [allItems, setAllItems] = useState<ShareItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<TabType>("active");
    const [sortBy, setSortBy] = useState<SortBy>("share_start");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalRows, setTotalRows] = useState(0);

    const fetchShares = useCallback(() => {
        setLoading(true);
        // 映射前端排序到后端参数
        let serverSortBy = "created_at";
        if (sortBy === "share_end") serverSortBy = "expires_at";
        if (sortBy === "mtime") serverSortBy = "updated_at";
        
        handleShareList({
            page,
            pageSize,
            sort_by: serverSortBy,
            sort_order: sortOrder
        }, (data) => {
            setAllItems(data.list ?? []);
            setTotalRows(data.pager?.totalRows ?? 0);
            setLoading(false);
        });
    }, [handleShareList, page, pageSize, sortBy, sortOrder]);

    useEffect(() => {
        fetchShares();
    }, [fetchShares]);

    useEffect(() => {
        setPage(1);
    }, [tab, vault, sortBy, sortOrder, pageSize]);

    const isEnded = (item: ShareItem): boolean => {
        if (item.status === 2) return true;
        return new Date(item.expires_at) <= new Date();
    };

    // 后端如果不支持状态过滤，前端继续过滤。但这样分页会有问题。
    // 如果后端支持状态过滤，应传给接口。目前文档未见状态参数，先保持前端过滤以防万一，但优先使用 server 数据。
    const filteredItems = allItems.filter((item) => {
        if (tab === "active") return !isEnded(item);
        if (tab === "ended") return isEnded(item);
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const pagedItems = filteredItems; // 接口已经返回了当前页的数据

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
    };

    const onCancelShare = (e: React.MouseEvent, item: ShareItem) => {
        e.stopPropagation();
        // 优先通过 id 取消；vault 优先从 note_info 中取，再回退到当前选中的 vault
        const itemVault = item.note_info?.vault_name || vault;
        if (!itemVault) {
            toast.error("Cannot determine vault for this share");
            return;
        }
        openConfirmDialog(t("ui.share.cancelConfirm"), "confirm", () => {
            handleCancelShare({ id: item.id, vault: itemVault }, () => {
                fetchShares();
            });
        });
    };

    const onViewShare = useCallback((e: React.MouseEvent, item: ShareItem) => {
        e.stopPropagation();
        if (!item.url && (!item.id || !item.token)) {
            toast.error("Share data is incomplete");
            return;
        }
        
        // 按照用户要求的格式：域名 + share/id/token
        // 如果有 token 字段，手动拼接；否则直接使用 item.url (如果 item.url 已经包含 /share)
        let path = item.url;
        if (item.id && item.token) {
            path = `/share/${item.id}/${item.token}`;
        }
        
        if (!path) {
            toast.error("Cannot resolve share URL");
            return;
        }

        const fullUrl = window.location.origin + path;
        window.open(fullUrl, "_blank");
    }, []);


    return (
        <div className="w-full flex flex-col space-y-4">
            {/* 第一行：vault 选择 + 刷新 */}
            <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-3">
                    {vaults.length > 0 && (
                        <Select value={vault} onValueChange={onVaultChange}>
                            <SelectTrigger className="w-auto min-w-45 rounded-xl">
                                <SelectValue placeholder={t("ui.common.selectVault")} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {vaults.map((v) => (
                                    <SelectItem key={v.id} value={v.vault} className="rounded-xl">
                                        {v.vault}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label={t("ui.common.refresh")}
                    onClick={fetchShares}
                    disabled={loading}
                    className="rounded-xl shrink-0"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* 第二行：tab + 数量 + 排序（灰色背景，参考回收站样式） */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 py-2 px-2 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center h-8 rounded-lg border border-border overflow-hidden bg-background shadow-sm">
                        {(["active", "ended", "all"] as TabType[]).map((t_id, idx) => (
                            <button
                                key={t_id}
                                className={`px-4 h-full text-xs font-medium transition-colors ${idx > 0 ? "border-l border-border" : ""} ${tab === t_id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                                onClick={() => setTab(t_id)}
                            >
                                {t(`ui.share.tab${t_id.charAt(0).toUpperCase() + t_id.slice(1)}`)}
                            </button>
                        ))}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                        {totalRows} {t("ui.share.shareCount")}
                    </span>
                </div>

                {/* 排序 */}
                <div className="flex items-center h-8 rounded-xl border border-border overflow-hidden bg-background shadow-sm ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="px-3 h-full text-xs flex items-center gap-1.5 transition-colors hover:bg-muted">
                                {sortBy === "mtime" && <><Clock className="h-3.5 w-3.5" />{t("ui.note.sortByMtime")}</>}
                                {sortBy === "ctime" && <><Calendar className="h-3.5 w-3.5" />{t("ui.note.sortByCtime")}</>}
                                {sortBy === "share_start" && <><Share2 className="h-3.5 w-3.5" />{t("ui.share.sortByShareStart")}</>}
                                {sortBy === "share_end" && <><Clock className="h-3.5 w-3.5" />{t("ui.share.sortByShareEnd")}</>}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl min-w-36">
                            <DropdownMenuItem onClick={() => setSortBy("share_start")} className={`rounded-lg flex items-center gap-2 ${sortBy === "share_start" ? "bg-accent" : ""}`}>
                                <Share2 className="h-4 w-4" />{t("ui.share.sortByShareStart")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("share_end")} className={`rounded-lg flex items-center gap-2 ${sortBy === "share_end" ? "bg-accent" : ""}`}>
                                <Clock className="h-4 w-4" />{t("ui.share.sortByShareEnd")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("mtime")} className={`rounded-lg flex items-center gap-2 ${sortBy === "mtime" ? "bg-accent" : ""}`}>
                                <Clock className="h-4 w-4" />{t("ui.note.sortByMtime")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("ctime")} className={`rounded-lg flex items-center gap-2 ${sortBy === "ctime" ? "bg-accent" : ""}`}>
                                <Calendar className="h-4 w-4" />{t("ui.note.sortByCtime")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Tooltip content={sortOrder === "desc" ? t("ui.note.sortDesc") : t("ui.note.sortAsc")} side="top" delay={200}>
                        <button
                            className="px-2.5 h-full text-xs flex items-center transition-colors border-l border-border hover:bg-muted"
                            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        >
                            {sortOrder === "desc" ? <SortDesc className="h-3.5 w-3.5" /> : <SortAsc className="h-3.5 w-3.5" />}
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* 列表 */}
            {loading ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    {t("ui.common.loading")}
                </div>
            ) : pagedItems.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                    {t("ui.share.noShares")}
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {pagedItems.map((item, index) => {
                        const ended = isEnded(item);
                        const title = item.title || item.note_info?.path.replace(/\.md$/, "") || `#${item.id}`;
                        // canView：未结束即可（可能有 title 但无 note_info，点击时再查资源）
                        const canView = !ended;

                        return (
                            <article
                                key={`share-${item.id}`}
                                className={`flex items-center gap-3 px-4 py-3 transition-colors ${index > 0 ? "border-t border-border" : ""} ${canView ? "cursor-pointer hover:bg-muted/50" : ""}`}
                                onClick={canView ? (e) => onViewShare(e, item) : undefined}
                            >
                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${ended ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                                    <Share2 className="h-4 w-4" />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-sm text-card-foreground truncate">
                                            {title}
                                        </span>
                                        {ended && (
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                                                {t("ui.share.statusEnded")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                                        {item.note_info && (
                                            <>
                                                <Tooltip content={t("ui.common.createdAt")} side="top" delay={300}>
                                                    <span className="hidden sm:flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(item.note_info.ctime), "yyyy-MM-dd HH:mm")}
                                                    </span>
                                                </Tooltip>
                                                <Tooltip content={t("ui.common.updatedAt")} side="top" delay={300}>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(item.note_info.mtime), "yyyy-MM-dd HH:mm")}
                                                    </span>
                                                </Tooltip>
                                                {item.note_info.version > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <History className="h-3 w-3" />
                                                        v{item.note_info.version}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                        <Tooltip content={t("ui.share.shareStartTime")} side="top" delay={300}>
                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
                                                <Share2 className="h-3 w-3" />
                                                {format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}
                                            </span>
                                        </Tooltip>
                                        <Tooltip content={t("ui.share.shareEndTime")} side="top" delay={300}>
                                            <span className={`flex items-center gap-1 ${ended ? "text-destructive" : "text-orange-500 dark:text-orange-400"}`}>
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(item.expires_at), "yyyy-MM-dd HH:mm")}
                                            </span>
                                        </Tooltip>
                                        <Tooltip content={t("ui.share.viewCount") || "View Count"} side="top" delay={300}>
                                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                <History className="h-3 w-3" />
                                                {item.view_count || 0}
                                            </span>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {canView && (
                                        <Tooltip content={t("ui.share.viewShare")} side="top" delay={200}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl text-muted-foreground hover:text-primary"
                                                onClick={(e) => onViewShare(e, item)}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Tooltip>
                                    )}
                                    {!ended && (
                                        <Tooltip content={t("ui.share.cancelShare")} side="top" delay={200}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl text-muted-foreground hover:text-destructive"
                                                onClick={(e) => onCancelShare(e, item)}
                                            >
                                                <Link2Off className="h-4 w-4" />
                                            </Button>
                                        </Tooltip>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* 分页控制 */}
            {totalRows > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 pt-2 shrink-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t("ui.common.of")} {totalRows} {t("ui.share.shareCount")}</span>
                        <Select value={pageSize.toString()} onValueChange={(val) => {
                            setPageSize(parseInt(val));
                        }}>
                            <SelectTrigger className="h-8 w-25 rounded-xl">
                                <SelectValue placeholder={pageSize.toString()} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {[10, 20, 50, 100].map((size) => (
                                    <SelectItem key={size} value={size.toString()} className="rounded-xl">
                                        {size} {t("ui.common.perPage")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1 || loading}
                            className="rounded-xl"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {t("ui.common.previous")}
                        </Button>
                        <span className="text-sm font-medium px-2">
                            {page} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages || loading}
                            className="rounded-xl"
                        >
                            {t("ui.common.next")}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
