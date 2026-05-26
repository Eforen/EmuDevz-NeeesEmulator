const RAM_SIZE = 0x0800;
const CONTROLLER_1_ADDRESS = 0x4016;
const CONTROLLER_2_ADDRESS = 0x4017;
export default class CPUMemory {
    ram;
    ppu;
    apu;
    mapper;
    controllers;
    loaded;
    constructor() {
        this.ram = new Uint8Array(RAM_SIZE);
        this.ppu = null;
        this.apu = null;
        this.mapper = null;
        this.controllers = null;
        this.loaded = false;
    }
    onLoad(ppu, apu, mapper, controllers) {
        this.ppu = ppu;
        this.apu = apu;
        this.mapper = mapper;
        this.controllers = controllers;
        this.loaded = true;
    }
    read(address) {
        if (address >= 0x0000 && address <= 0x07FF)
            return this.ram[address];
        if (address >= 0x0800 && address <= 0x1fff)
            return this.read(0x0000 + (address - 0x0800) % 0x0800);
        if (address >= 0x2008 && address <= 0x3fff)
            return this.read(0x2000 + (address - 0x2008) % 0x0008);
        if (address == CONTROLLER_1_ADDRESS)
            return this.controllers[0].onRead();
        if (address == CONTROLLER_2_ADDRESS)
            return this.controllers[1].onRead();
        if (address >= 0x4020 && address <= 0xffff)
            return this.mapper.cpuRead(address);
        return 0;
    }
    write(address, value) {
        if (address >= 0x0000 && address <= 0x07FF) {
            this.ram[address] = value;
            return;
        }
        if (address >= 0x0800 && address <= 0x1fff)
            return this.write(0x0000 + (address - 0x0800) % 0x0800, value);
        if (address >= 0x2008 && address <= 0x3fff)
            return this.write(0x2000 + (address - 0x2008) % 0x0008, value);
        if (address == CONTROLLER_1_ADDRESS)
            return this.controllers[0].onWrite(value);
        if (address >= 0x4020 && address <= 0xffff)
            return this.mapper.cpuWrite(address, value);
    }
}
