const assert = require("node:assert/strict");
const test = require("node:test");
const { runVercelDbDeploy } = require("./vercel-db-deploy.cjs");

test("runVercelDbDeploy skips migrate and seed outside production by default", () => {
  const logs = [];
  const calls = [];

  const exitCode = runVercelDbDeploy({
    env: {
      VERCEL_ENV: "preview"
    },
    spawnSyncImpl(command, args) {
      calls.push({ command, args });
      return { status: 0 };
    },
    log(message) {
      logs.push(message);
    }
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(calls, []);
  assert.deepEqual(logs, ['Skipping Prisma migrate/seed for Vercel env "preview".']);
});

test("runVercelDbDeploy runs migrate and seed in production", () => {
  const calls = [];

  const exitCode = runVercelDbDeploy({
    env: {
      VERCEL_ENV: "production",
      DATABASE_URL: "postgres://demo"
    },
    platform: "linux",
    spawnSyncImpl(command, args, options) {
      calls.push({ command, args, options });
      return { status: 0 };
    }
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(calls, [
    {
      command: "npm",
      args: ["run", "db:migrate:deploy"],
      options: {
        stdio: "inherit",
        env: {
          VERCEL_ENV: "production",
          DATABASE_URL: "postgres://demo"
        }
      }
    },
    {
      command: "npm",
      args: ["run", "db:seed"],
      options: {
        stdio: "inherit",
        env: {
          VERCEL_ENV: "production",
          DATABASE_URL: "postgres://demo"
        }
      }
    }
  ]);
});

test("runVercelDbDeploy runs on forced deploy outside production and uses npm.cmd on Windows", () => {
  const calls = [];

  const exitCode = runVercelDbDeploy({
    env: {
      VERCEL_ENV: "preview",
      VERCEL_FORCE_DB_DEPLOY: "1"
    },
    platform: "win32",
    spawnSyncImpl(command, args) {
      calls.push({ command, args });
      return { status: 0 };
    }
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(calls, [
    {
      command: "npm.cmd",
      args: ["run", "db:migrate:deploy"]
    },
    {
      command: "npm.cmd",
      args: ["run", "db:seed"]
    }
  ]);
});

test("runVercelDbDeploy returns the first failing status code and stops subsequent commands", () => {
  const calls = [];

  const exitCode = runVercelDbDeploy({
    env: {
      VERCEL_ENV: "production"
    },
    platform: "linux",
    spawnSyncImpl(command, args) {
      calls.push({ command, args });

      if (args[1] === "db:migrate:deploy") {
        return { status: 2 };
      }

      return { status: 0 };
    }
  });

  assert.equal(exitCode, 2);
  assert.deepEqual(calls, [
    {
      command: "npm",
      args: ["run", "db:migrate:deploy"]
    }
  ]);
});

test("runVercelDbDeploy returns the failing status code from seed after a successful migrate", () => {
  const calls = [];

  const exitCode = runVercelDbDeploy({
    env: {
      VERCEL_ENV: "production"
    },
    platform: "linux",
    spawnSyncImpl(command, args) {
      calls.push({ command, args });

      if (args[1] === "db:seed") {
        return { status: 3 };
      }

      return { status: 0 };
    }
  });

  assert.equal(exitCode, 3);
  assert.deepEqual(calls, [
    {
      command: "npm",
      args: ["run", "db:migrate:deploy"]
    },
    {
      command: "npm",
      args: ["run", "db:seed"]
    }
  ]);
});

test("runVercelDbDeploy returns a fallback exit code when a child process has no status", () => {
  const exitCode = runVercelDbDeploy({
    env: {
      VERCEL_ENV: "production"
    },
    spawnSyncImpl() {
      return { status: null };
    }
  });

  assert.equal(exitCode, 1);
});
