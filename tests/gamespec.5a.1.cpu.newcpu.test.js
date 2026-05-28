/**
 * EmuDevz gamespec §5a.1 — New CPU (Vitest).
 * Intended to fail until `CPU` is exported and matches behavior below; do not skip.
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
  if (path === "/code/cpu/CPU.js") return import(codeHref(join("cpu", "CPU.js")));
  throw new Error(`evaluate(${path})`);
}

describe("gamespec 5a.1 New CPU", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  it("the file `/code/index.js` exports <an object> containing the `CPU` class", () => {
    expect(mainModule.default).toBeTypeOf("object");
    expect(mainModule.default).toHaveProperty("CPU");
    const Exported = mainModule.default.CPU;
    expect(typeof Exported).toBe("function");
    expect(Exported.prototype?.constructor).toBe(Exported);
    expect(
      /^class\b/.test(Function.prototype.toString.call(Exported)) ||
        Exported.name === "CPU",
    ).toBe(true);
  });

  it("includes a `memory` property with the <received> `cpuMemory`", () => {
    const CPU = mainModule.default.CPU;
    const CPUMemory = mainModule.default.CPUMemory;
    const cpuMemory = new CPUMemory();

    const cpu = new CPU(cpuMemory);
    expect(cpu).toHaveProperty("memory");
    expect(cpu.memory, "memory").toBe(cpuMemory);
  });

  it("includes two <mysterious properties>: `cycle` and `extraCycles`", () => {
    const CPU = mainModule.default.CPU;
    const cpu = new CPU();

    ["cycle", "extraCycles"].forEach((property) => {
      expect(cpu).toHaveProperty(property);
      expect(cpu[property], property).toBe(0);
    });
  });
});
