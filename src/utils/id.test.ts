import { afterEach, describe, expect, it, vi } from "vitest";
import { createId } from "./id";

const originalCrypto = globalThis.crypto;

afterEach(() => {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: originalCrypto,
  });
  vi.restoreAllMocks();
});

describe("createId", () => {
  it("uses native randomUUID when available", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000000",
    );

    expect(createId()).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("falls back to getRandomValues when randomUUID is unavailable", () => {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: {
        getRandomValues: (bytes: Uint8Array) => {
          bytes.fill(0);
          return bytes;
        },
      },
    });

    expect(createId()).toBe("00000000-0000-4000-8000-000000000000");
  });
});
