# PromptPocket

PromptPocket 是一个本地优先的提示词分类管理工具。它支持 Windows 与 macOS，打开即可使用，不需要注册账号，也不会把提示词上传到云端。

[下载官网](https://prompt-pocket.netlify.app/download) · [GitHub Releases](https://github.com/PuChenQi/PromptPocket/releases/latest)

## 功能

- 按自定义分类整理提示词
- 同时搜索标题、正文与标签
- 在卡片上一键复制完整提示词
- 收藏、编辑和删除内容
- 明亮 / 暗夜模式切换并记住偏好
- 导出、导入 JSON 本地备份
- Windows 10/11 与 macOS Apple/Intel 双架构支持

## 数据与隐私

桌面版通过系统 WebView 的本地存储保存数据，没有远程数据库、用户账户、遥测或广告。卸载软件或清理应用数据前，请先在软件左下角导出 JSON 备份。

## 下载与安装

前往 [GitHub Releases](https://github.com/PuChenQi/PromptPocket/releases/latest) 下载最新版：

- Windows：选择 `.exe` 安装程序，或 `.msi` 安装包。
- Apple Silicon Mac（M1/M2/M3/M4 等）：选择文件名包含 `aarch64` 的 `.dmg`。
- Intel Mac：选择文件名包含 `x64` 的 `.dmg`。

首个公开版本暂未购买商业代码签名证书。系统可能显示开发者来源提醒：Windows 可在“更多信息”中继续，macOS 可在“系统设置 → 隐私与安全性”中确认打开。

## 本地开发

需要 Node.js 22、pnpm 与 Rust stable。

```bash
pnpm install
pnpm desktop:dev
```

构建网页与桌面资源：

```bash
pnpm build
pnpm desktop:build
```

原生安装包由 GitHub Actions 在对应的 Windows/macOS 环境中自动构建并发布。

## 技术组成

- React + TypeScript
- Tauri 2
- Vinext / Vite
- GitHub Actions 自动发布

## License

[MIT](LICENSE)
