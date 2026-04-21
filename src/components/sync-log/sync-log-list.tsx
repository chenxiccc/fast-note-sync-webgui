import { SyncLogItem } from "@/lib/types/sync-log";
import { VaultType } from "@/lib/types/vault";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Clock, HardDrive, FileType, Activity, FileText, Monitor, CheckCircle2, XCircle, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface SyncLogListProps {
    logs: SyncLogItem[];
    vaults: VaultType[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function SyncLogList({ logs, vaults, loading, currentPage, totalPages, onPageChange }: SyncLogListProps) {
    const { t } = useTranslation();

    const getStatusBadge = (status: number) => {
        if (status === 1) {
            return (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 px-1.5 py-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("ui.syncLog.statusSuccess")}
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1 px-1.5 py-0.5">
                <XCircle className="h-3 w-3" />
                {t("ui.syncLog.statusFailed")}
            </Badge>
        );
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const renderChangedFields = (fields: string) => {
        if (!fields) return null;
        return (
            <div className="flex flex-wrap gap-1">
                {fields.split(',').map((field, idx) => (
                    <span 
                        key={idx} 
                        className="px-1.5 py-0.5 bg-primary/5 text-primary/70 text-[10px] rounded border border-primary/10 font-mono"
                    >
                        {field.trim()}
                    </span>
                ))}
            </div>
        );
    };

    if (loading && logs.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-24 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t("ui.common.loading")}</p>
            </div>
        );
    }

    if (!loading && logs.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-24 text-center">
                <div className="p-4 rounded-full bg-muted w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Info className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">{t("ui.syncLog.noLogs")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("ui.syncLog.noLogsDescription")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px] whitespace-nowrap shrink-0"><div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {t("ui.syncLog.time")}</div></TableHead>
                            <TableHead className="w-[120px] whitespace-nowrap shrink-0"><div className="flex items-center gap-2"><HardDrive className="h-3.5 w-3.5 text-muted-foreground" /> {t("ui.syncLog.vault")}</div></TableHead>
                            <TableHead className="w-[100px] whitespace-nowrap shrink-0"><div className="flex items-center gap-2"><FileType className="h-3.5 w-3.5 text-muted-foreground" /> {t("ui.syncLog.type")}</div></TableHead>
                            <TableHead className="w-[110px] whitespace-nowrap shrink-0"><div className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-muted-foreground" /> {t("ui.syncLog.action")}</div></TableHead>
                            <TableHead className="min-w-[250px] whitespace-nowrap shrink-0"><div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> {t("ui.syncLog.path")}</div></TableHead>
                            <TableHead className="w-[100px] whitespace-nowrap shrink-0 text-right">{t("ui.syncLog.size")}</TableHead>
                            <TableHead className="w-[100px] whitespace-nowrap shrink-0"><div className="flex items-center gap-2 justify-center"><Monitor className="h-3.5 w-3.5 text-muted-foreground" /> {t("ui.syncLog.client")}</div></TableHead>
                            <TableHead className="w-[100px] whitespace-nowrap shrink-0">{t("ui.syncLog.status")}</TableHead>
                            <TableHead className="min-w-[120px] whitespace-nowrap shrink-0">{t("ui.syncLog.changedFields")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-muted/30 transition-colors group">
                                <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap shrink-0">
                                    {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                                </TableCell>
                                <TableCell className="whitespace-nowrap shrink-0">
                                    <span className="text-sm font-medium">
                                        {vaults.find(v => String(v.id) === String(log.vaultId))?.vault || `Vault-${log.vaultId}`}
                                    </span>
                                </TableCell>
                                <TableCell className="whitespace-nowrap shrink-0">
                                    {(() => {
                                        const type = log.type.toLowerCase();
                                        const colorMap: Record<string, string> = {
                                            note: "#08b94e",
                                            file: "#7C4DFF",
                                            setting: "#FF8A33",
                                            folder: "#1E88E5",
                                        };
                                        const color = colorMap[type] || "#666";
                                        return (
                                            <Badge 
                                                variant="outline" 
                                                className="text-white border-none font-normal px-2 py-0.5"
                                                style={{ backgroundColor: color }}
                                            >
                                                {t(`ui.syncLog.type.${type}`, { defaultValue: log.type })}
                                            </Badge>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell className="whitespace-nowrap shrink-0">
                                    <span className={cn(
                                        "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                                        log.action === 'create' ? "bg-blue-500/10 text-blue-500" :
                                        log.action === 'modify' ? "bg-amber-500/10 text-amber-500" :
                                        log.action === 'soft_delete' ? "bg-orange-500/10 text-orange-500" :
                                        log.action === 'delete' ? "bg-rose-500/10 text-rose-500" :
                                        log.action === 'rename' ? "bg-purple-500/10 text-purple-500" :
                                        log.action === 'restore' ? "bg-emerald-500/10 text-emerald-500" :
                                        "bg-muted text-muted-foreground"
                                    )}>
                                        {t(`ui.syncLog.action.${log.action.toLowerCase()}`, { defaultValue: log.action })}
                                    </span>
                                </TableCell>
                                <TableCell className="whitespace-nowrap shrink-0">
                                    <div className="flex flex-col gap-0.5 max-w-[300px]">
                                        <span className="text-xs font-medium truncate" title={log.path}>
                                            {log.path.split('/').pop()}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground truncate opacity-70" title={log.path}>
                                            {log.path}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-xs font-mono text-muted-foreground whitespace-nowrap shrink-0">
                                    {formatSize(log.size)}
                                </TableCell>
                                <TableCell className="text-center whitespace-nowrap shrink-0">
                                    <Tooltip
                                        content={
                                            <div className="flex flex-col gap-1.5 p-1 min-w-[120px]">
                                                <div className="flex justify-between items-center gap-4">
                                                    <span className="text-muted-foreground/70">{t("ui.system.wsClientName")}</span>
                                                    <span className="font-medium text-foreground capitalize">{log.clientType || t("ui.common.na")}</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-4 border-t border-border/30 pt-1.5">
                                                    <span className="text-muted-foreground/70">{t("ui.share.version")}</span>
                                                    <span className="font-mono text-foreground font-medium">{log.clientVersion ? `v${log.clientVersion}` : t("ui.common.na")}</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-4 border-t border-border/30 pt-1.5">
                                                    <span className="text-muted-foreground/70">{t("ui.common.name")}</span>
                                                    <span className="font-semibold text-foreground">{log.clientName || t("ui.common.na")}</span>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div className="flex items-center justify-center">
                                            <Badge 
                                                variant="outline" 
                                                className="text-[10px] font-medium px-2 py-0.5 rounded-md hover:bg-primary/5 cursor-help transition-colors"
                                            >
                                                {log.clientType || log.clientName || t("ui.common.na")}
                                            </Badge>
                                        </div>
                                    </Tooltip>
                                </TableCell>
                                <TableCell className="whitespace-nowrap shrink-0">
                                    {getStatusBadge(log.status)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap shrink-0">
                                    {renderChangedFields(log.changedFields)}
                                    {log.message && (
                                        <p className="mt-1 text-[10px] text-rose-500 italic truncate max-w-[200px]" title={log.message}>
                                            {log.message}
                                        </p>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        disabled={currentPage === 1 || loading}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1 px-4 py-1.5 bg-muted/50 rounded-xl border border-border/50 shadow-inner">
                        <span className="text-sm font-semibold">{currentPage}</span>
                        <span className="text-sm text-muted-foreground">/</span>
                        <span className="text-sm text-muted-foreground">{totalPages}</span>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        disabled={currentPage === totalPages || loading}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
