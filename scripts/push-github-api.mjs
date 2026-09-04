import { spawnSync } from "node:child_process";

const repository = process.argv[2];
const branch = process.argv[3] ?? "main";
const skipWorkflows = process.argv.includes("--skip-workflows");

if (!repository) {
  console.error("Usage: node scripts/push-github-api.mjs OWNER/REPO [branch]");
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: options.encoding ?? "utf8",
    input: options.input,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, GH_HTTP_TIMEOUT: "120" },
  });
  if (result.status !== 0) {
    throw new Error(String(result.stderr || result.stdout || `${command} failed`));
  }
  return result.stdout;
}

function api(endpoint, payload, method = "POST") {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const args = ["api", "--method", method, endpoint];
      if (payload !== undefined) args.push("--input", "-");
      const output = run("gh", args, payload === undefined ? {} : { input: JSON.stringify(payload) });
      return JSON.parse(output);
    } catch (error) {
      lastError = error;
      console.error(`GitHub request retry ${attempt}/3`);
    }
  }
  throw lastError;
}

const entries = run("git", ["ls-tree", "-r", "--format=%(objectmode) %(path)", "HEAD"])
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const splitAt = line.indexOf(" ");
    return { mode: line.slice(0, splitAt), path: line.slice(splitAt + 1) };
  })
  .filter((entry) => !skipWorkflows || !entry.path.startsWith(".github/workflows/"));

const tree = [];
for (let index = 0; index < entries.length; index += 1) {
  const entry = entries[index];
  const content = run("git", ["show", `HEAD:${entry.path}`], { encoding: "buffer" });
  const blob = api(`repos/${repository}/git/blobs`, {
    content: Buffer.from(content).toString("base64"),
    encoding: "base64",
  });
  tree.push({ path: entry.path, mode: entry.mode, type: "blob", sha: blob.sha });
  if ((index + 1) % 10 === 0 || index + 1 === entries.length) {
    console.log(`Uploaded ${index + 1}/${entries.length} files`);
  }
}

const remoteTree = api(`repos/${repository}/git/trees`, { tree });
let currentHead;
try {
  currentHead = api(`repos/${repository}/git/ref/heads/${branch}`, undefined, "GET").object.sha;
} catch {
  currentHead = null;
}
const commit = api(`repos/${repository}/git/commits`, {
  message: "Build PromptPocket desktop app and download site",
  tree: remoteTree.sha,
  ...(currentHead ? { parents: [currentHead] } : {}),
});
if (currentHead) {
  api(`repos/${repository}/git/refs/heads/${branch}`, { sha: commit.sha, force: true }, "PATCH");
} else {
  api(`repos/${repository}/git/refs`, { ref: `refs/heads/${branch}`, sha: commit.sha });
}

console.log(`Published ${repository}@${branch}: ${commit.sha}`);
