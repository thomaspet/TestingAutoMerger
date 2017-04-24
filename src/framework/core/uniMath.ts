
export class UniMath {
    public static round(value: number | string, decimals = 2) {
        return Number(Math.round(Number.parseFloat(value + 'e' + decimals)) + 'e-' + decimals);
    }
}
