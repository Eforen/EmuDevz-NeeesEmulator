const RAM_SIZE = 0x0800;

export default class CPUMemory {
    ram: Uint8Array;
    constructor() {
        this.ram = new Uint8Array(RAM_SIZE);
    }

    read(address: number): number {
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
        /* TODO: IMPLEMENT */

        // 🎮 Controller port 2
        /* TODO: IMPLEMENT */

        // 💾 Cartridge space (PRG-ROM, mapper, etc.)
        /* TODO: IMPLEMENT */

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
    /* TODO: IMPLEMENT */

    // 🔊 APUFrameCounter register
    /* TODO: IMPLEMENT */

    // 💾 Cartridge space (PRG-ROM, mapper, etc.)
    /* TODO: IMPLEMENT */
    }
}
