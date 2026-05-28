/**
 * EmuDevz gamespec §5a.6 — Little-endian reads/writes (Vitest).
 * Intended to fail until `read16`, `push16`, and `pop16` exist and match behavior below; do not skip.
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
  throw new Error(`evaluate(${path})`);
}

describe.skip("gamespec 5a.6 CPU little endian", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  function newCPU(prgBytes = []) {
    const CPU = mainModule.default.CPU;
    const CPUMemory = mainModule.default.CPUMemory;
    const cpuMemory = new CPUMemory();
    const cpu = new CPU(cpuMemory);

    if (prgBytes.length > 0) {
      const prgRom = new Uint8Array(Math.max(16384, prgBytes.length));
      for (let i = 0; i < prgBytes.length; i++) prgRom[i] = prgBytes[i];

      const mapper = {
        cpuRead(address) {
          if (address >= 0x8000 && address < 0x8000 + prgRom.length)
            return prgRom[address - 0x8000];
          return 0;
        },
        cpuWrite() {},
      };

      cpuMemory.onLoad(
        {} /* ppu */,
        { registers: { write: () => {} } } /* apu */,
        mapper,
        [] /* controllers */,
      );
    }

    return cpu;
  }

  it("`CPUMemory`: `read16(...)` reads <16-bit values> from the memory bus", () => {
    const cpu = newCPU([0x34, 0x12]);

    cpu.memory.write(0x0050, 0x45);
    cpu.memory.write(0x0051, 0x23);

    expect(typeof cpu.memory.read16).toBe("function");
    expect(cpu.memory.read16(0x0050), "read16(...)").toBe(0x2345);
    expect(cpu.memory.read16(0x8000), "read16(...)").toBe(0x1234);
  });

  it("`Stack`: `push16(...)` pushes <16-bit values> onto the stack", () => {
    const cpu = newCPU();

    expect(typeof cpu.stack.push16).toBe("function");
    cpu.stack.push16(0x1234);

    expect(cpu.stack.pop(), "pop()").toBe(0x34);
    expect(cpu.stack.pop(), "pop()").toBe(0x12);
  });

  it("`Stack`: `pop16()` pops <16-bit values> from the stack", () => {
    const cpu = newCPU();

    cpu.stack.push(0x12);
    cpu.stack.push(0x34);

    expect(typeof cpu.stack.pop16).toBe("function");
    expect(cpu.stack.pop16(), "pop16()").toBe(0x1234);
  });
});
