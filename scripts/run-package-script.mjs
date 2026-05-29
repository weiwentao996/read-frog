import { spawnSync } from "node:child_process"

const [dir, ...args] = process.argv.slice(2)

if (!dir || args.length === 0) {
  console.error("Usage: node scripts/run-package-script.mjs <dir> <script> [...args]")
  process.exit(1)
}

const npmExecPath = process.env.npm_execpath
const command = npmExecPath ? process.execPath : "pnpm"
const commandArgs = npmExecPath
  ? [npmExecPath, "--dir", dir, ...args]
  : ["--dir", dir, ...args]

const result = spawnSync(command, commandArgs, {
  stdio: "inherit",
  shell: false,
})

process.exit(result.status ?? 1)
