const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoUrl = "https://github.com/42core-team/wiki.git";
const BRANCHES = ["season2-reloaded", "season2", "season1", "rush02"];
const BASE_DIR = path.join(__dirname, "../content/wiki");
const MONOREPO_URL = "https://github.com/42core-team/monorepo.git";

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
      `git clone --branch ${branch} --single-branch --depth 1 ${repoUrl} ${targetDir}`,
      { stdio: "inherit" },
    );
  }
});

// Fetch stable tags (no pre-release hyphen) from monorepo and copy only /wiki
function getStableTags() {
  const output = execSync(`git ls-remote --tags --refs ${MONOREPO_URL}`, {
    encoding: "utf-8",
  });
  return (
    output
      .split("\n")
      .map((line) => line.split("\t")[1])
      .filter(Boolean)
      .map((ref) => ref.replace("refs/tags/", ""))
      // Treat tags containing '-' as pre-releases and exclude them
      .filter((tag) => !tag.includes("-"))
  );
}

function copyDirContentsSync(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return false;
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (fs.cpSync) {
    fs.cpSync(srcDir + "/", destDir, { recursive: true });
  } else {
    execSync(`cp -R "${srcDir}/." "${destDir}"`);
  }
  return true;
}

const TAGS = getStableTags();

TAGS.forEach((tag) => {
  const targetDir = path.join(BASE_DIR, tag);
  if (fs.existsSync(targetDir)) {
    console.log(`Tag ${tag} already present at ${targetDir}, skipping.`);
    return;
  }

  const tempDir = path.join(BASE_DIR, `.tmp-monorepo-${tag}`);
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log(`Cloning monorepo tag ${tag} (wiki only) into ${targetDir}...`);
  execSync(
    `git clone --depth 1 --filter=blob:none --sparse --branch ${tag} ${MONOREPO_URL} "${tempDir}"`,
    { stdio: "inherit" },
  );
  try {
    execSync("git sparse-checkout init --cone", {
      cwd: tempDir,
      stdio: "inherit",
    });
  } catch (_) {
    // ignore if already initialized
  }
  execSync('git sparse-checkout set "wiki"', {
    cwd: tempDir,
    stdio: "inherit",
  });

  const wikiSrc = path.join(tempDir, "wiki");
  const copied = copyDirContentsSync(wikiSrc, targetDir);
  if (!copied) {
    console.warn(`No /wiki directory found for tag ${tag}, skipping.`);
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
});
