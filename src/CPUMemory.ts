import type Controller from "./Controller";

const RAM_SIZE = 0x0800;
const CONTROLLER_1_ADDRESS = 0x4016;
const CONTROLLER_2_ADDRESS = 0x4017;

type PPU = {
    cpuRead(address: number): number;
    cpuWrite(address: number, value: number): void;
}; // Currently I don't know what structure the game will use for this.
type APU = {
    cpuRead(address: number): number;
    cpuWrite(address: number, value: number): void;
}; // Currently I don't know what structure the game will use for this.
type Mapper = {
    cpuRead(address: number): number;
    cpuWrite(address: number, value: number): void;
}; // Currently I don't know the full structure the game will use for this.
export default class CPUMemory {
    ram: Uint8Array;
    ppu: PPU | null;
    apu: APU | null;
    mapper: Mapper | null;
    controllers: Controller[] | null;
    loaded: boolean;

    constructor() {
        this.ram = new Uint8Array(RAM_SIZE);
        this.ppu = null;
        this.apu = null;
        this.mapper = null;
        this.controllers = null;
        this.loaded = false;
    }

    onLoad(ppu: PPU, apu: APU, mapper: Mapper, controllers: Controller[]): void {
        this.ppu = ppu;
        this.apu = apu;
        this.mapper = mapper;
        this.controllers = controllers;
        this.loaded = true;
    }

    read(address: number): number {
        // if (!this.loaded) return 0; // The game's tests don't call onLoad before testing ram
        
        // 🐏 WRAM (2 KiB)
        // $0000-$07FF range
        if (address >= 0x0000 && address <= 0x07FF)
            return this.ram[address];

        // 🚽 Mirrors of $0000-$07FF
        if (address >= 0x0800 && address <= 0x1fff)
            return this.read(0x0000 + (address - 0x0800) % 0x0800);

        // 🖥️ PPU registers
        /* TODO: IMPLEMENT */

        // 🚽 Mirrors of $2000-2007
        if (address >= 0x2008 && address <= 0x3fff)
            return this.read(0x2000 + (address - 0x2008) % 0x0008);

        // 🔊 APU registers
        /* TODO: IMPLEMENT */

        // 🖥️ PPU's OAMDMA register
        /* TODO: IMPLEMENT */

        // 🔊 APUStatus register
        /* TODO: IMPLEMENT */

        // 🎮 Controller port 1
        if (address == CONTROLLER_1_ADDRESS)
            return this.controllers![0].onRead();

        // 🎮 Controller port 2
        if (address == CONTROLLER_2_ADDRESS)
            return this.controllers![1].onRead();

        // 💾 Cartridge space (PRG-ROM, mapper, etc.)
        /* TODO: IMPLEMENT */

        // Dump $4020-$FFFF to mapper for now
        if (address >= 0x4020 && address <= 0xffff)
            return this.mapper!.cpuRead(address);

        return 0;
    }

    write(address: number, value: number): void {
    // 🐏 WRAM (2 KiB)
    if (address >= 0x0000 && address <= 0x07FF){
        this.ram[address] = value;
        return;
    }

    // 🚽 Mirrors of $0000-$07FF
    if (address >= 0x0800 && address <= 0x1fff)
        return this.write(0x0000 + (address - 0x0800) % 0x0800, value);

    // 🖥️ PPU registers
    /* TODO: IMPLEMENT */

    // 🚽 Mirrors of $2000-2007
    if (address >= 0x2008 && address <= 0x3fff)
        return this.write(0x2000 + (address - 0x2008) % 0x0008, value);

    // 🔊 APU registers
    /* TODO: IMPLEMENT */

    // 🖥️ PPU's OAMDMA register
    /* TODO: IMPLEMENT */

    // 🔊 APUControl register
    /* TODO: IMPLEMENT */

    // 🎮 Controller port 1
    if (address == CONTROLLER_1_ADDRESS)
        return this.controllers![0].onWrite(value);

    // 🔊 APUFrameCounter register
    /* TODO: IMPLEMENT */

    // 💾 Cartridge space (PRG-ROM, mapper, etc.)
    /* TODO: IMPLEMENT */

    // Dump $4020-$FFFF to mapper for now
    if (address >= 0x4020 && address <= 0xffff)
        return this.mapper!.cpuWrite(address, value);
    }
}
