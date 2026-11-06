/**
 * Kie-only mode: this fork runs every model through one Kie.ai key.
 *
 * On by default. Kie.ai runs the image, video and audio models; the LLM
 * node may also call Anthropic directly with the user's own Claude key.
 * The other providers' code stays in place but is hidden:
 * their keys are not offered in Settings, their models are not listed, and
 * new nodes default to Kie models. Set `NEXT_PUBLIC_NB_KIE_ONLY=0` in
 * `.env.local` (and rebuild) to bring every provider back.
 *
 * This module is imported by `@/lib/llm/catalog`, which `@/types` imports,
 * so it must not import from there.
 */

/** Provider ids as the model registry and settings spell them. */
type AnyProviderId = string;

export function isKieOnly(): boolean {
  // Written out in full so Next inlines it into browser bundles.
  return process.env.NEXT_PUBLIC_NB_KIE_ONLY !== "0";
}

/** Providers Kie-only mode keeps: Kie.ai, and Anthropic for the LLM node. */
const KIE_ONLY_PROVIDERS: ReadonlySet<string> = new Set(["kie", "anthropic"]);

/**
 * Whether a provider may be offered and called. In Kie-only mode only Kie
 * and Anthropic are; an LLM provider id ("google", "openai") counts the same.
 */
export function isProviderEnabled(provider: AnyProviderId): boolean {
  return !isKieOnly() || KIE_ONLY_PROVIDERS.has(provider);
}

/** Message for a request that names a provider Kie-only mode hides. */
export function providerDisabledMessage(provider: AnyProviderId): string {
  return `${provider} is turned off: this app runs its models through Kie.ai (and Claude directly for the LLM node). Set NEXT_PUBLIC_NB_KIE_ONLY=0 to turn the other providers back on.`;
}

/**
 * Node types Kie-only mode leaves out of the add menus and shortcuts: Kie
 * has no 3D models, and a ComfyUI app runs on ComfyUI rather than Kie.
 * Nodes already on a canvas still load.
 */
const NON_KIE_NODE_TYPES: ReadonlySet<string> = new Set(["generate3d", "comfyApp"]);

export function isNodeTypeEnabled(type: string): boolean {
  return !isKieOnly() || !NON_KIE_NODE_TYPES.has(type);
}
