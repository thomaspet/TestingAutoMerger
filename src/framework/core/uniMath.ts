
export class UniMath {
    public static round(value: number | string, decimals = 2) {
        return Number(Math.round(Number.parseFloat(value + 'e' + decimals)) + 'e-' + decimals);
    }

    public static useFirstTwoDecimals(number: number) {
        return this.useFirstDecimals(number, 2);
    }

    public static useFirstDecimals(number: number, numberOfDecimals: number) {
        const factor = Math.pow(10, numberOfDecimals);
        const integer = Math.trunc(number);
        const decimal = Math.trunc((number - integer) * factor);
        return integer + (decimal / factor);
    }
}
