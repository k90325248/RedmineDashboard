import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// 定義路徑
const projectRoot = process.cwd();
const tauriConfigPath = path.join(projectRoot, "src-tauri", "tauri.conf.json");
const testConfigPath = path.join(
  projectRoot,
  "src-tauri",
  "tauri.conf.test.json",
);

// 讀取原始設定
try {
  console.log(`Reading configuration from ${tauriConfigPath}...`);
  const configRaw = fs.readFileSync(tauriConfigPath, "utf-8");
  const config = JSON.parse(configRaw);

  // 修改設定
  config.productName = `${config.productName} (Test)`;
  // 修改 identifier 以避免覆蓋正式版安裝與設定
  config.identifier = `${config.identifier}-test`;

  // 修改視窗標題
  if (config.app && config.app.windows) {
    config.app.windows = config.app.windows.map((win: any) => {
      // 簡單起見，對所有視窗標題加上 (Test)
      if (win.title) {
        win.title = `${win.title} (Test)`;
      }
      return win;
    });
  }

  // 寫入臨時測試設定
  console.log(`Writing test configuration to ${testConfigPath}...`);
  fs.writeFileSync(testConfigPath, JSON.stringify(config, null, 2));

  // 執行打包指令
  console.log("Starting build with test configuration...");
  // 繼承 stdio 以便在終端機看到詳細輸出
  execSync("tauri build --config src-tauri/tauri.conf.test.json", {
    stdio: "inherit",
    cwd: projectRoot,
  });

  console.log("Test build completed successfully.");
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
} finally {
  // 清理臨時檔案 (可選)
  // 若保留可方便檢查產生的設定內容
  // if (fs.existsSync(testConfigPath)) {
  //   fs.unlinkSync(testConfigPath);
  // }
}
