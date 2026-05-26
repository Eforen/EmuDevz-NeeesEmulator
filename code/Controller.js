const BUTTONS = [
    "BUTTON_A",
    "BUTTON_B",
    "BUTTON_SELECT",
    "BUTTON_START",
    "BUTTON_UP",
    "BUTTON_DOWN",
    "BUTTON_LEFT",
    "BUTTON_RIGHT"
];
export default class Controller {
    strobe;
    cursor;
    other;
    _player;
    _buttons;
    constructor(player) {
        this.strobe = false;
        this.cursor = 0;
        this.other = null;
        this._player = player;
        this._buttons = [false, false, false, false, false, false, false, false];
    }
    update(button, isPressed) {
        this._buttons[BUTTONS.indexOf(button)] = isPressed > 0 ? true : false;
    }
    onRead() {
        if ((this._player === 1 ? this.strobe : this.other.strobe)) {
            return this._buttons[0] ? 1 : 0;
        }
        if (this.cursor >= BUTTONS.length)
            return 1;
        return this._buttons[this.cursor++] ? 1 : 0;
    }
    reset(strobe) {
        this.strobe = strobe;
        this.other.strobe = strobe;
        this.cursor = 0;
        if (this._player === 1 && strobe === true) {
            this.other.cursor = 0;
        }
    }
    onWrite(value) {
        if (this._player === 1) {
            this.reset((value & 1) > 0);
        }
        if (this._player === 2) {
            throw new Error("Player 2 controller writes are not supported");
        }
    }
}
