/**
 * EmuDevz gamespec §3.4 — Reading the header (Vitest).
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const testsDir = dirname(fileURLToPath(import.meta.url));
const root = dirname(testsDir);

function codeHref(rel) {
  return pathToFileURL(join(root, "code", rel)).href;
}

const $ = {
  evaluate: async (path) => {
    if (path === undefined) return import(codeHref("index.js"));
    if (path === "/code/Cartridge.js") return import(codeHref("Cartridge.js"));
    throw new Error(`evaluate(${path})`);
  },
  byte: {
    random(maxInclusive) {
      if (maxInclusive === undefined) return Math.floor(Math.random() * 256);
      return Math.floor(Math.random() * (maxInclusive + 1));
    },
    lowNybbleOf(b) {
      return b & 0x0f;
    },
    highNybbleOf(b) {
      return (b >> 4) & 0x0f;
    },
    buildU8(highNybble, lowNybble) {
      return ((highNybble & 0x0f) << 4) | (lowNybble & 0x0f);
    },
  },
};

const { evaluate, byte } = $;

describe("gamespec 3.4 Reading the header", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  it("has a `header` property with <metadata> (PRG-ROM pages)", () => {
    const Cartridge = mainModule.default.Cartridge;
    // prettier-ignore
    const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

    for (let i = 0; i < 256; i++) {
      bytes[4] = i;
      const header = new Cartridge(bytes).header;
      expect(header, "header").toBeTypeOf("object");
      expect(header).toHaveProperty("prgRomPages");
      expect(header.prgRomPages, "prgRomPages").toBe(i);
    }
  });

  it("has a `header` property with <metadata> (CHR-ROM pages)", () => {
    const Cartridge = mainModule.default.Cartridge;
    // prettier-ignore
    const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

    for (let i = 0; i < 256; i++) {
      bytes[5] = i;
      const header = new Cartridge(bytes).header;
      expect(header, "header").toBeTypeOf("object");
      expect(header).toHaveProperty("chrRomPages");
      expect(header.chrRomPages, "chrRomPages").toBe(i);
      expect(header).toHaveProperty("usesChrRam");
      expect(header.usesChrRam, "usesChrRam").toBe(i === 0);
    }
  });

  it("has a `header` property with <metadata> (512-byte padding)", () => {
    const Cartridge = mainModule.default.Cartridge;
    // prettier-ignore
    const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

    [
      [false, 0b00000000],
      [true, 0b00000100],
    ].forEach(([has512BytePadding, flags6]) => {
      bytes[6] = flags6;
      const header = new Cartridge(bytes).header;
      expect(header, "header").toBeTypeOf("object");
      expect(header).toHaveProperty("has512BytePadding");
      expect(header.has512BytePadding, "has512BytePadding").toBe(
        has512BytePadding,
      );
    });
  });

  it("has a `header` property with <metadata> (PRG-RAM presence)", () => {
    const Cartridge = mainModule.default.Cartridge;
    // prettier-ignore
    const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

    [
      [false, 0b00000000],
      [true, 0b00000010],
    ].forEach(([hasPrgRam, flags6]) => {
      bytes[6] = flags6;
      const header = new Cartridge(bytes).header;
      expect(header, "header").toBeTypeOf("object");
      expect(header).toHaveProperty("hasPrgRam");
      expect(header.hasPrgRam, "hasPrgRam").toBe(hasPrgRam);
    });
  });

  it("has a `header` property with <metadata> (mirroring id)", () => {
    const Cartridge = mainModule.default.Cartridge;
    // prettier-ignore
    const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

    [
      ["HORIZONTAL", 0b00000000],
      ["VERTICAL", 0b00000001],
      ["FOUR_SCREEN", 0b00001001],
      ["FOUR_SCREEN", 0b00001000],
    ].forEach(([mirroringId, flags6]) => {
      bytes[6] = flags6;
      const header = new Cartridge(bytes).header;
      expect(header, "header").toBeTypeOf("object");
      expect(header).toHaveProperty("mirroringId");
      expect(header.mirroringId, "mirroringId").toBe(mirroringId);
    });
  });

  it("has a `header` property with <metadata> (mapper id)", () => {
    const Cartridge = mainModule.default.Cartridge;
    // prettier-ignore
    const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

    for (let i = 0; i < 256; i++) {
      const lowNybble = byte.lowNybbleOf(i);
      const highNybble = byte.highNybbleOf(i);
      bytes[6] = byte.buildU8(lowNybble, 0b1011);
      bytes[7] = byte.buildU8(highNybble, 0b1010);
      expect(new Cartridge(bytes).header.mapperId, "mapperId").toBe(i);
    }
  });
});
