/**
 * EmuDevz gamespec §4.3 — Controller / CPU bus mapping (Vitest).
 * Intended to fail until `Controller`, `CPUMemory` controller wiring, and exports exist; do not skip.
 */
import { existsSync, readFileSync } from "node:fs";
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
  if (path === "/code/Cartridge.js") return import(codeHref("Cartridge.js"));
  if (path === "/code/Controller.js") return import(codeHref("Controller.js"));
  if (path === "/code/CPUMemory.js") return import(codeHref("CPUMemory.js"));
  throw new Error(`evaluate(${path})`);
}

async function evaluateModule(_mod) {
  return evaluate("/code/Controller.js");
}

const filesystem = {
  exists(absPath) {
    return existsSync(join(root, absPath.replace(/^\//, "")));
  },
};

const $ = {
  modules: {
    "/code/Controller.js": {},
  },
};

describe("gamespec 4.3 Controller", () => {
  let mainModule;

  beforeAll(async () => {
    mainModule = await evaluate();
  });

  it("there's a `/code/Controller.js` file", () => {
    expect(filesystem.exists("/code/Controller.js")).toBe(true);
  });

  it("the file `/code/Controller.js` is a JS module that exports <a class>", async () => {
    const module = await evaluate("/code/Controller.js");
    expect(module?.default).toBeDefined();
    const Exported = module.default;
    expect(typeof Exported).toBe("function");
    expect(Exported.prototype?.constructor).toBe(Exported);
    expect(
      /^class\b/.test(Function.prototype.toString.call(Exported)) ||
        Exported.name === "Controller",
    ).toBe(true);
  });

  it("the file `/code/index.js` <imports> the module from `/code/Controller.js`", () => {
    const src = readFileSync(join(codeDir, "index.js"), "utf8");
    expect(src).toMatch(/from\s+["']\.\/Controller\.js["']/);
  });

  it("the file `/code/index.js` exports <an object> containing the `Controller` class", async () => {
    mainModule = await evaluate();
    const Controller = (await evaluateModule($.modules["/code/Controller.js"]))
      .default;

    expect(mainModule.default).toBeTypeOf("object");
    expect(mainModule.default).toHaveProperty("Controller");
    expect(mainModule.default.Controller, "Controller").toBe(Controller);
  });

  it("`Controller`: receives the `player` id and initializes <state>", () => {
    const Controller = mainModule.default.Controller;

    const controller = new Controller(1);

    expect(controller).toHaveProperty("strobe");
    expect(controller).toHaveProperty("cursor");
    expect(controller).toHaveProperty("other");
    expect(controller).toHaveProperty("_player");
    expect(controller).toHaveProperty("_buttons");

    expect(controller.strobe, "strobe").toBe(false);
    expect(controller.cursor, "cursor").toBe(0);
    expect(controller.other, "other").toBe(null);
    expect(controller._player, "_player").toBe(1);
    expect(controller._buttons).toBeInstanceOf(Array);
    expect(controller._buttons.length, "_buttons.length").toBe(8);
    for (let i = 0; i < 8; i++)
      expect(controller._buttons[i], `_buttons[${i}]`).toBe(false);
  });

  it("`Controller`: has `update`, `onRead`, `onWrite` methods", () => {
    const Controller = mainModule.default.Controller;

    const controller = new Controller(1);

    expect(typeof controller.update).toBe("function");
    expect(typeof controller.onRead).toBe("function");
    expect(typeof controller.onWrite).toBe("function");
  });

  it("`Controller`: turns <strobe> on/off with bit 0 set/clear, resets the <cursor> on both controllers", () => {
    const Controller = mainModule.default.Controller;

    const c1 = new Controller(1);
    const c2 = new Controller(2);
    c1.other = c2;
    c2.other = c1;

    c1.cursor = 5;
    c2.cursor = 7;

    c1.onWrite(0x01); // strobe on

    expect(c1.strobe, "strobe").toBe(true);
    expect(c1.cursor, "c1.cursor").toBe(0);
    expect(c2.cursor, "c2.cursor").toBe(0);

    c1.onWrite(0x00); // strobe off
    expect(c1.strobe, "strobe").toBe(false);
  });

  it("`Controller`: any byte with bit 0 set/clear should turn <strobe> on/off", () => {
    const Controller = mainModule.default.Controller;

    const c1 = new Controller(1);
    const c2 = new Controller(2);
    c1.other = c2;
    c2.other = c1;

    c1.onWrite(0x41);
    expect(c1.strobe, "strobe").toBe(true);
    c1.onWrite(0x63);
    expect(c1.strobe, "strobe").toBe(true);

    c1.onWrite(0x20);
    expect(c1.strobe, "strobe").toBe(false);
    c1.onWrite(0x40);
    expect(c1.strobe, "strobe").toBe(false);
  });

  it("`Controller`: with strobe <on>, `onRead()` always returns the state of `BUTTON_A`", () => {
    const Controller = mainModule.default.Controller;

    const c1 = new Controller(1);
    const c2 = new Controller(2);
    c1.other = c2;
    c2.other = c1;

    // A pressed on both
    c1.update("BUTTON_A", true);
    c2.update("BUTTON_A", true);

    c1.onWrite(0x01); // strobe on

    for (let i = 0; i < 12; i++) {
      expect(c1.onRead(), "c1.onRead()").toBe(1);
      expect(c2.onRead(), "c2.onRead()").toBe(1);
    }

    // toggle A off and verify it follows
    c1.update("BUTTON_A", false);
    c2.update("BUTTON_A", false);

    for (let i = 0; i < 4; i++) {
      expect(c1.onRead(), "c1.onRead()").toBe(0);
      expect(c2.onRead(), "c2.onRead()").toBe(0);
    }
  });

  it("`Controller`: player 2 uses the `strobe` flag from the <other> controller", () => {
    const Controller = mainModule.default.Controller;

    const c1 = new Controller(1);
    const c2 = new Controller(2);
    c1.other = c2;
    c2.other = c1;

    c2.update("BUTTON_A", true);

    // strobe off -> reads should advance
    expect(c2.onRead(), "c2.onRead() [A]").toBe(1);
    expect(c2.onRead(), "c2.onRead() [B]").toBe(0);

    // turn strobe on in player 1 and verify player 2 now sticks to A
    c1.onWrite(0x01);
    for (let i = 0; i < 6; i++)
      expect(c2.onRead(), `c2.onRead()[${i}]`).toBe(1);
  });

  it("`Controller`: with strobe <off>, `onRead()` advances through the sequence", () => {
    const Controller = mainModule.default.Controller;

    const c1 = new Controller(1);
    const c2 = new Controller(2);
    c1.other = c2;
    c2.other = c1;

    // C1 pattern: 1,0,1,0,1,0,1,0 for A..Right
    // C2 pattern: 0,0,0,0,1,1,1,1 for A..Right
    const order = [
      "BUTTON_A",
      "BUTTON_B",
      "BUTTON_SELECT",
      "BUTTON_START",
      "BUTTON_UP",
      "BUTTON_DOWN",
      "BUTTON_LEFT",
      "BUTTON_RIGHT",
    ];
    for (let i = 0; i < 8; i++) {
      c1.update(order[i], i % 2 === 0);
      c2.update(order[i], i >= 4);
    }

    const expectedC1 = [1, 0, 1, 0, 1, 0, 1, 0];
    for (let i = 0; i < 8; i++) {
      expect(c1.onRead(), `c1.onRead() #${i}`).toBe(expectedC1[i]);
      expect(c1.cursor, "c1.cursor").toBe(i + 1);
    }

    const expectedC2 = [0, 0, 0, 0, 1, 1, 1, 1];
    for (let i = 0; i < 8; i++) {
      expect(c2.onRead(), `c2.onRead() #${i}`).toBe(expectedC2[i]);
      expect(c2.cursor, "c2.cursor").toBe(i + 1);
    }
  });

  it("`Controller`: after reading `BUTTON_RIGHT`, future reads return 1 until the sequence is reset", () => {
    const Controller = mainModule.default.Controller;

    const c1 = new Controller(1);
    const c2 = new Controller(2);
    c1.other = c2;
    c2.other = c1;

    // all buttons released
    const buttons = [
      "BUTTON_A",
      "BUTTON_B",
      "BUTTON_SELECT",
      "BUTTON_START",
      "BUTTON_UP",
      "BUTTON_DOWN",
      "BUTTON_LEFT",
      "BUTTON_RIGHT",
    ];
    buttons.forEach((b) => c1.update(b, false));

    // consume 8 reads (A..Right)
    for (let i = 0; i < 8; i++) c1.onRead();

    // now it should stick to 1
    for (let i = 0; i < 4; i++)
      expect(c1.onRead(), `c1.onRead() #${i}`).toBe(1);

    // same with c2
    for (let i = 0; i < 8; i++) c2.onRead();
    for (let i = 0; i < 4; i++)
      expect(c2.onRead(), `c2.onRead() #${i}`).toBe(1);
  });

  it("`Controller`: writing 1 then 0 to $4016 resets the sequence to `BUTTON_A` on <both controllers>", () => {
    const Controller = mainModule.default.Controller;

    const c1 = new Controller(1);
    const c2 = new Controller(2);
    c1.other = c2;
    c2.other = c1;

    // c1: pressed, c2: released
    c1.update("BUTTON_A", true);
    c2.update("BUTTON_A", false);

    // advance cursors a bit
    for (let i = 0; i < 3; i++) {
      c1.onRead();
      c2.onRead();
    }

    // reset sequence: write 1 then 0 to $4016
    c1.onWrite(0x01);
    c1.onWrite(0x00);

    // next read should be A again on both
    expect(c1.onRead(), "c1.onRead()").toBe(1);
    expect(c2.onRead(), "c2.onRead()").toBe(0);
  });

  it("maps the $4016 <reads/writes> and $4017 <reads> to the controllers", () => {
    const Controller = mainModule.default.Controller;
    const CPUMemory = mainModule.default.CPUMemory;

    const cpuMemory = new CPUMemory();
    const controller1 = new Controller(1);
    const controller2 = new Controller(2);
    controller1.other = controller2;
    controller2.other = controller1;

    vi.spyOn(controller1, "onRead").mockReturnValue(123);
    vi.spyOn(controller1, "onWrite");
    vi.spyOn(controller2, "onRead").mockReturnValue(345);
    vi.spyOn(controller2, "onWrite");

    cpuMemory.onLoad(
      {} /* ppu */,
      { registers: { write: () => {} } } /* apu */,
      { cpuRead: () => 0, cpuWrite: () => {} } /* mapper */,
      [controller1, controller2],
    );

    expect(cpuMemory.read(0x4016), "read(0x4016)").toBe(123);
    expect(controller1.onRead).toHaveBeenCalledOnce();

    expect(cpuMemory.read(0x4017), "read(0x4017)").toBe(345);
    expect(controller2.onRead).toHaveBeenCalledOnce();

    cpuMemory.write(0x4016, 43);
    expect(controller1.onWrite).toHaveBeenCalledWith(43);

    controller1.onWrite.mockClear();
    controller2.onWrite.mockClear();
    cpuMemory.write(0x4017, 201);
    expect(controller1.onWrite).not.toHaveBeenCalled();
    expect(controller2.onWrite).not.toHaveBeenCalled();
  });
});
