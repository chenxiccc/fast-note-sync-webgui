import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useShareHandle } from "@/components/api-handle/share-handle";
import { Share2, Copy, Trash2, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/common/Toast";
import type { ShareCreateResponse } from "@/lib/types/share";
import { Tooltip } from "@/components/ui/tooltip";

interface ShareModalProps {
    vault: string;
    path: string;
    pathHash: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ShareModal({ vault, path, pathHash, open, onOpenChange }: ShareModalProps) {
    const { t } = useTranslation();
    const { handleGetShareByPath, handleCreateShare, handleCancelShare } = useShareHandle();

    const [loading, setLoading] = useState(false);
    const [shareData, setShareData] = useState<ShareCreateResponse | null>(null);

    const checkShareStatus = useCallback(() => {
        setLoading(true);
        handleGetShareByPath(
            vault,
            path,
            pathHash,
            (data) => {
                setShareData(data);
                setLoading(false);
            },
            () => {
                setShareData(null);
                setLoading(false);
            }
        );
    }, [vault, path, pathHash, handleGetShareByPath]);

    useEffect(() => {
        if (open) {
            checkShareStatus();
        } else {
            setShareData(null);
        }
    }, [open, checkShareStatus]);

    const onCreateShare = async () => {
        setLoading(true);
        handleCreateShare(vault, path, pathHash, (data) => {
            setShareData(data);
            setLoading(false);
            toast.success(t("ui.share.success"));
        });
    };

    const onCancelShare = async () => {
        setLoading(true);
        handleCancelShare({ vault, path, pathHash }, () => {
            setShareData(null);
            setLoading(false);
            toast.success(t("ui.share.cancelSuccess"));
        });
    };

    const getFullUrl = (data?: ShareCreateResponse) => {
        if (!data || !data.token) return "";
        // 按照用户要求的格式：域名 + share/id/token
        return `${window.location.origin}/share/${data.id}/${data.token}`;
    };

    const onCopyLink = () => {
        if (!shareData) return;
        const fullUrl = getFullUrl(shareData);
        navigator.clipboard.writeText(fullUrl).then(() => {
            toast.success(t("ui.share.copySuccess"));
        });
    };

    const onViewShare = () => {
        if (!shareData) return;
        const fullUrl = getFullUrl(shareData);
        window.open(fullUrl, "_blank");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        {t("ui.share.title")}
                    </DialogTitle>
                    <DialogDescription className="hidden">
                        {t("ui.share.title")}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="text-sm text-muted-foreground break-all bg-muted/50 p-3 rounded-xl border border-border/50">
                        {path}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground animate-in fade-in duration-300">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-sm">{t("ui.share.checking")}</p>
                        </div>
                    ) : shareData ? (
                        <div className="space-y-4 animate-in zoom-in-95 duration-200">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                                    {t("ui.share.link")}
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1 group">
                                        <Input
                                            readOnly
                                            value={getFullUrl(shareData)}
                                            className="pr-10 bg-muted/30 border-muted-foreground/20 hover:border-primary/50 transition-colors rounded-xl"
                                        />
                                        <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                           <Tooltip content={t("ui.share.copy")} side="top">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                                    onClick={onCopyLink}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                           </Tooltip>
                                        </div>
                                    </div>
                                    <Tooltip content={t("ui.share.viewShare")} side="top">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-10 w-10 shrink-0 border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-xl shadow-sm"
                                            onClick={onViewShare}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 p-3 rounded-xl border border-primary/10">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <span>{t("ui.share.success")}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in fade-in duration-300">
                             <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Share2 className="h-8 w-8 text-primary opacity-60" />
                             </div>
                             <p className="text-sm text-muted-foreground text-center px-4">
                                {t("ui.share.noShares")}
                             </p>
                             <Button
                                onClick={onCreateShare}
                                disabled={loading}
                                className="w-full sm:w-auto px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                            >
                                {t("ui.share.create")}
                            </Button>
                        </div>
                    )}
                </div>

                {shareData && !loading && (
                    <DialogFooter className="sm:justify-end border-t pt-4 mt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl"
                            onClick={onCancelShare}
                            disabled={loading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("ui.share.cancelShare")}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
