const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REPO = "git@github.com:42core-team/wiki.git";
const BRANCHES = ["season2-reloaded", "season2", "season1", "rush02"];
const BASE_DIR = path.join(__dirname, "../content/wiki");

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
}

BRANCHES.forEach((branch) => {
  const targetDir = path.join(BASE_DIR, branch);
  if (fs.existsSync(targetDir)) {
    // If already cloned, fetch and checkout latest
    console.log(`Updating ${branch} in ${targetDir}...`);
    execSync("git fetch origin", { cwd: targetDir, stdio: "inherit" });
    execSync(`git checkout ${branch}`, { cwd: targetDir, stdio: "inherit" });
    execSync(`git pull origin ${branch}`, { cwd: targetDir, stdio: "inherit" });
  } else {
    // Clone the specific branch
    console.log(`Cloning ${branch} into ${targetDir}...`);
    execSync(
      `git clone --branch ${branch} --single-branch --depth 1 ${REPO} ${targetDir}`,
      { stdio: "inherit" },
    );
  }
});
