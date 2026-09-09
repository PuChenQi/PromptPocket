"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./download.css";

type Theme = "light" | "dark";
type Platform = "windows" | "mac" | "other";

const REPOSITORY_URL = "https://github.com/PuChenQi/PromptPocket";
const VERSION = "1.1.0";
const RELEASE_URL = `${REPOSITORY_URL}/releases/download/v${VERSION}`;
const WINDOWS_DOWNLOAD_URL = `${RELEASE_URL}/PromptPocket_${VERSION}_x64-setup.exe`;
const MAC_ARM_DOWNLOAD_URL = `${RELEASE_URL}/PromptPocket_${VERSION}_aarch64.dmg`;
const MAC_INTEL_DOWNLOAD_URL = `${RELEASE_URL}/PromptPocket_${VERSION}_x64.dmg`;

export default function DownloadPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    const saved = window.localStorage.getItem("prompt-pocket-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const source = `${navigator.platform} ${navigator.userAgent}`.toLowerCase();
    const detectedPlatform = source.includes("win") ? "windows" : source.includes("mac") ? "mac" : "other";
    const timer = window.setTimeout(() => {
      setTheme(saved === "dark" || saved === "light" ? saved : preferred);
      setPlatform(detectedPlatform);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("prompt-pocket-theme", theme);
  }, [theme]);

  return (
    <main className="site-page">
      <nav className="site-nav">
        <a className="site-brand" href="/download" aria-label="PromptPocket 首页">
          <span className="site-brand-mark">p</span>
          <span>PromptPocket</span>
        </a>
        <div className="site-nav-links">
          <a href="#features">功能</a>
          <a href="#privacy">隐私</a>
          <a href={REPOSITORY_URL || "#download"}>GitHub</a>
          <button
            className="site-theme-button"
            onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
            aria-label={theme === "light" ? "切换到暗夜模式" : "切换到明亮模式"}
          >
            {theme === "light" ? "◐" : "☀"}
          </button>
        </div>
      </nav>

      <section className="site-hero">
        <div className="hero-copy">
          <div className="site-kicker"><span /> 本地优先的 AI 提示词库</div>
          <h1>你的好提示词，<br /><em>应该留在自己手里。</em></h1>
          <p>
            分类整理、效果图预览、秒级搜索、一键复制。PromptPocket 不需要账号，
            不把内容上传到云端，让每一个好想法都安静地留在你的电脑里。
          </p>
          <div className="hero-actions">
            <a className="download-primary" href={platform === "windows" ? WINDOWS_DOWNLOAD_URL : "#download"}>
              <span>{platform === "mac" ? "◆" : "▦"}</span>
              {platform === "mac" ? "下载 macOS 版" : platform === "windows" ? "下载 Windows 版" : "选择你的系统"}
            </a>
            <Link className="download-secondary" href="/">在线体验</Link>
          </div>
          <div className="hero-note"><span>✓</span> 免费使用　·　无需登录　·　支持明亮 / 暗夜模式</div>
        </div>

        <div className="product-window" aria-label="PromptPocket 产品界面预览">
          <div className="window-bar">
            <span className="window-dot" /><span className="window-dot" /><span className="window-dot" />
            <small>PromptPocket</small>
          </div>
          <div className="window-body">
            <aside className="preview-sidebar">
              <div className="preview-logo"><i>p</i><b>PromptPocket</b></div>
              <div className="preview-nav active"><span>▦</span>全部提示词<small>24</small></div>
              <div className="preview-nav"><span>☆</span>我的收藏<small>6</small></div>
              <label>分类</label>
              <div className="preview-nav"><i className="orange" />内容写作<small>8</small></div>
              <div className="preview-nav"><i className="blue" />编程开发<small>7</small></div>
              <div className="preview-nav"><i className="purple" />研究分析<small>5</small></div>
            </aside>
            <div className="preview-main">
              <div className="preview-top"><div>⌕　搜索提示词…</div><button>＋ 新建提示词</button></div>
              <h2>全部提示词</h2>
              <p className="preview-sub">24 条提示词，随用随取</p>
              <div className="preview-cards">
                <article><small><i className="orange" /> 内容写作</small><h3>把复杂概念讲清楚</h3><p>请用清晰、自然的中文解释以下概念。先用一句话给出核心结论……</p><button>⧉　复制提示词</button></article>
                <article><small><i className="blue" /> 编程开发</small><h3>代码审查助手</h3><p>你是一名资深工程师。请审查下面的代码，优先找出可能导致错误的地方……</p><button>⧉　复制提示词</button></article>
                <article><small><i className="purple" /> 研究分析</small><h3>深度研究提纲</h3><p>围绕主题制定一份研究提纲，区分事实、观点和待验证假设……</p><button>⧉　复制提示词</button></article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-strip">
        <span><i>⌂</i> 本机存储</span>
        <span><i>↯</i> 离线可用</span>
        <span><i>⇅</i> JSON 备份</span>
        <span><i>◉</i> 开源透明</span>
      </div>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span>简单，却不简陋</span>
          <h2>为每天都在使用提示词的人而做</h2>
          <p>没有工作区、积分或订阅提醒。打开软件，找到内容，复制，然后继续工作。</p>
        </div>
        <div className="feature-grid">
          <article><b>01</b><h3>分类井然有序</h3><p>按写作、开发、研究或任何自己的方式整理，分类名称随时可改。</p></article>
          <article><b>02</b><h3>一键立即复制</h3><p>无需点进详情，卡片上直接复制完整提示词，减少重复操作。</p></article>
          <article><b>03</b><h3>效果一眼看懂</h3><p>为每条提示词添加本地图片，在卡片上预览结果，点击即可查看大图。</p></article>
          <article><b>04</b><h3>搜索快得像记忆</h3><p>同时检索标题、正文和标签，提示词再多也能迅速找到。</p></article>
          <article><b>05</b><h3>明暗都舒服</h3><p>明亮与暗夜模式一键切换，并自动记住你的显示偏好。</p></article>
          <article><b>06</b><h3>数据握在手里</h3><p>文字和图片都留在设备中，并可通过 JSON 备份完整迁移。</p></article>
        </div>
      </section>

      <section className="download-section" id="download">
        <div className="section-heading">
          <span>下载桌面版</span>
          <h2>选择你的系统</h2>
          <p>安装后即可离线使用。当前版本由 GitHub 自动构建并校验。</p>
        </div>
        <div className="platform-grid">
          <article className={platform === "windows" ? "recommended" : ""}>
            {platform === "windows" && <mark>适合你的设备</mark>}
            <div className="platform-icon windows-icon">▦</div>
            <div><h3>Windows</h3><p>Windows 10 / 11 · 64 位</p></div>
            <a href={WINDOWS_DOWNLOAD_URL}>下载 Windows 版 <span>→</span></a>
          </article>
          <article className={platform === "mac" ? "recommended" : ""}>
            {platform === "mac" && <mark>适合你的设备</mark>}
            <div className="platform-icon mac-icon">◆</div>
            <div><h3>macOS</h3><p>Apple 芯片 / Intel 芯片</p></div>
            <div className="platform-actions">
              <a href={MAC_ARM_DOWNLOAD_URL}>Apple 芯片 <span>→</span></a>
              <a href={MAC_INTEL_DOWNLOAD_URL}>Intel 芯片 <span>→</span></a>
            </div>
          </article>
        </div>
        {!REPOSITORY_URL && <p className="release-pending">安装包发布后，下载按钮会自动指向最新版。</p>}
      </section>

      <section className="privacy-section" id="privacy">
        <div className="privacy-copy">
          <span>PRIVACY BY DEFAULT</span>
          <h2>隐私不是设置项，<br />而是默认的工作方式。</h2>
          <p>PromptPocket 没有服务器账户，也不需要网络连接。提示词保存在操作系统为应用分配的本地空间，只有你能访问。</p>
          <ul><li><i>✓</i> 无账户与登录</li><li><i>✓</i> 无遥测与广告</li><li><i>✓</i> 数据可随时导出</li></ul>
        </div>
        <div className="privacy-visual">
          <div className="lock-ring"><span>●</span><i /></div>
          <strong>100%</strong><small>LOCAL ONLY</small>
        </div>
      </section>

      <footer className="site-footer">
        <a className="site-brand" href="/download"><span className="site-brand-mark">p</span><span>PromptPocket</span></a>
        <p>把好提示词收进口袋。</p>
        <div><a href={REPOSITORY_URL || "#download"}>GitHub</a><a href="#privacy">隐私说明</a><span>© 2026 PromptPocket</span></div>
      </footer>
    </main>
  );
}
