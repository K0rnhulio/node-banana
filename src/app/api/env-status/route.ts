import { NextResponse } from "next/server";
import { getHostedDataDir, isHostedEnvironment } from "@/lib/hosted";

export interface EnvStatusResponse {
  gemini: boolean;
  openai: boolean;
  anthropic: boolean;
  replicate: boolean;
  fal: boolean;
  kie: boolean;
  wavespeed: boolean;
  hosted: boolean;
  defaultProjectDir: string | null;
}

export async function GET() {
  const hosted = isHostedEnvironment();
  const status: EnvStatusResponse = {
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    replicate: !!process.env.REPLICATE_API_KEY,
    fal: !!process.env.FAL_API_KEY,
    kie: !!process.env.KIE_API_KEY,
    wavespeed: !!process.env.WAVESPEED_API_KEY,
    hosted,
    defaultProjectDir: hosted ? getHostedDataDir() : null,
  };

  return NextResponse.json(status);
}
