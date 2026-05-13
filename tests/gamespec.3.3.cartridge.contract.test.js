import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const testsDir = dirname(fileURLToPath(import.meta.url));
const root = dirname(testsDir);
const codeDir = join(root, "code");

function codeUrl(rel) {
  return pathToFileURL(join(codeDir, rel)).href;
}

/** Minimal ROM buffer with a valid NEEES / iNES-style header prefix */
function romWithHeader(firstFour = [0x4e, 0x45, 0x53, 0x1a]) {
  const buf = new Uint8Array(16);
  buf.set(firstFour, 0);
  return buf;
}

describe("EmuDevz /code layout contract", () => {
  it("(1) there is a /code/Cartridge.js file", () => {
    expect(existsSync(join(codeDir, "Cartridge.js"))).toBe(true);
  });

  it("(2) /code/Cartridge.js is an ES module that default-exports a class", async () => {
    const mod = await import(codeUrl("Cartridge.js"));
    expect(mod).toHaveProperty("default");
    const Exported = mod.default;
    expect(typeof Exported).toBe("function");
    expect(Exported.prototype?.constructor).toBe(Exported);
    const looksLikeClass =
      /^class\b/.test(Function.prototype.toString.call(Exported)) ||
      Exported.name === "Cartridge";
    expect(looksLikeClass).toBe(true);
  });

  it("(3) /code/index.js imports the module from /code/Cartridge.js", () => {
    const src = readFileSync(join(codeDir, "index.js"), "utf8");
    expect(src).toMatch(/from\s+["']\.\/Cartridge\.js["']/);
  });

  it("(4) /code/index.js default-exports an object containing the Cartridge class", async () => {
    const cartridgeMod = await import(codeUrl("Cartridge.js"));
    const indexMod = await import(codeUrl("index.js"));

    expect(indexMod.default).toBeTypeOf("object");
    expect(indexMod.default).toHaveProperty("Cartridge");
    expect(indexMod.default.Cartridge).toBe(cartridgeMod.default);
  });

  it("(5) instantiating Cartridge with a valid header sets a bytes property", async () => {
    const { default: Cartridge } = await import(codeUrl("Cartridge.js"));
    const rom = romWithHeader();
    const cart = new Cartridge(rom);
    expect(cart).toHaveProperty("bytes", rom);
  });

  it("(6) instantiating Cartridge with an invalid header throws", async () => {
    const { default: Cartridge } = await import(codeUrl("Cartridge.js"));
    const bad = romWithHeader([0, 0, 0, 0]);
    expect(() => new Cartridge(bad)).toThrowError(/invalid rom/i);
  });
});
