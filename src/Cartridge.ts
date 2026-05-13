const CARTRIDGE_HEADER_FLAG_MASK = {
    HAS_512_BYTE_PADDING: 0b00000100,
    HAS_PRG_RAM: 0b00000010,
    MIRRORING_ID: 0b00000001,
    MIRRORING_ID_FOUR_SCREEN: 0b00001000,
    MAPPER_ID_NIBBLE: 0b11110000
};

type MIRRORING_TYPE = "HORIZONTAL" | "VERTICAL" | "FOUR_SCREEN";

interface CartridgeHeader {
    /* byte 4 */
    prgRomPages: number;
    /* byte 5 */
    chrRomPages: number;
    /* if chrRomPages is 0, then usesChrRam is true */
    usesChrRam: boolean;

    /* from <Flags 6> */
    has512BytePadding: boolean;
    /* from <Flags 6> */
    hasPrgRam: boolean;
    /* from <Flags 6> */
    mirroringId: MIRRORING_TYPE;
    /* from <Flags 6> has lower nibble and <Flags 7> has upper nibble */
    mapperId: number;
}
export default class Cartridge {
  readonly bytes: Uint8Array;
  readonly header: CartridgeHeader;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
    // NEEES header validation
    if (
      bytes[0] !== 0x4e ||
      bytes[1] !== 0x45 ||
      bytes[2] !== 0x53 ||
      bytes[3] !== 0x1a
    ) {
      throw new Error("Invalid ROM.");
    }
    // get header
    this.header = {
      prgRomPages: bytes[4],
      chrRomPages: bytes[5],
      usesChrRam: bytes[5] === 0,
      has512BytePadding: (bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.HAS_512_BYTE_PADDING) !== 0,
      hasPrgRam: (bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.HAS_PRG_RAM) !== 0,
      mirroringId: (bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.MIRRORING_ID_FOUR_SCREEN) !== 0 ? "FOUR_SCREEN" : ((bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.MIRRORING_ID) !== 0 ? "VERTICAL" : "HORIZONTAL") ,
      mapperId: ((bytes[6] & CARTRIDGE_HEADER_FLAG_MASK.MAPPER_ID_NIBBLE)>>4) | (bytes[7] & CARTRIDGE_HEADER_FLAG_MASK.MAPPER_ID_NIBBLE),
    };
  }
}
