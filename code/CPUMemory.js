const RAM_SIZE = 0x0800;
export default class CPUMemory {
    ram;
    constructor() {
        this.ram = new Uint8Array(RAM_SIZE);
    }
    read(address) {
        if (address >= 0x0000 && address <= 0x07FF)
            return this.ram[address];
        if (address >= 0x0800 && address <= 0x1fff)
            return this.read(0x0000 + (address - 0x0800) % 0x0800);
        if (address >= 0x2008 && address <= 0x3fff)
            return this.read(0x2000 + (address - 0x2008) % 0x0008);
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
    }
}
