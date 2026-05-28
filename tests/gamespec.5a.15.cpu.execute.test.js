// 5a.15 Execute

it("can fetch the next operation", () => {
  const { instructions, addressingModes } = mainModule.default;

  // NOP ; LDA #$05 ; STA $0201 ; LDX $0201
  const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
  cpu.pc.setValue(0x8000);
  expect(cpu).to.respondTo("_fetchOperation");

  // NOP
  expect($$(cpu._fetchOperation())).to.eql(
    $$({
      id: 0xea,
      instruction: instructions.NOP,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT,
    })
  );

  // LDA #$05
  expect($$(cpu._fetchOperation())).to.eql(
    $$({
      id: 0xa9,
      instruction: instructions.LDA,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE,
    })
  );

  // STA $0201
  cpu.pc.increment(); // skip input
  expect($$(cpu._fetchOperation())).to.eql(
    $$({
      id: 0x8d,
      instruction: instructions.STA,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE,
    })
  );
})({
  locales: {
    es: "puede ir a buscar la próxima operación",
  },
  use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("throws an error when it finds an <invalid> opcode", () => {
  // ??? (0x02)
  const cpu = newCPU([0x02]);
  cpu.pc.setValue(0x8000);
  expect(cpu).to.respondTo("_fetchOperation");

  // 0x02
  expect(() => cpu._fetchOperation()).to.throw(Error, /Invalid opcode/);
})({
  locales: {
    es: "tira un error cuando encuentra un opcode <inválido>",
  },
  use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("can fetch the <next input>", () => {
  // NOP ; LDA #$05 ; STA $0201 ; LDX $0201
  const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
  cpu.pc.setValue(0x8000);
  expect(cpu).to.respondTo("_fetchInput");

  // NOP
  cpu.pc.increment(); // skip opcode
  expect(cpu._fetchInput(cpu.operations[0xea])).to.equalN(
    null,
    "operations[0xea]"
  );

  // LDA #$05
  cpu.pc.increment(); // skip opcode
  expect(cpu._fetchInput(cpu.operations[0xa9])).to.equalHex(
    0x05,
    "operations[0xa9]"
  );

  // STA $0201
  cpu.pc.increment(); // skip opcode
  expect(cpu._fetchInput(cpu.operations[0x8d])).to.equalHex(
    0x0201,
    "operations[0x8d]"
  );
})({
  locales: {
    es: "puede ir a buscar el <próximo input>",
  },
  use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("can fetch <the argument> based on `operation` and `input`", () => {
  const cpu = newCPU();
  expect(cpu).to.respondTo("_fetchArgument");

  // DEC $40,X -> argument === "address"
  cpu.x.setValue(6);
  expect(cpu._fetchArgument(cpu.operations[0xd6], 0x40)).to.equalHex(0x46);

  // LDA #$05 -> argument === "value"
  cpu.a.setValue(8);
  expect(cpu._fetchArgument(cpu.operations[0xa9], 0x05)).to.equalHex(0x05);
})({
  locales: {
    es: "puede ir a buscar <el argumento> basándose en `operation` e `input`",
  },
  use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("can add cycles based on `operation`", () => {
  const cpu = newCPU();
  expect(cpu).to.respondTo("_addCycles");

  // DEC $40,X (6 cycles)
  cpu.cycle = 3;
  cpu.extraCycles = 9;
  expect(cpu._addCycles(cpu.operations[0xd6])).to.equalN(15, "_addCycles(...)");
  expect(cpu.cycle).to.equalN(18, "cycle");
  expect(cpu.extraCycles).to.equalN(0, "extraCycles");
})({
  locales: {
    es: "puede agregar ciclos basándose en `operation`",
  },
  use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("can run 4 simple operations, updating all counters, and calling a `logger` function", () => {
  // NOP ; LDA #$05 ; STA $0201 ; LDX $0201
  const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
  expect(cpu).to.respondTo("step");
  let cycles;
  cpu.pc.setValue(0x8000);
  cpu.cycle = 7;

  // NOP
  cpu.logger = sinon.spy();
  cycles = cpu.step();
  expect(cycles).to.equalN(2, "NOP => cycles");
  expect(cpu.pc.getValue()).to.equalHex(0x8001, "NOP => pc");
  expect(cpu.cycle).to.equalN(9, "NOP => cycle");
  try {
    expect(cpu.logger).to.have.been.calledWith(
      cpu,
      0x8000,
      cpu.operations[0xea],
      null,
      null
    );
  } catch (e) {
    throw new Error(
      `\`this.logger\` should have been called with (cpu, 0x8000, cpu.operations[0xea], null, null)`
    );
  }

  // LDA #$05
  cpu.logger = sinon.spy();
  cycles = cpu.step();
  expect(cycles).to.equalN(2, "LDA #$05 => cycles");
  expect(cpu.pc.getValue()).to.equalHex(0x8003, "LDA #$05 => pc");
  expect(cpu.cycle).to.equalN(11, "LDA #$05 => cycle");
  try {
    expect(cpu.logger).to.have.been.calledWith(
      cpu,
      0x8001,
      cpu.operations[0xa9],
      0x05,
      0x05
    );
  } catch (e) {
    throw new Error(
      `\`this.logger\` should have been called with (cpu, 0x8001, cpu.operations[0xa9], 0x05, 0x05)`
    );
  }

  // STA $0201
  cpu.logger = sinon.spy();
  cycles = cpu.step();
  expect(cycles).to.equalN(4, "STA $0201 => cycles");
  expect(cpu.pc.getValue()).to.equalHex(0x8006, "STA $0201 => pc");
  expect(cpu.cycle).to.equalN(15, "STA $0201 => cycle");
  try {
    expect(cpu.logger).to.have.been.calledWith(
      cpu,
      0x8003,
      cpu.operations[0x8d],
      0x0201,
      0x0201
    );
  } catch (e) {
    throw new Error(
      `\`this.logger\` should have been called with (cpu, 0x8003, cpu.operations[0x8d], 0x0201, 0x0201)`
    );
  }

  // LDX $0201
  cpu.logger = sinon.spy();
  cycles = cpu.step();
  expect(cycles).to.equalN(4, "LDX $0201 => cycles");
  expect(cpu.pc.getValue()).to.equalHex(0x8009, "LDX $0201 => pc");
  expect(cpu.cycle).to.equalN(19, "LDX $0201 => cycle");
  try {
    expect(cpu.logger).to.have.been.calledWith(
      cpu,
      0x8006,
      cpu.operations[0xae],
      0x0201,
      0x0005
    );
  } catch (e) {
    throw new Error(
      `\`this.logger\` should have been called with (cpu, 0x8006, cpu.operations[0xae], 0x0201, 0x0005)`
    );
  }
})({
  locales: {
    es:
      "puede ejecutar 4 operaciones simples, actualizando todos los contadores, y llamando a una función `logger`",
  },
  use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("doesn't crash if `logger` is `null` or `undefined`", () => {
  const cpu = newCPU([0xea, 0xea]);

  // logger = null
  cpu.pc.setValue(0x8000);
  cpu.logger = null;
  try {
    cpu.step();
  } catch (e) {
    throw new Error("step() crashed when logger === null");
  }

  // logger = undefined
  cpu.pc.setValue(0x8000);
  cpu.logger = undefined;
  try {
    cpu.step();
  } catch (e) {
    throw new Error("step() crashed when logger === undefined");
  }
})({
  locales: {
    es: "no crashea si `logger` es `null` o `undefined`",
  },
  use: ({ id }, book) => id >= book.getId("5a.15"),
});