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

## 版本紀錄 (Changelog)

### v0.4.0 (2026-01-23)

- **系統列與背景執行 (System Tray)**：
  - 新增 **系統列圖示 (Tray Icon)**，支援單次點擊操作與右鍵選單 (顯示/退出)。
  - 實作 **關閉時縮小至系統列 (Minimize to Tray)**，防止誤關應用程式。
  - 實作 **啟動時直接縮小 (Start Minimized)**，配合開機自動啟動使用，不干擾使用者。
  - 新增 **單一實例鎖定 (Single Instance Lock)**，避免同時開啟多個應用程式視窗。
- **設定頁面 (Settings)**：
  - 新增 **開機時自動啟動 (Auto Start)** 設定開關。
  - 新增 **檢查更新 (Check Update)** 按鈕，可手動檢查新版本。
- **自動更新優化 (Auto Update)**：
  - 實作 **每小時自動檢查更新** 機制。
  - 新增 **測試版建構流程 (Test Build)**，可產生獨立設定的測試版安裝檔 (`-test`)，不覆蓋正式版。
- **介面優化**：
  - **工時紀錄**：近期工時紀錄列表新增 **分頁功能 (Pagination)**。
  - **按鈕狀態**：設定頁面與工時頁面的操作按鈕新增 Loading 狀態反饋。

### v0.3.1 (2026-01-21)

- **工時管理 (WorkTime)**：
  - **編輯功能**：新增工時紀錄編輯功能 (ModelUpdate)，支援修改日期、時數、活動類型與備註。
  - **刪除功能**：新增工時紀錄刪除功能 (ModelDelete)，刪除前會顯示詳細資訊供確認。
  - **介面優化**：Activity List 現在會顯示近 60 天內指派給自己的議題更動與新增 (Created) 紀錄。
- **系統核心 (Core)**：
  - **API 修復**：修正 `crosFetch` 在接收 `204 No Content` 或空回應時導致的 JSON 解析錯誤，確保更新與刪除操作的穩定性。
  - **UI 優化**：調整儀表板佈局與組件高度。

### v0.3.0 (2026-01-14)

- **活動清單重構 (Activity List)**：
  - 全面升級為 **Journal-based** 變更紀錄，可顯示詳細的屬性變更 (如狀態、優先權、自訂欄位) 與註解。
  - 實作 **漸進式載入 (Progressive Loading)**，即時顯示已讀取的活動，無需等待全部請求完成。
  - 支援 **自訂欄位 (Custom Fields)** 的名稱顯示與變更追蹤。
- **Dashboard 新功能**：
  - 新增 **議題狀態圖表 (Issue Status Chart)**，以甜甜圈圖可視化呈現目前指派給自己的議題狀態分佈。
  - **每日各專案議題耗用時數**：重構資料讀取邏輯，支援 **月份快取 (Monthly Caching)** 與載入狀態指示，大幅提升切換日期的流暢度。
- **系統架構優化**：
  - 引入 **Pinia Store (`redmineStore`)**，集中管理欄位名稱與狀態的中文翻譯對照。
  - 新增 `getIssue` (支援 Journals)、`getIssues` 等 API 工具函式。

### v0.2.1

- **Dashboard 重構**：
  - 全面導入 `dayjs` 處理日期運算，提升準確度。
  - 使用 `lodash` 優化資料處理邏輯。
  - 新增「本周每日各專案堆疊圖」，使用 `echarts` 視覺化呈現每日工時分佈。
  - 修復 `待處理議題` 與 `逾期任務` 中因相對日期 (e.g. `t-7d`) 導致的 API 422 錯誤，改採日期實算。
- **API Utilities 優化**：
  - 重構 `crosFetch`，統一 API 請求處理與錯誤回報。
  - 新增 `getUsersCurrent`, `getProjects` (支援自動分頁), `getAllActiveProjects`, `getTimeEntries` 等工具函式。
- **UI/UX 改進**：
  - 登入頁面整合新的 `crosFetch`，提供更詳細的錯誤回饋。
  - 專案名稱格式化 (去除前綴編號)。
- **系統更新**：
  - 升級 `tauri`, `vue`, `echarts` 等依賴版本。

### v0.2.2

- **自動更新修復**：
  - 修正權限設定 (新增 `updater`, `process`, `dialog` 權限)，解決更新視窗無法彈出及重啟失敗的問題。
- **開發體驗優化**：
  - 新增 `bun run bump <version>` 腳本，可一次同步更新所有設定檔的版本號。
  - 優化 GitHub Release 流程，統一使用單一 Tag (`vX.X.X`) 發布。

### v0.2.3

- **CI/CD 自動化**：
  - 新增自動上傳 `update.json` 至 pCloud 的流程，加快更新檔同步速度。
  - GitHub Release 改為 Pre-release 模式並自動發布 (非草稿)。
  - Release 說明內容將直接讀取 Git Tag 訊息，提升發布效率。

### v0.2.4

- **自動更新修復**：
  - 修正 pCloud API Endpoint 為 `eapi.pcloud.com` (EU Region)，解決 Token 無效問題。
  - 修正更新檔下載連結格式 (解決 GitHub Release 檔名空格變點的問題)。

### v0.2.5

- **自動更新修復**：
  - 改用 pCloud Folder ID 進行上傳，徹底解決路徑解析與特殊字元導致的上傳失敗問題。
