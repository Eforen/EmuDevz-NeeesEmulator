// 5a.6 Little Endian

it("`CPUMemory`: `read16(...)` reads <16-bit values> from the memory bus", () => {
    const cpu = newCPU([0x34, 0x12]);
  
    cpu.memory.write(0x0050, 0x45);
    cpu.memory.write(0x0051, 0x23);
  
    expect(cpu.memory).to.respondTo("read16");
    expect(cpu.memory.read16(0x0050)).to.equalHex(0x2345, "read16(...)");
    expect(cpu.memory.read16(0x8000)).to.equalHex(0x1234, "read16(...)");
  })({
    locales: {
      es:
        "`CPUMemory`: `read16(...)` puede leer <valores de 16 bits> del bus de memoria",
    },
    use: ({ id }, book) => id >= book.getId("5a.6"),
  });
  
  it("`Stack`: `push16(...)` pushes <16-bit values> onto the stack", () => {
    const cpu = newCPU();
  
    expect(cpu.stack).to.respondTo("push16");
    cpu.stack.push16(0x1234);
  
    expect(cpu.stack.pop()).to.equalHex(0x34, "pop()");
    expect(cpu.stack.pop()).to.equalHex(0x12, "pop()");
  })({
    locales: {
      es: "`Stack`: `push16(...)` pone <valores de 16 bits> en la pila",
    },
    use: ({ id }, book) => id >= book.getId("5a.6"),
  });
  
  it("`Stack`: `pop16()` pops <16-bit values> from the stack", () => {
    const cpu = newCPU();
  
    cpu.stack.push(0x12);
    cpu.stack.push(0x34);
  
    expect(cpu.stack).to.respondTo("pop16");
    expect(cpu.stack.pop16()).to.equalHex(0x1234, "pop16()");
  })({
    locales: {
      es: "`Stack`: `pop16()` saca <valores de 16 bits> de la pila",
    },
    use: ({ id }, book) => id >= book.getId("5a.6"),
  });