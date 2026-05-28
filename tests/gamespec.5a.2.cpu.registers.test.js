/**
 * EmuDevz gamespec §5a.2 — CPU registers (Vitest).
 * Intended to fail until register objects exist on `CPU` and match behavior below; do not skip.
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

describe("gamespec 5a.2 CPU registers", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  function newCPU() {
    const CPU = mainModule.default.CPU;
    return new CPU();
  }

  it("includes all the registers", () => {
    const cpu = newCPU();

    ["a", "x", "y", "sp", "pc"].forEach((register) => {
      expect(cpu).toHaveProperty(register);
      expect(typeof cpu[register].getValue, `${register}.getValue`).toBe(
        "function",
      );
      expect(typeof cpu[register].setValue, `${register}.setValue`).toBe(
        "function",
      );
    });
  });

  it("all registers start from 0", () => {
    const CPU = mainModule.default.CPU;
    const cpu = new CPU();

    ["a", "x", "y", "sp", "pc"].forEach((register) => {
      expect(cpu[register].getValue(), register).toBe(0);
    });
  });

  it("`Register8Bit`: can save and read values (<valid> range)", () => {
    const cpu = newCPU();

    ["a", "x", "y", "sp"].forEach((register) => {
      for (let i = 0; i < 256; i++) {
        cpu[register].setValue(i);
        expect(cpu[register].getValue(), `${register}.getValue()`).toBe(i);
      }
    });
  });

  it("`Register8Bit`: wraps with values <outside> the range", () => {
    const cpu = newCPU();

    ["a", "x", "y", "sp"].forEach((register) => {
      for (let i = -300; i < 600; i++) {
        const array = new Uint8Array(1);
        array[0] = i;
        cpu[register].setValue(i);
        expect(cpu[register].getValue(), `${register}.getValue()`).toBe(
          array[0],
        );
      }
    });
  });

  it("`Register16Bit`: can save and read values (<valid> range)", () => {
    const cpu = newCPU();

    for (let i = 0; i < 65536; i++) {
      cpu.pc.setValue(i);
      expect(cpu.pc.getValue(), "pc.getValue()").toBe(i);
    }
  });

  it("`Register16Bit`: wraps with values <outside> the range", () => {
    const cpu = newCPU();

    for (let i = -300; i < 65800; i++) {
      const array = new Uint16Array(1);
      array[0] = i;
      cpu.pc.setValue(i);
      expect(cpu.pc.getValue(), String(i)).toBe(array[0]);
    }
  });
});
