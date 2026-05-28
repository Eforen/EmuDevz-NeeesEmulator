// 5a.3 Flags

it("includes a `flags` property with 6 booleans", () => {
  const CPU = mainModule.default.CPU;
  const cpu = new CPU();

  expect(cpu).to.include.key("flags");
  expect(cpu.flags).to.be.an("object");

  ["c", "z", "i", "d", "v", "n"].forEach((flag) => {
    expect(cpu.flags).to.include.key(flag);
    expect(cpu.flags[flag], `flags[${flag}]`).to.be.an("boolean", flag);
    expect(cpu.flags[flag]).to.equalN(false, flag);
  });
})({
  locales: {
    es: "incluye una propiedad `flags` con 6 booleanos",
  },
  use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can be <packed> into a byte", () => {
  const cpu = newCPU();
  cpu.flags.i = false;

  cpu.flags.should.respondTo("getValue");

  expect(cpu.flags.getValue()).to.equalBin(0b00100000, "getValue()");
  cpu.flags.z = true;
  expect(cpu.flags.getValue()).to.equalBin(0b00100010, "[+z] => getValue()");
  cpu.flags.c = true;
  expect(cpu.flags.getValue()).to.equalBin(0b00100011, "[+c] => getValue()");
  cpu.flags.v = true;
  expect(cpu.flags.getValue()).to.equalBin(0b01100011, "[+v] => getValue()");
  cpu.flags.n = true;
  expect(cpu.flags.getValue()).to.equalBin(0b11100011, "[+n] => getValue()");
  cpu.flags.i = true;
  expect(cpu.flags.getValue()).to.equalBin(0b11100111, "[+i] => getValue()");
  cpu.flags.d = true;
  expect(cpu.flags.getValue()).to.equalBin(0b11101111, "[+d] => getValue()");
  cpu.flags.c = false;
  expect(cpu.flags.getValue()).to.equalBin(0b11101110, "[-c] => getValue()");
  cpu.flags.v = false;
  expect(cpu.flags.getValue()).to.equalBin(0b10101110, "[-v] => getValue()");
  cpu.flags.z = false;
  expect(cpu.flags.getValue()).to.equalBin(0b10101100, "[-z] => getValue()");
})({
  locales: {
    es: "`FlagsRegister`: puede ser <empaquetado> en un byte",
  },
  use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can be <set> from a byte", () => {
  const cpu = newCPU();

  cpu.flags.setValue(0b11111111);
  expect(cpu.flags.getValue()).to.equalBin(0b11101111, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.i).to.equalN(true, "i");
  expect(cpu.flags.d).to.equalN(true, "d");
  expect(cpu.flags.v).to.equalN(true, "v");
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.flags.setValue(0b01000001);
  expect(cpu.flags.getValue()).to.equalBin(0b01100001, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.i).to.equalN(false, "i");
  expect(cpu.flags.d).to.equalN(false, "d");
  expect(cpu.flags.v).to.equalN(true, "v");
  expect(cpu.flags.n).to.equalN(false, "n");

  cpu.flags.setValue(0b10000011);
  expect(cpu.flags.getValue()).to.equalBin(0b10100011, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.i).to.equalN(false, "i");
  expect(cpu.flags.d).to.equalN(false, "d");
  expect(cpu.flags.v).to.equalN(false, "v");
  expect(cpu.flags.n).to.equalN(true, "n");
})({
  locales: {
    es: "`FlagsRegister`: puede ser <asignado> desde un byte",
  },
  use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can assign ~C~ from a byte (bit 0)", () => {
  const cpu = newCPU();

  cpu.flags.setValue(0b00000001);
  expect(cpu.flags.c).to.equalN(true, "c");

  cpu.flags.setValue(0b00000000);
  expect(cpu.flags.c).to.equalN(false, "c");
})({
  locales: {
    es: "`FlagsRegister`: puede asignar ~C~ desde un byte (bit 0)",
  },
  use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can assign ~Z~ from a byte (bit 1)", () => {
  const cpu = newCPU();

  cpu.flags.setValue(0b00000010);
  expect(cpu.flags.z).to.equalN(true, "z");

  cpu.flags.setValue(0b00000000);
  expect(cpu.flags.z).to.equalN(false, "z");
})({
  locales: {
    es: "`FlagsRegister`: puede asignar ~Z~ desde un byte (bit 1)",
  },
  use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can assign ~I~ from a byte (bit 2)", () => {
  const cpu = newCPU();

  cpu.flags.setValue(0b00000100);
  expect(cpu.flags.i).to.equalN(true, "i");

  cpu.flags.setValue(0b00000000);
  expect(cpu.flags.i).to.equalN(false, "i");
})({
  locales: {
    es: "`FlagsRegister`: puede asignar ~I~ desde un byte (bit 2)",
  },
  use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can assign ~D~ from a byte (bit 3)", () => {
  const cpu = newCPU();

  cpu.flags.setValue(0b00001000);
  expect(cpu.flags.d).to.equalN(true, "d");

  cpu.flags.setValue(0b00000000);
  expect(cpu.flags.d).to.equalN(false, "d");
})({
  locales: {
    es: "`FlagsRegister`: puede asignar ~D~ desde un byte (bit 3)",
  },
  use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can assign ~V~ from a byte (bit 6)", () => {
  const cpu = newCPU();

  cpu.flags.setValue(0b01000000);
  expect(cpu.flags.v).to.equalN(true, "v");

  cpu.flags.setValue(0b00000000);
  expect(cpu.flags.v).to.equalN(false, "v");
})({
  locales: {
    es: "`FlagsRegister`: puede asignar ~V~ desde un byte (bit 6)",
  },
  use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can assign ~N~ from a byte (bit 7)", () => {
  const cpu = newCPU();

  cpu.flags.setValue(0b10000000);
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.flags.setValue(0b00000000);
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    es: "`FlagsRegister`: puede asignar ~N~ desde un byte (bit 7)",
  },
  use: ({ id }, book) => id >= book.getId("5a.3"),
});