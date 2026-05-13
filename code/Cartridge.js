const CARTRIDGE_HEADER_FLAG_MASK = {
    HAS_512_BYTE_PADDING: 0b00000100,
    HAS_PRG_RAM: 0b00000010,
    MIRRORING_ID: 0b00000001,
    MIRRORING_ID_FOUR_SCREEN: 0b00001000,
    MAPPER_ID_NIBBLE: 0b11110000
};
export default class Cartridge {
    bytes;
    header;
    _prg;
    _chr;
    constructor(bytes) {
        this.bytes = bytes;
        if (bytes[0] !== 0x4e ||
            bytes[1] !== 0x45 ||
            bytes[2] !== 0x53 ||
            bytes[3] !== 0x1a) {
            throw new Error("Invalid ROM.");
        }
        this.header = {
            prgRomPages: bytes[4],
            chrRomPages: bytes[5],
            usesChrRam: bytes[5] === 0,
            has512BytePadding: (bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.HAS_512_BYTE_PADDING) !== 0,
            hasPrgRam: (bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.HAS_PRG_RAM) !== 0,
            mirroringId: (bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.MIRRORING_ID_FOUR_SCREEN) !== 0 ? "FOUR_SCREEN" : ((bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.MIRRORING_ID) !== 0 ? "VERTICAL" : "HORIZONTAL"),
            mapperId: ((bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.MAPPER_ID_NIBBLE) >> 4) | (bytes[7] & CARTRIDGE_HEADER_FLAG_MASK.MAPPER_ID_NIBBLE),
        };
        let offset = 16;
        if (this.header.has512BytePadding) {
            offset += 512;
        }
        const prgSize = this.header.prgRomPages * 16384;
        this._prg = this.bytes.slice(offset, offset + prgSize);
        offset += prgSize;
        const chrSize = this.header.chrRomPages * 8192;
        if (this.header.usesChrRam) {
            this._chr = new Uint8Array(8192);
        }
        else {
            this._chr = this.bytes.slice(offset, offset + chrSize);
        }
    }
    prg() {
        return this._prg;
    }
    chr() {
        return this._chr;
    }
}
