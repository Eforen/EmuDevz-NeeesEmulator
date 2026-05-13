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

describe("gamespec 3.1 & 3.3 — /code modules & ROM validation", () => {

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

  it("(5) instantiating Cartridge with a valid header saves a bytes property (gamespec 3.3)", async () => {
    const { default: Cartridge } = await import(codeUrl("Cartridge.js"));
    const bytes = new Uint8Array([
      0x4e,
      0x45,
      0x53,
      0x1a,
      ...new Uint8Array(12),
    ]);
    expect(new Cartridge(bytes).bytes).toBe(bytes);
  });

  it("(6) instantiating Cartridge with an invalid header throws (gamespec 3.3)", async () => {
    const { default: Cartridge } = await import(codeUrl("Cartridge.js"));

    const wrongPatterns = [
      [0x11, 0x22, 0x33, 0x44, ...new Uint8Array(12)],
      [0x99, 0x45, 0x53, 0x1a, ...new Uint8Array(12)],
      [0x4e, 0x99, 0x53, 0x1a, ...new Uint8Array(12)],
      [0x4e, 0x45, 0x99, 0x1a, ...new Uint8Array(12)],
      [0x4e, 0x45, 0x53, 0x99, ...new Uint8Array(12)],
    ];

    for (const wrong of wrongPatterns) {
      const bytes = new Uint8Array(wrong);
      expect(() => new Cartridge(bytes)).toThrowError(/Invalid ROM/);
    }
  });
});
