# Redmine Dashboard

一個基於 Tauri 2 和 Vue 3 構建的現代化 Redmine 桌面客戶端。

## 特色

- **跨平台**：可在 Windows、macOS 和 Linux 上運行。
- **現代化介面**：使用 Vue 3、Nuxt UI 和 TailwindCSS 構建。
- **極速效能**：由 Rust (Tauri) 和 Vite 驅動。
- **類型安全**：完整的 TypeScript 支援。

## 技術棧 (Tech Stack)

- **核心**：[Tauri v2](https://v2.tauri.app/)
- **前端框架**：[Vue 3](https://vuejs.org/)
- **建構工具**：[Vite](https://vitejs.dev/)
- **語言**：[TypeScript](https://www.typescriptlang.org/)
- **狀態管理**：[Pinia](https://pinia.vuejs.org/)
- **UI 元件**：[Nuxt UI](https://ui.nuxt.com/) / [TailwindCSS](https://tailwindcss.com/)
- **驗證**：[Valibot](https://valibot.dev/)

## 開始使用 (Getting Started)

### 環境需求 (Prerequisites)

在開始之前，請確保您已安裝以下工具：

1.  **Node.js** (建議使用 [Bun](https://bun.sh/) 以獲得更快的速度)
2.  **Rust & Cargo** (Tauri 開發必備)
    - 請至 [Rust 官方網站](https://www.rust-lang.org/tools/install) 下載並安裝。
    - 安裝後，請確保 `cargo` 指令可在終端機中執行。

> 💡 **提示**：如果您在執行 Tauri 指令時遇到 `program not found` 錯誤，通常是因為 Rust 未正確安裝或未加入環境變數 (PATH)。

### 安裝依賴 (Installation)

使用 Bun 安裝專案依賴：

```bash
bun install
```

### 開發模式 (Development)

**純網頁模式 (Web Only)**
僅啟動前端開發伺服器，不開啟桌面視窗：

```bash
bun run dev
```

**桌面應用模式 (Desktop App)**
啟動 Tauri 應用程式開發模式 (需確保 Rust 已安裝)：

```bash
bun run tauri dev
```

### 打包發布 (Build)

建構生產環境的安裝檔：

```bash
bun run tauri build
```

## Git 版本標籤操作 (Git Tags)

### 新增標籤 (Create Tag)

```bash
# 新增一個標籤 (例如 v0.0.1)
git tag v0.0.1
```

### 推送標籤 (Push Tag)

```bash
# 推送指定標籤到遠端
git push origin v0.0.1

# 或 推送所有標籤
git push origin --tags
```

### 刪除標籤 (Delete Tag)

```bash
# 刪除本機標籤
git tag -d v0.0.1

# 刪除遠端標籤
git push origin --delete v0.0.1
```

## 推薦的開發環境 (IDE Setup)

- [VS Code](https://code.visualstudio.com/)
- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
