import { useVaultHandle } from "@/components/api-handle/vault-handle";
import { VaultType } from "@/lib/types/vault";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileJson, Search, RefreshCw, Plus, X } from "lucide-react";
import { SettingList } from "./setting-list";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


interface SettingManagerProps {
    vault: string;
    onVaultChange: (vault: string) => void;
    onNavigateToVaults: () => void;
}

export function SettingManager({ vault, onVaultChange }: SettingManagerProps) {
    const { t } = useTranslation();
    const { handleVaultList } = useVaultHandle();
    const [vaults, setVaults] = useState<VaultType[]>([]);
    
    // Lifted states for Sync Log style header controls
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [refreshSignal, setRefreshSignal] = useState(0);
    const [onAddFn, setOnAddFn] = useState<(() => void) | null>(null);

    useEffect(() => {
        handleVaultList((data) => {
            setVaults(data);
        });
    }, [handleVaultList]);

    const handleRefresh = () => {
        setRefreshSignal(prev => prev + 1);
    };

    return (
        <div className="w-full space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section with controls on the right (matching Sync Logs) */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                        <FileJson className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{t("ui.settingsBrowser.title")}</h2>
                        <p className="text-sm text-muted-foreground">{t("ui.settingsBrowser.description")}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Search Field */}
                    <div className="relative flex-1 lg:w-64 group min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                        <Input
                            type="text"
                            placeholder={t("ui.common.search")}
                            className="h-10 pl-9 pr-10 rounded-xl bg-card border-border hover:bg-muted/50 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium shadow-sm"
                            value={searchKeyword}
                            onChange={(e) => {
                                setSearchKeyword(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        {searchKeyword && (
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => {
                                    setSearchKeyword("");
                                    setCurrentPage(1);
                                }}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Vault Selector */}
                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <Select value={vault} onValueChange={(v) => { onVaultChange(v); setCurrentPage(1); }}>
                            <SelectTrigger className="rounded-xl h-10 bg-card border border-border hover:bg-muted/50 transition-all shadow-sm font-medium">
                                <SelectValue placeholder={t("ui.common.selectVault")} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                                {vaults.map((v) => (
                                    <SelectItem key={v.id} value={v.vault} className="rounded-lg">
                                        {v.vault}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl bg-card border-border hover:bg-muted/50 transition-all shadow-sm"
                            onClick={handleRefresh}
                            title={t("ui.common.refresh")}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                            onClick={() => onAddFn?.()}
                            className="h-10 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold px-4"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            <span>{t("ui.common.add")}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <SettingList
                vault={vault}
                searchKeyword={searchKeyword}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                refreshSignal={refreshSignal}
                onRegisterAdd={(fn) => setOnAddFn(() => fn)}
            />
        </div>
    );
}
