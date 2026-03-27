import { RefreshCw, Loader2, Laptop, Smartphone, Monitor } from "lucide-react";
import { useWSClientInfo } from "@/components/api-handle/use-ws-clients";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";


export function WSClientList() {
    const { t } = useTranslation();
    const { clients, isLoading, refresh } = useWSClientInfo();

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 custom-shadow">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    {t("ui.system.websocketClients")}
                </h2>
                <div className="flex items-center gap-2">
                    {clients.length > 0 && (
                        <Badge variant="outline" className="text-[10px] font-normal opacity-70">
                            {clients.length} {t("ui.common.count")}
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refresh()}
                        disabled={isLoading}
                        className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {clients.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground italic border border-dashed border-border/50 rounded-lg">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{t("ui.common.loading")}</span>
                            </div>
                        ) : (
                            t("ui.system.wsNoClients")
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {clients.map((client) => (
                            <div key={client.traceId} className="p-3 bg-secondary/20 rounded-lg border border-border/50 space-y-2 relative overflow-hidden group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-background rounded-md border border-border/50">
                                            {client.platformInfo?.isMobile ? (
                                                <Smartphone className="h-3.5 w-3.5 text-primary" />
                                            ) : (
                                                <Laptop className="h-3.5 w-3.5 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold leading-none flex items-center gap-1.5">
                                                {client.clientName || client.nickname || t("ui.common.unknown")}
                                                <span className="text-[10px] font-normal text-muted-foreground opacity-70">v{client.clientVersion}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-mono opacity-80">
                                                {client.remoteAddr}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] font-medium h-5">
                                        {client.clientType}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-border/10">
                                    <div className="text-[10px] text-muted-foreground">
                                        {t("ui.system.wsStartTime")}: {new Date(client.startTime).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono opacity-40 group-hover:opacity-100 transition-opacity">
                                        {t("ui.auth.userUid", { uid: client.uid })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
