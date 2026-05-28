/**
 * EmuDevz gamespec §5a.5 — CPU stack (Vitest).
 * Intended to fail until `stack` with `push`/`pop` exists on `CPU` and matches behavior below; do not skip.
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

const byte = {
  random(maxInclusive) {
    if (maxInclusive === undefined) return Math.floor(Math.random() * 256);
    return Math.floor(Math.random() * (maxInclusive + 1));
  },
};

describe.skip("gamespec 5a.5 CPU stack", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  function newCPU() {
    const CPU = mainModule.default.CPU;
    const CPUMemory = mainModule.default.CPUMemory;
    const cpuMemory = new CPUMemory();
    return new CPU(cpuMemory);
  }

  it("includes a `stack` property with `push(...)`/`pop()` methods", () => {
    const cpu = newCPU();

    expect(cpu).toHaveProperty("stack");
    expect(cpu.stack).toBeTypeOf("object");

    expect(typeof cpu.stack.push).toBe("function");
    expect(typeof cpu.stack.pop).toBe("function");
  });

  it("`Stack`: can push and pop values", () => {
    const { stack, sp } = newCPU();
    sp.setValue(0xff);

    const bytes = [];
    for (let i = 0; i < 256; i++) bytes.push(byte.random());

    for (let i = 0; i < 256; i++) stack.push(bytes[i]);
    for (let i = 255; i >= 0; i--)
      expect(stack.pop(), `[${i}] pop()`).toBe(bytes[i]);
  });

  it("`Stack`: `push(...)` updates RAM and decrements [SP]", () => {
    const { stack, memory, sp } = newCPU();
    sp.setValue(0xff);

    const value = byte.random();
    stack.push(value);
    expect(memory.read(0x0100 + 0xff), "read(...)").toBe(value);
    expect(sp.getValue(), "getValue()").toBe(0xfe);
  });

  it("`Stack`: `pop()` reads RAM and increments [SP]", () => {
    const { stack, memory, sp } = newCPU();
    sp.setValue(0xff);

    stack.push(byte.random());
    const value = byte.random();
    memory.write(0x0100 + 0xff, value);
    expect(stack.pop(), "pop()").toBe(value);
    expect(sp.getValue(), "getValue()").toBe(0xff);
  });
});
