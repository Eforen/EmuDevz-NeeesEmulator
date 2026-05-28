// 5a.4 Helpers
it("can <increment> and <decrement> registers", () => {
  const cpu = newCPU();
  const a = cpu.a.getValue();
  const pc = cpu.pc.getValue();

  ["a", "x", "y", "sp", "pc"].forEach((register) => {
    expect(cpu[register], register).to.respondTo("increment");
    expect(cpu[register], register).to.respondTo("decrement");
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

  expect(cpu.a.getValue()).to.equalN(a + 3 - 1, "getValue()");
  expect(cpu.pc.getValue()).to.equalHex(pc + 4 - 2, "getValue()");
})({
  locales: {
    es: "puede <incrementar> y <decrementar> registros",
  },
  use: ({ id }, book) => id >= book.getId("5a.4"),
});

it("can update the Zero Flag", () => {
  const cpu = newCPU();
  expect(cpu.flags.z).to.equalN(false, "z");

  expect(cpu.flags).to.respondTo("updateZero");

  cpu.flags.updateZero(0);
  expect(cpu.flags.z).to.equalN(true, "z");

  cpu.flags.updateZero(50);
  expect(cpu.flags.z).to.equalN(false, "z");
})({
  locales: {
    es: "puede actualizar la Bandera Zero",
  },
  use: ({ id }, book) => id >= book.getId("5a.4"),
});

it("can update the Negative Flag", () => {
  const cpu = newCPU();
  expect(cpu.flags.n).to.equalN(false, "n");

  expect(cpu.flags).to.respondTo("updateNegative");

  cpu.flags.updateNegative(129);
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.flags.updateNegative(2);
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    es: "puede actualizar la Bandera Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.4"),
});

it("can update the Zero and Negative flags", () => {
  const cpu = newCPU();

  expect(cpu.flags).to.respondTo("updateZeroAndNegative");
  sinon.spy(cpu.flags, "updateZero");
  sinon.spy(cpu.flags, "updateNegative");

  cpu.flags.updateZeroAndNegative(28);
  expect(cpu.flags.updateZero).to.have.been.calledWith(28);
  expect(cpu.flags.updateNegative).to.have.been.calledWith(28);
})({
  locales: {
    es: "puede actualizar las Banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.4"),
});