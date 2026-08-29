import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGenerationCarousel } from "../useGenerationCarousel";
import { cacheGeneratedImage, clearGeneratedImageCache } from "@/store/generationImageCache";

const mockUpdateNodeData = vi.fn();

vi.mock("@/store/workflowStore", () => ({
  useWorkflowStore: (selector: (state: { updateNodeData: typeof mockUpdateNodeData }) => unknown) =>
    selector({ updateNodeData: mockUpdateNodeData }),
}));

describe("useGenerationCarousel", () => {
  const history = [
    { id: "img-1", image: "data:image/png;base64,one" },
    { id: "img-2", image: "data:image/png;base64,two" },
    { id: "img-3", image: "data:image/png;base64,three" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    clearGeneratedImageCache();
  });

  it("uses stored image data instead of loading from disk", async () => {
    const loadFn = vi.fn().mockResolvedValue("data:image/png;base64,from-disk");
    const { result } = renderHook(() =>
      useGenerationCarousel({
        nodeId: "gen-1",
        history,
        currentIndex: 0,
        loadFn,
        getStoredMedia: (item) => item.image,
        buildUpdate: (image, newIndex) => ({ outputImage: image, selectedHistoryIndex: newIndex }),
      })
    );

    await act(async () => {
      await result.current.handleNext();
    });

    expect(loadFn).not.toHaveBeenCalled();
    expect(mockUpdateNodeData).toHaveBeenCalledWith("gen-1", {
      outputImage: "data:image/png;base64,two",
      selectedHistoryIndex: 1,
    });
  });

  it("falls back to loadFn when history item has no stored image", async () => {
    const loadFn = vi.fn().mockResolvedValue("data:image/png;base64,from-disk");
    const { result } = renderHook(() =>
      useGenerationCarousel({
        nodeId: "gen-1",
        history: [{ id: "img-1" }, { id: "img-2" }],
        currentIndex: 0,
        loadFn,
        getStoredMedia: (item) => ("image" in item ? (item as { image?: string }).image : undefined),
        buildUpdate: (image, newIndex) => ({ outputImage: image, selectedHistoryIndex: newIndex }),
      })
    );

    await act(async () => {
      await result.current.handleNext();
    });

    expect(loadFn).toHaveBeenCalledWith("img-2");
    expect(mockUpdateNodeData).toHaveBeenCalledWith("gen-1", {
      outputImage: "data:image/png;base64,from-disk",
      selectedHistoryIndex: 1,
    });
  });

  it("wraps around to the last item on previous from index 0", async () => {
    const loadFn = vi.fn();
    const { result } = renderHook(() =>
      useGenerationCarousel({
        nodeId: "gen-1",
        history,
        currentIndex: 0,
        loadFn,
        getStoredMedia: (item) => item.image,
        buildUpdate: (image, newIndex) => ({ outputImage: image, selectedHistoryIndex: newIndex }),
      })
    );

    await act(async () => {
      await result.current.handlePrevious();
    });

    expect(mockUpdateNodeData).toHaveBeenCalledWith("gen-1", {
      outputImage: "data:image/png;base64,three",
      selectedHistoryIndex: 2,
    });
  });

  it("uses the runtime cache when history items have no inline image", async () => {
    cacheGeneratedImage("img-2", "data:image/png;base64,cached");
    const loadFn = vi.fn().mockResolvedValue("data:image/png;base64,from-disk");
    const { result } = renderHook(() =>
      useGenerationCarousel({
        nodeId: "gen-1",
        history: [{ id: "img-1" }, { id: "img-2" }],
        currentIndex: 0,
        loadFn,
        buildUpdate: (image, newIndex) => ({ outputImage: image, selectedHistoryIndex: newIndex }),
      })
    );

    await act(async () => {
      await result.current.handleNext();
    });

    expect(loadFn).not.toHaveBeenCalled();
    expect(mockUpdateNodeData).toHaveBeenCalledWith("gen-1", {
      outputImage: "data:image/png;base64,cached",
      selectedHistoryIndex: 1,
    });
  });
});
