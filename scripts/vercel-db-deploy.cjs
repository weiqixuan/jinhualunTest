const { spawnSync } = require("node:child_process");

function shouldRunDbDeploy(env) {
  const vercelEnv = env.VERCEL_ENV ?? "";

  return vercelEnv.toLowerCase() === "production" || env.VERCEL_FORCE_DB_DEPLOY === "1";
}

function runVercelDbDeploy({
  env = process.env,
  platform = process.platform,
  spawnSyncImpl = spawnSync,
  log = console.log
} = {}) {
  const vercelEnv = env.VERCEL_ENV ?? "";

  if (!shouldRunDbDeploy(env)) {
    log(`Skipping Prisma migrate/seed for Vercel env "${vercelEnv || "unknown"}".`);
    return 0;
  }

  const npmCommand = platform === "win32" ? "npm.cmd" : "npm";

  for (const args of [
    ["run", "db:migrate:deploy"],
    ["run", "db:seed"]
  ]) {
    const result = spawnSyncImpl(npmCommand, args, {
      stdio: "inherit",
      env
    });

    if (result.status !== 0) {
      return result.status ?? 1;
    }
  }

  return 0;
}

module.exports = {
  runVercelDbDeploy,
  shouldRunDbDeploy
};

if (require.main === module) {
  process.exit(runVercelDbDeploy());
}
