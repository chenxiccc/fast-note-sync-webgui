import { AnimatedBackground } from "@/components/user/animated-background";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useAppStore } from "@/stores/app-store";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { MainContent } from "./MainContent";
import { FloatingNav } from "./FloatingNav";
import { TopBar } from "./TopBar";


interface AppLayoutProps {
  /** 子组件（模块内容） */
  children?: React.ReactNode
  /** 是否为管理员 */
  isAdmin?: boolean
  /** 登出回调 */
  onLogout: () => void
  /** 额外的 CSS 类名 */
  className?: string
}

/**
 * AppLayout - 主布局组件
 *
 * 整合所有布局组件，处理：
 * - 桌面端：左侧悬浮导航 + 右侧内容区
 * - 移动端：顶部 TopBar + 内容区 + 底部悬浮导航
 * - Zen 模式：隐藏导航栏，只显示内容
 */
export function AppLayout({
  children,
  isAdmin = false,
  onLogout,
  className,
}: AppLayoutProps) {
  const { zenMode } = useAppStore()
  const { colorScheme } = useSettingsStore()
  // useMobile hook 保留用于未来移动端适配
  useMobile()

  return (
    <div
      className={cn(
        "h-dvh md:h-screen overflow-x-hidden md:overflow-hidden bg-background",
        className
      )}
    >
      {/* Background Animation for default Scheme */}
      {colorScheme === 'default' && (
        <AnimatedBackground />
      )}

      <div className="flex flex-col h-full relative z-10">
        {/* Top Bar - 顶部栏（非 Zen 模式显示） */}
        {!zenMode && <TopBar onLogout={onLogout} />}

        {/* Content Area with Floating Nav */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Floating Nav - 桌面端在左侧，移动端 fixed 在底部 */}
          {!zenMode && (
            <FloatingNav isAdmin={isAdmin} />
          )}

          {/* Main Content - 内容区域 */}
          <MainContent>{children}</MainContent>
        </div>
      </div>
    </div>
  )
}
