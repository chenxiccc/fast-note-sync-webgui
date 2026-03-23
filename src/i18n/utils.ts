import i18n, { ensureResourceLoaded } from "./translations";


// 切换语言
export const changeLang = async (lang: string, storageKey: string = "lang") => {
  localStorage.setItem(storageKey, lang)
  // 先把资源预加载好
  await ensureResourceLoaded(lang);
  await i18n.changeLanguage(lang) // 切换语言
}

// 获取语言
export function getBrowserLang(storageKey?: string): string {
  // 如果显式指定了 key，则按指定 key 获取
  if (storageKey) {
    return localStorage.getItem(storageKey) || navigator.language || "en";
  }

  // 自动检测页面环境：分享页特征为 URL 中包含 share
  const isSharePage = typeof window !== "undefined" && 
    (window.location.pathname.toLowerCase().includes("share") || 
     window.location.search.toLowerCase().includes("share"));
  
  const key = isSharePage ? "share-lang" : "lang";
  let lang = localStorage.getItem(key);

  // 如果在分享页没找到 share-lang，尝试降级到通用 lang
  if (!lang && isSharePage) {
    lang = localStorage.getItem("lang");
  }

  // 最后后备到浏览器语言
  if (!lang) {
    lang = navigator.language;
  }

  const to = lang?.toString();
  return to ? (to.includes(",") ? to.split(",")[0] : to) : "en";
}