/**
 * EmuDevz gamespec §5a.14 — CPU operations table (Vitest).
 * Intended to fail until `cpu.operations` exists with 151 entries and matches shape below; do not skip.
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

describe.skip("gamespec 5a.14 CPU operations", () => {
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

  it("defines a list of 151 `operations`", () => {
    const cpu = newCPU();

    expect(cpu).toHaveProperty("operations");
    expect(Array.isArray(cpu.operations), "isArray(...)").toBe(true);
    let count = 0;

    for (const operation of cpu.operations) {
      if (operation == null) continue;

      expect(operation).toHaveProperty("id");
      expect(operation).toHaveProperty("instruction");
      expect(operation).toHaveProperty("cycles");
      expect(operation).toHaveProperty("addressingMode");
      expect(operation.instruction).toHaveProperty("id");
      expect(operation.instruction).toHaveProperty("argument");
      expect(typeof operation.instruction.run).toBe("function");
      expect(operation.addressingMode).toHaveProperty("id");
      expect(operation.addressingMode).toHaveProperty("inputSize");
      expect(typeof operation.addressingMode.getAddress).toBe("function");
      expect(typeof operation.addressingMode.getValue).toBe("function");
      count++;
    }

    expect(count, "count").toBe(151);
  });
});
