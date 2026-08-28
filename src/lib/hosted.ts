import { mkdir } from "fs/promises";
import { join } from "path";

/**
 * True when Node Banana is running on a cloud host with no desktop folder picker.
 */
export function isHostedEnvironment(): boolean {
  return Boolean(
    process.env.NODE_BANANA_HOSTED === "true" ||
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_PROJECT_ID ||
    process.env.RAILWAY_SERVICE_ID ||
    process.env.VERCEL ||
    process.env.FLY_APP_NAME ||
    process.env.RENDER
  );
}

/**
 * Directory used to store workflows and generations on hosted deployments.
 * Override with NODE_BANANA_DATA_DIR (e.g. a Railway volume mount).
 */
export function getHostedDataDir(): string {
  const fromEnv = process.env.NODE_BANANA_DATA_DIR?.trim();
  if (fromEnv) {
    return fromEnv.replace(/[\\/]+$/, "") || fromEnv;
  }
  return join(process.cwd(), "data");
}

export async function ensureHostedDataDir(): Promise<string> {
  const dir = getHostedDataDir();
  await mkdir(dir, { recursive: true });
  return dir;
}
