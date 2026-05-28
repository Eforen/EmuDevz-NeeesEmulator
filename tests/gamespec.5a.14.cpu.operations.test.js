// 5a.14 Operations

it("defines a list of 151 `operations`", () => {
  const cpu = newCPU();

  expect(cpu).to.include.key("operations");
  expect(Array.isArray(cpu.operations)).to.equalN(true, "isArray(...)");
  let count = 0;

  for (let operation of cpu.operations) {
    if (operation == null) continue;

    expect(operation).to.include.key("id");
    expect(operation).to.include.key("instruction");
    expect(operation).to.include.key("cycles");
    expect(operation).to.include.key("addressingMode");
    expect(operation.instruction).to.include.key("id");
    expect(operation.instruction).to.include.key("argument");
    expect(operation.instruction).to.respondTo("run");
    expect(operation.addressingMode).to.include.key("id");
    expect(operation.addressingMode).to.include.key("inputSize");
    expect(operation.addressingMode).to.respondTo("getAddress");
    expect(operation.addressingMode).to.respondTo("getValue");
    count++;
  }

  expect(count).to.equalN(151, "count");
})({
  locales: {
    es: "define una lista con 151 `operations`",
  },
  use: ({ id }, book) => id >= book.getId("5a.14"),
});