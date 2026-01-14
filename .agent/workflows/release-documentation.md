---
description: Automate release documentation and message generation
---

# Release Documentation Workflow

當使用者準備發布新版本 (Release) 時，請依照此 Workflow 自動執行以下動作：

## 1. 統整改動並更新 README.md

1.  **分析改動**：檢視自上次版本發布後的所有程式碼變更。
2.  **更新 README**：
    - 在 `README.md` 的「版本紀錄 (Changelog)」區塊頂部，插入新版本的版號與日期。
    - 列出詳細的改動項目，需分類 (例如：新功能、修復、優化) 並使用 **繁體中文** 撰寫。
    - 確保格式與現有紀錄保持一致。

## 2. 生成 Git Commit 訊息

生成一個符合 Conventional Commits 規範且使用 **繁體中文** 的 Commit 訊息。

- **格式**：`type(scope): subject`
- **範例**：`chore(release): 發布 v0.2.2，修復自動更新權限並新增版本升級腳本`

## 3. 生成 Release Tag 訊息 (User-Facing Notes)

生成一段給終端使用者看的 **繁體中文** 更新說明。
這段訊息將用於：

- `git tag -a -m "..."` 的訊息內容。
- 最終會顯示在 App 更新提示窗 (`App.vue`) 與 `update.json` 的 `notes` 欄位。

**內容要求**：

- 語氣親切、簡潔易懂。
- 避免過多技術術語，專注於使用者能感受到的價值 (例如：修復了更新視窗無法彈出的問題)。
- 使用換行符號 `\n` 或條列式呈現，確保在彈出視窗中排版整齊。

**範例**：

```text
1. 修復了自動更新視窗無法正常彈出的問題，現在您可以順利接收更新通知了！
2. 優化了版本升級流程，提升開發穩定性。
```
