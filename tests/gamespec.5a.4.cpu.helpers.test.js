/**
 * EmuDevz gamespec §5a.4 — CPU helpers (Vitest).
 * Intended to fail until register increment/decrement and flag helpers exist; do not skip.
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it, vi } from "vitest";

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

describe("gamespec 5a.4 CPU helpers", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  function newCPU() {
    const CPU = mainModule.default.CPU;
    return new CPU();
  }

  it("can <increment> and <decrement> registers", () => {
    const cpu = newCPU();
    const a = cpu.a.getValue();
    const pc = cpu.pc.getValue();

    ["a", "x", "y", "sp", "pc"].forEach((register) => {
      expect(typeof cpu[register].increment, `${register}.increment`).toBe(
        "function",
      );
      expect(typeof cpu[register].decrement, `${register}.decrement`).toBe(
        "function",
      );
    });

    cpu.a.increment();
    cpu.a.increment();
    cpu.a.increment();
    cpu.a.decrement();

    cpu.pc.increment();
    cpu.pc.increment();
    cpu.pc.increment();
    cpu.pc.increment();
    cpu.pc.decrement();
    cpu.pc.decrement();

    expect(cpu.a.getValue(), "getValue()").toBe(a + 3 - 1);
    expect(cpu.pc.getValue(), "getValue()").toBe(pc + 4 - 2);
  });

  it("can update the Zero Flag", () => {
    const cpu = newCPU();
    expect(cpu.flags.z, "z").toBe(false);

    expect(typeof cpu.flags.updateZero).toBe("function");

    cpu.flags.updateZero(0);
    expect(cpu.flags.z, "z").toBe(true);

    cpu.flags.updateZero(50);
    expect(cpu.flags.z, "z").toBe(false);
  });

  it("can update the Negative Flag", () => {
    const cpu = newCPU();
    expect(cpu.flags.n, "n").toBe(false);

    expect(typeof cpu.flags.updateNegative).toBe("function");

    cpu.flags.updateNegative(129);
    expect(cpu.flags.n, "n").toBe(true);

    cpu.flags.updateNegative(2);
    expect(cpu.flags.n, "n").toBe(false);
  });

  it("can update the Zero and Negative flags", () => {
    const cpu = newCPU();

    expect(typeof cpu.flags.updateZeroAndNegative).toBe("function");
    vi.spyOn(cpu.flags, "updateZero");
    vi.spyOn(cpu.flags, "updateNegative");

    cpu.flags.updateZeroAndNegative(28);
    expect(cpu.flags.updateZero).toHaveBeenCalledWith(28);
    expect(cpu.flags.updateNegative).toHaveBeenCalledWith(28);
  });
});
