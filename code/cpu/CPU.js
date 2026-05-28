export default class CPU {
    memory;
    cycle;
    extraCycles;
    constructor(cpuMemory) {
        this.memory = cpuMemory;
        this.cycle = 0;
        this.extraCycles = 0;
    }
}
