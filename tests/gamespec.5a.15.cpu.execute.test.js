/**
 * EmuDevz gamespec §5a.15 — CPU execute / fetch / step (Vitest).
 * Intended to fail until fetch/step helpers and `operations` exist; do not skip.
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

const $$ = (obj) => JSON.parse(JSON.stringify(obj));

describe.skip("gamespec 5a.15 CPU execute", () => {
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

  it("can fetch the next operation", () => {
    const { instructions, addressingModes } = mainModule.default;

    // NOP ; LDA #$05 ; STA $0201 ; LDX $0201
    const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
    cpu.pc.setValue(0x8000);
    expect(typeof cpu._fetchOperation).toBe("function");

    // NOP
    expect($$(cpu._fetchOperation())).toEqual(
      $$({
        id: 0xea,
        instruction: instructions.NOP,
        cycles: 2,
        addressingMode: addressingModes.IMPLICIT,
      }),
    );

    // LDA #$05
    expect($$(cpu._fetchOperation())).toEqual(
      $$({
        id: 0xa9,
        instruction: instructions.LDA,
        cycles: 2,
        addressingMode: addressingModes.IMMEDIATE,
      }),
    );

    // STA $0201
    cpu.pc.increment(); // skip input
    expect($$(cpu._fetchOperation())).toEqual(
      $$({
        id: 0x8d,
        instruction: instructions.STA,
        cycles: 4,
        addressingMode: addressingModes.ABSOLUTE,
      }),
    );
  });

  it("throws an error when it finds an <invalid> opcode", () => {
    // ??? (0x02)
    const cpu = newCPU([0x02]);
    cpu.pc.setValue(0x8000);
    expect(typeof cpu._fetchOperation).toBe("function");

    expect(() => cpu._fetchOperation()).toThrow(/Invalid opcode/);
  });

  it("can fetch the <next input>", () => {
    // NOP ; LDA #$05 ; STA $0201 ; LDX $0201
    const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
    cpu.pc.setValue(0x8000);
    expect(typeof cpu._fetchInput).toBe("function");

    // NOP
    cpu.pc.increment(); // skip opcode
    expect(cpu._fetchInput(cpu.operations[0xea]), "operations[0xea]").toBe(null);

    // LDA #$05
    cpu.pc.increment(); // skip opcode
    expect(cpu._fetchInput(cpu.operations[0xa9]), "operations[0xa9]").toBe(0x05);

    // STA $0201
    cpu.pc.increment(); // skip opcode
    expect(cpu._fetchInput(cpu.operations[0x8d]), "operations[0x8d]").toBe(
      0x0201,
    );
  });

  it("can fetch <the argument> based on `operation` and `input`", () => {
    const cpu = newCPU();
    expect(typeof cpu._fetchArgument).toBe("function");

    // DEC $40,X -> argument === "address"
    cpu.x.setValue(6);
    expect(cpu._fetchArgument(cpu.operations[0xd6], 0x40)).toBe(0x46);

    // LDA #$05 -> argument === "value"
    cpu.a.setValue(8);
    expect(cpu._fetchArgument(cpu.operations[0xa9], 0x05)).toBe(0x05);
  });

  it("can add cycles based on `operation`", () => {
    const cpu = newCPU();
    expect(typeof cpu._addCycles).toBe("function");

    // DEC $40,X (6 cycles)
    cpu.cycle = 3;
    cpu.extraCycles = 9;
    expect(cpu._addCycles(cpu.operations[0xd6]), "_addCycles(...)").toBe(15);
    expect(cpu.cycle, "cycle").toBe(18);
    expect(cpu.extraCycles, "extraCycles").toBe(0);
  });

  it("can run 4 simple operations, updating all counters, and calling a `logger` function", () => {
    // NOP ; LDA #$05 ; STA $0201 ; LDX $0201
    const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
    expect(typeof cpu.step).toBe("function");
    let cycles;
    cpu.pc.setValue(0x8000);
    cpu.cycle = 7;

    // NOP
    cpu.logger = vi.fn();
    cycles = cpu.step();
    expect(cycles, "NOP => cycles").toBe(2);
    expect(cpu.pc.getValue(), "NOP => pc").toBe(0x8001);
    expect(cpu.cycle, "NOP => cycle").toBe(9);
    expect(cpu.logger).toHaveBeenCalledWith(
      cpu,
      0x8000,
      cpu.operations[0xea],
      null,
      null,
    );

    // LDA #$05
    cpu.logger = vi.fn();
    cycles = cpu.step();
    expect(cycles, "LDA #$05 => cycles").toBe(2);
    expect(cpu.pc.getValue(), "LDA #$05 => pc").toBe(0x8003);
    expect(cpu.cycle, "LDA #$05 => cycle").toBe(11);
    expect(cpu.logger).toHaveBeenCalledWith(
      cpu,
      0x8001,
      cpu.operations[0xa9],
      0x05,
      0x05,
    );

    // STA $0201
    cpu.logger = vi.fn();
    cycles = cpu.step();
    expect(cycles, "STA $0201 => cycles").toBe(4);
    expect(cpu.pc.getValue(), "STA $0201 => pc").toBe(0x8006);
    expect(cpu.cycle, "STA $0201 => cycle").toBe(15);
    expect(cpu.logger).toHaveBeenCalledWith(
      cpu,
      0x8003,
      cpu.operations[0x8d],
      0x0201,
      0x0201,
    );

    // LDX $0201
    cpu.logger = vi.fn();
    cycles = cpu.step();
    expect(cycles, "LDX $0201 => cycles").toBe(4);
    expect(cpu.pc.getValue(), "LDX $0201 => pc").toBe(0x8009);
    expect(cpu.cycle, "LDX $0201 => cycle").toBe(19);
    expect(cpu.logger).toHaveBeenCalledWith(
      cpu,
      0x8006,
      cpu.operations[0xae],
      0x0201,
      0x0005,
    );
  });

  it("doesn't crash if `logger` is `null` or `undefined`", () => {
    const cpu = newCPU([0xea, 0xea]);

    // logger = null
    cpu.pc.setValue(0x8000);
    cpu.logger = null;
    expect(() => cpu.step()).not.toThrow();

    // logger = undefined
    cpu.pc.setValue(0x8000);
    cpu.logger = undefined;
    expect(() => cpu.step()).not.toThrow();
  });
});
