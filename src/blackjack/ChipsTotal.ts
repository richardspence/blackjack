


export class ChipsTotal {
    private _chips: number = 0;
    public get total() {
        return this._chips;
    }
    add(num: number, reason: string) {
        console.log(`Adding ${num} to ${this._chips} for ${reason}`, { reason, num, chip: this._chips });
        this._chips += num;
    }

    subtract(num: number, reason: string) {
        console.log(`Subtracting ${num} to ${this._chips} for ${reason}`, { reason, num, chip: this._chips });
        this._chips -= num;
    }
}