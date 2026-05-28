import type CPUMemory from "../CPUMemory";

export default class CPU {
    memory: CPUMemory;
    cycle: number;
    extraCycles: number;

    constructor(cpuMemory: CPUMemory) {
        this.memory = cpuMemory;
        this.cycle = 0;
        this.extraCycles = 0;
    }
}
