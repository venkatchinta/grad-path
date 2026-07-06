import { describe, expect, it } from "vitest";
import { GRADPATH_ENGINE_VERSION } from "./index.js";

describe("@gradpath/engine", () => {
  it("exposes a version", () => {
    expect(GRADPATH_ENGINE_VERSION).toBe("0.1.0");
  });
});
