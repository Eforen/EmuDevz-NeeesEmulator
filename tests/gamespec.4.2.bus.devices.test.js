/**
 * EmuDevz gamespec §4.1 bus — devices / mapper hooks (Vitest).
 * Gamespec labels this block as §4.2 in prose; kept here next to §4.1 WRAM tests.
 * Intended to fail until `CPUMemory.onLoad`, mapper read/write, and exports exist; do not skip.
 */
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
  if (path === "/code/CPUMemory.js") return import(codeHref("CPUMemory.js"));
  throw new Error(`evaluate(${path})`);
}

const byte = {
  random(maxInclusive) {
    if (maxInclusive === undefined) return Math.floor(Math.random() * 256);
    return Math.floor(Math.random() * (maxInclusive + 1));
  },
};

describe("gamespec 4.1 bus devices", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  it("saves the <devices> received by `onLoad(...)`", () => {
    const CPUMemory = mainModule.default.CPUMemory;
    const memory = new CPUMemory();

    const ppu = {};
    const apu = {};
    const mapper = {};
    const controllers = [];

    expect(typeof memory.onLoad).toBe("function");
    memory.onLoad(ppu, apu, mapper, controllers);
    expect(memory.ppu, "ppu").toBe(ppu);
    expect(memory.apu, "apu").toBe(apu);
    expect(memory.mapper, "mapper").toBe(mapper);
    expect(memory.controllers, "controllers").toBe(controllers);
  });

  it("can read from the mapper ($4020-$FFFF)", () => {
    const CPUMemory = mainModule.default.CPUMemory;
    const memory = new CPUMemory();
    const random = byte.random();
    const mapper = {
      cpuRead: (address) => address * random,
      cpuWrite: () => {},
    };
    memory.onLoad({}, {}, mapper, []);

    for (let i = 0x4020; i <= 0xffff; i++) {
      expect(memory.read(i), `read(${i})`).toBe(i * random);
    }
  });

  it("can write to the mapper ($4020-$FFFF)", () => {
    const CPUMemory = mainModule.default.CPUMemory;
    const memory = new CPUMemory();
    let arg1 = -1;
    let arg2 = -1;
    const mapper = {
      cpuRead: () => 0,
      cpuWrite: (a, b) => {
        arg1 = a;
        arg2 = b;
      },
    };
    memory.onLoad({}, {}, mapper, []);

    for (let i = 0x4020; i <= 0xffff; i++) {
      const value = byte.random();
      memory.write(i, value);
      expect(arg1, "address").toBe(i);
      expect(arg2, "value").toBe(value);
    }
  });
});
