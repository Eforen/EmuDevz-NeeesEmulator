/**
 * EmuDevz gamespec §4.1 — CPU Memory / WRAM (Vitest).
 * Intended to fail until `CPUMemory` exists, is exported from `index.js`, and matches behavior below; do not skip.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const testsDir = dirname(fileURLToPath(import.meta.url));
const root = dirname(testsDir);
const codeDir = join(root, "code");

function codeHref(rel) {
  return pathToFileURL(join(codeDir, rel)).href;
}

async function evaluate(path) {
  if (path === undefined) return import(codeHref("index.js"));
  if (path === "/code/Cartridge.js") return import(codeHref("Cartridge.js"));
  if (path === "/code/CPUMemory.js") return import(codeHref("CPUMemory.js"));
  throw new Error(`evaluate(${path})`);
}

async function evaluateModule(_mod) {
  return evaluate("/code/CPUMemory.js");
}

const filesystem = {
  exists(absPath) {
    return existsSync(join(root, absPath.replace(/^\//, "")));
  },
};

const byte = {
  random(maxInclusive) {
    if (maxInclusive === undefined) return Math.floor(Math.random() * 256);
    return Math.floor(Math.random() * (maxInclusive + 1));
  },
};

const $ = {
  modules: {
    "/code/CPUMemory.js": {},
  },
};

describe("gamespec 4.1 CPU Memory", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  it("there's a `/code/CPUMemory.js` file", () => {
    expect(filesystem.exists("/code/CPUMemory.js")).toBe(true);
  });

  it("the file `/code/CPUMemory.js` is a JS module that exports <a class>", async () => {
    const module = await evaluate("/code/CPUMemory.js");
    expect(module?.default).toBeDefined();
    const Exported = module.default;
    expect(typeof Exported).toBe("function");
    expect(Exported.prototype?.constructor).toBe(Exported);
    expect(
      /^class\b/.test(Function.prototype.toString.call(Exported)) ||
        Exported.name === "CPUMemory",
    ).toBe(true);
  });

  it("the file `/code/index.js` <imports> the module from `/code/CPUMemory.js`", () => {
    const src = readFileSync(join(codeDir, "index.js"), "utf8");
    expect(src).toMatch(/from\s+["']\.\/CPUMemory\.js["']/);
  });

  it("the file `/code/index.js` exports <an object> containing the `CPUMemory` class", async () => {
    mainModule = await evaluate();
    const CPUMemory = (await evaluateModule($.modules["/code/CPUMemory.js"]))
      .default;

    expect(mainModule.default).toBeTypeOf("object");
    expect(mainModule.default).toHaveProperty("CPUMemory");
    expect(mainModule.default.CPUMemory, "CPUMemory").toBe(CPUMemory);
  });

  it("has a `ram` property and `read(...)`/`write(...)` methods", () => {
    const CPUMemory = mainModule.default.CPUMemory;
    const memory = new CPUMemory();

    expect(memory).toHaveProperty("ram");
    expect(memory.ram).toBeInstanceOf(Uint8Array);
    expect(memory.ram.length, "length").toBe(2048);
    expect(typeof memory.read).toBe("function");
    expect(typeof memory.write).toBe("function");
  });

  it("can read from RAM ($0000-$07FF)", () => {
    const CPUMemory = mainModule.default.CPUMemory;
    const memory = new CPUMemory();

    for (let i = 0; i < 2048; i++) {
      const value = byte.random();
      memory.ram[i] = value;
      expect(memory.read(i), `read(${i})`).toBe(value);
    }
  });

  it("reading RAM mirror results in <RAM reads>", () => {
    const CPUMemory = mainModule.default.CPUMemory;
    const memory = new CPUMemory();

    for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
      const value = byte.random();
      memory.ram[(i - 0x0800) % 0x0800] = value;
      expect(memory.read(i), `read(${i})`).toBe(value);
    }
  });

  it("can write to RAM ($0000-$07FF)", () => {
    const CPUMemory = mainModule.default.CPUMemory;
    const memory = new CPUMemory();

    for (let i = 0; i < 2048; i++) {
      const value = byte.random();
      memory.write(i, value);
      expect(memory.ram[i], `ram[${i}]`).toBe(value);
    }
  });

  it("writing RAM mirror results in <RAM writes>", () => {
    const CPUMemory = mainModule.default.CPUMemory;
    const memory = new CPUMemory();

    for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
      const value = byte.random();
      memory.write(i, value);
      const index = (i - 0x0800) % 0x0800;
      expect(memory.ram[index], `ram[${index}]`).toBe(value);
    }
  });
});
