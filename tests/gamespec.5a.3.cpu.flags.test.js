/**
 * EmuDevz gamespec §5a.3 — CPU flags (Vitest).
 * Intended to fail until `flags` / `FlagsRegister` exist on `CPU` and match behavior below; do not skip.
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

describe("gamespec 5a.3 CPU flags", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  function newCPU() {
    const CPU = mainModule.default.CPU;
    return new CPU();
  }

  it("includes a `flags` property with 6 booleans", () => {
    const CPU = mainModule.default.CPU;
    const cpu = new CPU();

    expect(cpu).toHaveProperty("flags");
    expect(cpu.flags).toBeTypeOf("object");

    ["c", "z", "i", "d", "v", "n"].forEach((flag) => {
      expect(cpu.flags).toHaveProperty(flag);
      expect(typeof cpu.flags[flag], `flags[${flag}]`).toBe("boolean");
      expect(cpu.flags[flag], flag).toBe(false);
    });
  });

  it("`FlagsRegister`: can be <packed> into a byte", () => {
    const cpu = newCPU();
    cpu.flags.i = false;

    expect(typeof cpu.flags.getValue).toBe("function");

    expect(cpu.flags.getValue(), "getValue()").toBe(0b00100000);
    cpu.flags.z = true;
    expect(cpu.flags.getValue(), "[+z] => getValue()").toBe(0b00100010);
    cpu.flags.c = true;
    expect(cpu.flags.getValue(), "[+c] => getValue()").toBe(0b00100011);
    cpu.flags.v = true;
    expect(cpu.flags.getValue(), "[+v] => getValue()").toBe(0b01100011);
    cpu.flags.n = true;
    expect(cpu.flags.getValue(), "[+n] => getValue()").toBe(0b11100011);
    cpu.flags.i = true;
    expect(cpu.flags.getValue(), "[+i] => getValue()").toBe(0b11100111);
    cpu.flags.d = true;
    expect(cpu.flags.getValue(), "[+d] => getValue()").toBe(0b11101111);
    cpu.flags.c = false;
    expect(cpu.flags.getValue(), "[-c] => getValue()").toBe(0b11101110);
    cpu.flags.v = false;
    expect(cpu.flags.getValue(), "[-v] => getValue()").toBe(0b10101110);
    cpu.flags.z = false;
    expect(cpu.flags.getValue(), "[-z] => getValue()").toBe(0b10101100);
  });

  it("`FlagsRegister`: can be <set> from a byte", () => {
    const cpu = newCPU();

    cpu.flags.setValue(0b11111111);
    expect(cpu.flags.getValue(), "getValue()").toBe(0b11101111);
    expect(cpu.flags.c, "c").toBe(true);
    expect(cpu.flags.z, "z").toBe(true);
    expect(cpu.flags.i, "i").toBe(true);
    expect(cpu.flags.d, "d").toBe(true);
    expect(cpu.flags.v, "v").toBe(true);
    expect(cpu.flags.n, "n").toBe(true);

    cpu.flags.setValue(0b01000001);
    expect(cpu.flags.getValue(), "getValue()").toBe(0b01100001);
    expect(cpu.flags.c, "c").toBe(true);
    expect(cpu.flags.z, "z").toBe(false);
    expect(cpu.flags.i, "i").toBe(false);
    expect(cpu.flags.d, "d").toBe(false);
    expect(cpu.flags.v, "v").toBe(true);
    expect(cpu.flags.n, "n").toBe(false);

    cpu.flags.setValue(0b10000011);
    expect(cpu.flags.getValue(), "getValue()").toBe(0b10100011);
    expect(cpu.flags.c, "c").toBe(true);
    expect(cpu.flags.z, "z").toBe(true);
    expect(cpu.flags.i, "i").toBe(false);
    expect(cpu.flags.d, "d").toBe(false);
    expect(cpu.flags.v, "v").toBe(false);
    expect(cpu.flags.n, "n").toBe(true);
  });

  it("`FlagsRegister`: can assign ~C~ from a byte (bit 0)", () => {
    const cpu = newCPU();

    cpu.flags.setValue(0b00000001);
    expect(cpu.flags.c, "c").toBe(true);

    cpu.flags.setValue(0b00000000);
    expect(cpu.flags.c, "c").toBe(false);
  });

  it("`FlagsRegister`: can assign ~Z~ from a byte (bit 1)", () => {
    const cpu = newCPU();

    cpu.flags.setValue(0b00000010);
    expect(cpu.flags.z, "z").toBe(true);

    cpu.flags.setValue(0b00000000);
    expect(cpu.flags.z, "z").toBe(false);
  });

  it("`FlagsRegister`: can assign ~I~ from a byte (bit 2)", () => {
    const cpu = newCPU();

    cpu.flags.setValue(0b00000100);
    expect(cpu.flags.i, "i").toBe(true);

    cpu.flags.setValue(0b00000000);
    expect(cpu.flags.i, "i").toBe(false);
  });

  it("`FlagsRegister`: can assign ~D~ from a byte (bit 3)", () => {
    const cpu = newCPU();

    cpu.flags.setValue(0b00001000);
    expect(cpu.flags.d, "d").toBe(true);

    cpu.flags.setValue(0b00000000);
    expect(cpu.flags.d, "d").toBe(false);
  });

  it("`FlagsRegister`: can assign ~V~ from a byte (bit 6)", () => {
    const cpu = newCPU();

    cpu.flags.setValue(0b01000000);
    expect(cpu.flags.v, "v").toBe(true);

    cpu.flags.setValue(0b00000000);
    expect(cpu.flags.v, "v").toBe(false);
  });

  it("`FlagsRegister`: can assign ~N~ from a byte (bit 7)", () => {
    const cpu = newCPU();

    cpu.flags.setValue(0b10000000);
    expect(cpu.flags.n, "n").toBe(true);

    cpu.flags.setValue(0b00000000);
    expect(cpu.flags.n, "n").toBe(false);
  });
});
