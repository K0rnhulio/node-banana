import { describe, it, expect } from "vitest";
import { getKieApiModelId } from "../kie";
import type { GenerationInput } from "@/lib/providers/types";

function makeInput(overrides: Partial<GenerationInput> = {}): GenerationInput {
  return {
    model: {
      id: "grok-imagine-image-2-0/text-to-image",
      name: "Grok Imagine 2.0",
      description: null,
      provider: "kie",
      capabilities: ["text-to-image", "image-to-image"],
    },
    prompt: "edit the photo",
    images: [],
    parameters: {},
    ...overrides,
  };
}

describe("getKieApiModelId Grok Imagine routing", () => {
  it("keeps text-to-image when no reference is attached", () => {
    expect(getKieApiModelId("grok-imagine-image-2-0/text-to-image", makeInput())).toBe(
      "grok-imagine-image-2-0/text-to-image"
    );
    expect(getKieApiModelId("grok-imagine/text-to-image", makeInput())).toBe(
      "grok-imagine/text-to-image"
    );
  });

  it("routes Grok Imagine 2.0 to image-edit when images[] is set", () => {
    expect(
      getKieApiModelId(
        "grok-imagine-image-2-0/text-to-image",
        makeInput({ images: ["data:image/png;base64,abc"] })
      )
    ).toBe("grok-imagine-image-2-0/image-edit");
  });

  it("routes Grok Imagine 2.0 to image-edit when dynamicInputs carries image_urls", () => {
    expect(
      getKieApiModelId(
        "grok-imagine-image-2-0/text-to-image",
        makeInput({ dynamicInputs: { image_urls: "https://cdn.example/ref.png" } })
      )
    ).toBe("grok-imagine-image-2-0/image-edit");
  });

  it("routes Grok Imagine v1 to image-to-image when a reference is attached", () => {
    expect(
      getKieApiModelId(
        "grok-imagine/text-to-image",
        makeInput({ images: ["https://cdn.example/ref.png"] })
      )
    ).toBe("grok-imagine/image-to-image");
  });

  it("does not remap an already-selected edit model", () => {
    expect(
      getKieApiModelId(
        "grok-imagine-image-2-0/image-edit",
        makeInput({ images: ["https://cdn.example/ref.png"] })
      )
    ).toBe("grok-imagine-image-2-0/image-edit");
  });

  it("keeps GPT Image 2 text-to-image when no reference is attached", () => {
    expect(getKieApiModelId("gpt-image-2-text-to-image", makeInput())).toBe(
      "gpt-image-2-text-to-image"
    );
  });

  it("routes GPT Image 2 to image-to-image when a reference is attached", () => {
    expect(
      getKieApiModelId(
        "gpt-image-2-text-to-image",
        makeInput({ images: ["https://cdn.example/ref.png"] })
      )
    ).toBe("gpt-image-2-image-to-image");
  });

  it("routes Qwen Image 3.0 Pro to image-to-image when a reference is attached", () => {
    expect(getKieApiModelId("qwen3/pro-text-to-image", makeInput())).toBe(
      "qwen3/pro-text-to-image"
    );
    expect(
      getKieApiModelId(
        "qwen3/pro-text-to-image",
        makeInput({ images: ["https://cdn.example/ref.png"] })
      )
    ).toBe("qwen3/pro-image-to-image");
    expect(
      getKieApiModelId(
        "qwen3/text-to-image",
        makeInput({ images: ["https://cdn.example/ref.png"] })
      )
    ).toBe("qwen3/image-to-image");
  });
});
