import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isKieOnly, isNodeTypeEnabled, isProviderEnabled } from "../kieOnly";
import { listModels } from "../registry";
import { CATALOG_DIR_ENV, resetCatalog } from "../catalog";

describe("Kie-only mode", () => {
  const original = process.env.NEXT_PUBLIC_NB_KIE_ONLY;
  let catalogDir: string;
  const mockFetch = vi.fn();

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_NB_KIE_ONLY; // the default: on
    catalogDir = fs.mkdtempSync(path.join(os.tmpdir(), "nb-kie-only-"));
    process.env[CATALOG_DIR_ENV] = catalogDir;
    resetCatalog();
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_NB_KIE_ONLY = original;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    fs.rmSync(catalogDir, { recursive: true, force: true });
  });

  it("is on unless turned off with 0", () => {
    expect(isKieOnly()).toBe(true);
    expect(isProviderEnabled("kie")).toBe(true);
    expect(isProviderEnabled("anthropic")).toBe(true);
    for (const provider of ["gemini", "google", "openai", "replicate", "fal", "wavespeed", "comfy"]) {
      expect(isProviderEnabled(provider), provider).toBe(false);
    }
    process.env.NEXT_PUBLIC_NB_KIE_ONLY = "0";
    expect(isKieOnly()).toBe(false);
    expect(isProviderEnabled("openai")).toBe(true);
  });

  it("hides the 3D and ComfyUI nodes only", () => {
    expect(isNodeTypeEnabled("generate3d")).toBe(false);
    expect(isNodeTypeEnabled("comfyApp")).toBe(false);
    expect(isNodeTypeEnabled("nanoBanana")).toBe(true);
    expect(isNodeTypeEnabled("llmGenerate")).toBe(true);
  });

  it("lists only Kie models, whatever other keys are set, and calls no other provider", async () => {
    const result = await listModels({}, { kie: "k", openai: "o", replicate: "r", fal: "f", comfy: "c", gemini: "g" });
    if (!result.ok) throw new Error(result.error);
    expect(result.models.length).toBeGreaterThan(0);
    expect(new Set(result.models.map((m) => m.provider))).toEqual(new Set(["kie"]));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("refuses a request for a hidden provider", async () => {
    const result = await listModels({ provider: "openai" }, { openai: "o" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Kie.ai");
  });
});
