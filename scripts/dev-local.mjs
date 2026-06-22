import { spawn } from "node:child_process";
import process from "node:process";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const databaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable&pgbouncer=true&schema=public";
const directUrl =
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable&schema=public";

const db = new PGlite("./.pglite");
await db.waitReady;

const server = new PGLiteSocketServer({
  db,
  host: "127.0.0.1",
  port: 5432,
  maxConnections: 10
});

await server.start();
console.log("PGlite PostgreSQL server listening on 127.0.0.1:5432");

const child = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl,
    DIRECT_URL: process.env.DIRECT_URL ?? directUrl,
    AUTH_SECRET:
      process.env.AUTH_SECRET ?? "local-dev-secret-at-least-long-enough",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  }
});

async function shutdown(code = 0) {
  child.kill();
  await server.stop().catch(() => {});
  await db.close().catch(() => {});
  process.exit(code);
}

child.on("exit", async (code) => {
  await server.stop().catch(() => {});
  await db.close().catch(() => {});
  process.exit(code ?? 0);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
