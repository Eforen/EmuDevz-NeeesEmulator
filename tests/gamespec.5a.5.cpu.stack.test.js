// 5a.5 Stack

it("includes a `stack` property with `push(...)`/`pop()` methods", () => {
    const cpu = newCPU();
  
    expect(cpu).to.include.key("stack");
    expect(cpu.stack).to.be.an("object");
  
    expect(cpu.stack).to.respondTo("push");
    expect(cpu.stack).to.respondTo("pop");
  })({
    locales: {
      es: "incluye una propiedad `stack` con métodos `push(...)`/`pop()`",
    },
    use: ({ id }, book) => id >= book.getId("5a.5"),
  });
  
  it("`Stack`: can push and pop values", () => {
    const { stack, sp } = newCPU();
    sp.setValue(0xff);
  
    const bytes = [];
    for (let i = 0; i < 256; i++) bytes.push(byte.random());
  
    for (let i = 0; i < 256; i++) stack.push(bytes[i]);
    for (let i = 255; i >= 0; i--)
      expect(stack.pop()).to.equalHex(bytes[i], `[${i}] pop()`);
  })({
    locales: {
      es: "`Stack`: puede poner y sacar elementos",
    },
    use: ({ id }, book) => id >= book.getId("5a.5"),
  });
  
  it("`Stack`: `push(...)` updates RAM and decrements [SP]", () => {
    const { stack, memory, sp } = newCPU();
    sp.setValue(0xff);
  
    const value = byte.random();
    stack.push(value);
    expect(memory.read(0x0100 + 0xff)).to.equalHex(value, "read(...)");
    expect(sp.getValue()).to.equalHex(0xfe, "getValue()");
  })({
    locales: {
      es: "`Stack`: `push(...)` actualiza la RAM y decrementa [SP]",
    },
    use: ({ id }, book) => id >= book.getId("5a.5"),
  });
  
  it("`Stack`: `pop()` reads RAM and increments [SP]", () => {
    const { stack, memory, sp } = newCPU();
    sp.setValue(0xff);
  
    stack.push(byte.random());
    const value = byte.random();
    memory.write(0x0100 + 0xff, value);
    expect(stack.pop()).to.equalHex(value, "pop()");
    expect(sp.getValue()).to.equalHex(0xff, "getValue()");
  })({
    locales: {
      es: "`Stack`: `pop()` lee la RAM e incrementa [SP]",
    },
    use: ({ id }, book) => id >= book.getId("5a.5"),
  });