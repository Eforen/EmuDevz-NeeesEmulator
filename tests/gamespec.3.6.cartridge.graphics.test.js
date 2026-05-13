/**
 * EmuDevz gamespec §3.6 — Locating the graphics (Vitest).
 * Intended to fail until `Cartridge.chr()` is implemented; do not skip this suite to fake green CI.
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

describe("gamespec 3.6 Locating the graphics", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  const buildHeader = (withPadding, flags6, prgPages, chrPages) => {
    // prettier-ignore
    const header = [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, flags6, 0b00000000, 0, 0, 0, 0, 0, 0, 0, 0];
    if (withPadding) header.push(...new Array(512).fill(0));
    return header;
  };

  const buildRom = (
    withPadding = false,
    flags6 = 0b00000000,
    prgPages = 1 + byte.random(3),
    chrPages = 1 + byte.random(3),
    trailerBytes = 99,
  ) => {
    const header = buildHeader(withPadding, flags6, prgPages, chrPages);
    const prg = [];
    const chr = [];
    const trailer = [];
    for (let i = 0; i < prgPages * 16384; i++) prg.push(byte.random());
    for (let i = 0; i < chrPages * 8192; i++) chr.push(byte.random());
    for (let i = 0; i < trailerBytes; i++) trailer.push(byte.random());
    const bytes = new Uint8Array([...header, ...prg, ...chr, ...trailer]);

    return { header, prg, chr, trailer, bytes };
  };

  it("`chr()` returns <the graphics> (using CHR-ROM)", () => {
    const Cartridge = mainModule.default.Cartridge;
    const { chr, bytes } = buildRom();

    const cartridge = new Cartridge(bytes);
    expect(typeof cartridge.chr).toBe("function");

    const userChr = cartridge.chr();
    expect(userChr?.length, "chr().length").toBe(chr.length);
    expect(userChr, "chr()").toEqual(new Uint8Array(chr));
  });

  it("`chr()` returns <the graphics> (using CHR-RAM)", () => {
    const Cartridge = mainModule.default.Cartridge;
    const { bytes } = buildRom(undefined, undefined, undefined, 0);

    const cartridge = new Cartridge(bytes);
    expect(typeof cartridge.chr).toBe("function");

    const userChr = cartridge.chr();
    expect(userChr?.length, "chr().length").toBe(8192);
    expect(userChr, "chr()").toEqual(new Uint8Array(8192));
  });
});
