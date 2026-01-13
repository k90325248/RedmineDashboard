import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];

if (!version) {
  console.error("請提供版本號: bun run bump <version>");
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+/.test(version)) {
  console.error("版本號格式錯誤，應為 x.y.z (例如 0.2.1)");
  process.exit(1);
}

const rootDir = process.cwd();

// 1. Update package.json
const packageJsonPath = join(rootDir, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
packageJson.version = version;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
console.log(`Updated package.json to ${version}`);

// 2. Update src-tauri/tauri.conf.json
const tauriConfPath = join(rootDir, "src-tauri", "tauri.conf.json");
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf-8"));
tauriConf.version = version;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
console.log(`Updated tauri.conf.json to ${version}`);

// 3. Update src-tauri/Cargo.toml
const cargoTomlPath = join(rootDir, "src-tauri", "Cargo.toml");
let cargoToml = readFileSync(cargoTomlPath, "utf-8");
// Replace version = "x.y.z" under [package]
// Use a regex that matches the first version = "..." occurrence which is typically the package version
cargoToml = cargoToml.replace(/^version = "[^"]+"/m, `version = "${version}"`);
writeFileSync(cargoTomlPath, cargoToml);
console.log(`Updated Cargo.toml to ${version}`);

console.log("\n✅ 版本號更新完成！");
