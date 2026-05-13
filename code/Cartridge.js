export default class Cartridge {
    bytes;
    constructor(bytes) {
        this.bytes = bytes;
        if (bytes[0] !== 0x4e ||
            bytes[1] !== 0x45 ||
            bytes[2] !== 0x53 ||
            bytes[3] !== 0x1a) {
            throw new Error("Invalid ROM.");
        }
    }
}
