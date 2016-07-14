export class TradeItemHelper  {

    public static IsItemsValid(items: any) {
        let numberFailed: number = 0;

        for (let i = 0; i < items.length; i++) {
            let line: any = items[i];

            if (line.ProductID === null) {
                numberFailed++;
            }
        }
        if (numberFailed > 0) {
            let line: string = (numberFailed > 1) ? 'linjer' : 'linje'
            alert('Det er ' + numberFailed + ' ' + line + ' du ikke har valgt produkt på. Velg produkt og forsøk å lagre på nytt');
            return false;
        }
        return true;
    }
}
