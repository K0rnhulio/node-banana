import { afterEach, describe, expect, it } from "vitest";
import { getHostedDataDir, isHostedEnvironment } from "../hosted";

const HOST_KEYS = [
  "NODE_BANANA_HOSTED",
  "NODE_BANANA_DATA_DIR",
  "RAILWAY_ENVIRONMENT",
  "RAILWAY_PROJECT_ID",
  "RAILWAY_SERVICE_ID",
  "VERCEL",
  "FLY_APP_NAME",
  "RENDER",
] as const;

const original: Record<string, string | undefined> = {};

describe("hosted environment helpers", () => {
  afterEach(() => {
    for (const key of HOST_KEYS) {
      const prev = original[key];
      if (prev === undefined) delete process.env[key];
      else process.env[key] = prev;
    }
  });

  it("detects Railway as hosted", () => {
    for (const key of HOST_KEYS) original[key] = process.env[key];
    for (const key of HOST_KEYS) delete process.env[key];
    process.env.RAILWAY_ENVIRONMENT = "production";
    expect(isHostedEnvironment()).toBe(true);
  });

  it("uses NODE_BANANA_DATA_DIR when set", () => {
    for (const key of HOST_KEYS) original[key] = process.env[key];
    process.env.NODE_BANANA_DATA_DIR = "/mnt/volume/node-banana/";
    expect(getHostedDataDir()).toBe("/mnt/volume/node-banana");
  });
});
