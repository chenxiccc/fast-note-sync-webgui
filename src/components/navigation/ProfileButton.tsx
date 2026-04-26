import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuPortal, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettingsStore, ToastPosition } from "@/lib/stores/settings-store";
import { Clipboard, LogOut, ExternalLink, Lock, Bell } from "lucide-react";
import { ChangePassword } from "@/components/user/change-password";
import { toast } from "@/components/common/Toast";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import env from "@/env.ts";


interface ProfileButtonProps {
  /** 登出回调 */
  onLogout: () => void
  /** 额外的 CSS 类名 */
  className?: string
}

/**
 * ProfileButton - 用户资料按钮组件
 *
 * 圆形头像按钮，点击展开下拉菜单：
 * - 显示用户 ID
 * - 复制配置
 * - 登出
 */
export function ProfileButton({ onLogout, className }: ProfileButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [configModalIsError, setConfigModalIsError] = useState(false)
  const { toastPosition, setToastPosition } = useSettingsStore()

  const currentUid = localStorage.getItem("uid")
  const username = localStorage.getItem("username")

  // 获取配置 JSON
  const getConfigJson = useCallback(() => {
    return JSON.stringify({
      api: env.API_URL,
      apiToken: localStorage.getItem("token") || "",
    }, null, 2)
  }, [])

  const getObsidianUrl = useCallback(() => {
    const api = env.API_URL;
    const apiToken = localStorage.getItem("token") || "";
    return `obsidian://fast-note-sync/sso?pushApi=${encodeURIComponent(api)}&pushApiToken=${encodeURIComponent(apiToken)}`;
  }, []);

  // 复制配置到剪贴板
  const handleCopyConfig = () => {
    setConfigModalIsError(false)
    setConfigModalOpen(true)
    setOpen(false)
  }

  // 处理登出
  const handleLogout = () => {
    setOpen(false)
    onLogout()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "size-9 rounded-full bg-muted flex items-center justify-center",
            "transition-all duration-200",
            "ring-2 ring-ring/30",
            "hover:ring-ring/50",
            "focus-visible:outline-none focus-visible:ring-ring",
            open && "ring-ring",
            className
          )}
          aria-label={t("ui.auth.userUid", { uid: currentUid })}
        >
          <span className="text-sm font-medium text-muted-foreground">
            {username?.charAt(0)?.toUpperCase() || currentUid?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl shadow-lg p-2"
        sideOffset={8}
      >
        {/* 用户头部信息 */}
        <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-muted/30 rounded-lg">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg ring-2 ring-background shadow-sm">
            {username?.charAt(0)?.toUpperCase() || currentUid?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">{username || t("ui.auth.unknownUser")}</span>
            <span className="text-xs text-muted-foreground truncate font-mono">UID: {currentUid}</span>
          </div>
        </div>

        <DropdownMenuSeparator className="-mx-2 mb-2" />

        <DropdownMenuGroup>




          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="rounded-lg">
              <Bell className="mr-2 size-4 text-muted-foreground" />
              <span>{t("ui.settings.toastPosition")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="rounded-xl">
                <DropdownMenuRadioGroup value={toastPosition} onValueChange={(value) => setToastPosition(value as ToastPosition)}>
                  {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as ToastPosition[]).map((pos) => (
                    <DropdownMenuRadioItem key={pos} value={pos} className="rounded-lg cursor-pointer">
                      {t(`ui.settings.position.${pos}`)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={() => {
            setOpen(false);
            setChangePasswordOpen(true);
          }} className="rounded-lg cursor-pointer">
            <Lock className="mr-2 size-4 text-muted-foreground" />
            {t("ui.auth.changePassword")}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup>

          {/* 复制配置 */}
          <DropdownMenuItem onClick={handleCopyConfig} className="rounded-lg cursor-pointer">
            <Clipboard className="mr-2 size-4 text-muted-foreground" />
            {t("ui.vault.authTokenConfig")}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        {/* 登出 */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive rounded-lg cursor-pointer focus:bg-destructive/10"
        >
          <LogOut className="mr-2 size-4" />
          {t("ui.auth.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* 配置模态窗口 */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl mx-auto rounded-lg sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg truncate pr-8">
              {configModalIsError ? t("ui.obsidian.copyConfigError") : (t("ui.vault.authTokenConfig"))}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <pre className="p-3 sm:p-4 rounded-xl bg-muted text-xs sm:text-sm overflow-x-auto max-h-48 sm:max-h-64 font-mono whitespace-pre-wrap break-all">
              {getConfigJson()}
            </pre>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 text-nowrap">
              <Button variant="outline" onClick={() => setConfigModalOpen(false)} className="w-full sm:w-auto rounded-xl">
                {t("ui.common.close")}
              </Button>
              <Button
                className="w-full sm:w-auto rounded-xl bg-sky-700 hover:bg-sky-900 text-white transition-colors border-none shadow-sm"
                onClick={() => {
                  window.location.href = getObsidianUrl();
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t("ui.obsidian.oneClickImport")}
              </Button>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(getConfigJson())
                    .then(() => toast.success(t("ui.obsidian.copyConfigSuccess")))
                    .catch(err => toast.error(t("ui.common.error") + err));
                }}
                className="w-full sm:w-auto rounded-xl"
              >
                <Clipboard className="h-4 w-4 mr-2" />
                {t("ui.vault.copyConfig")}
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 修改密码模态窗口 */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("ui.auth.changePassword")}</DialogTitle>
          </DialogHeader>
          <ChangePassword close={() => setChangePasswordOpen(false)} />
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
