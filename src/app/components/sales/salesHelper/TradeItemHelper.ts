import {TradeItem} from '../../../unientities';

export class TradeItemHelper  {

    static IsItemsValid(items: any) {
        let numberFailed: number = 0;

        for (let i = 0; i < items.length; i++) {
            let line: TradeItem = items[i];

            if (line.ProductID === null) {
                numberFailed++;
            }
        }
        if (numberFailed > 0) {
            let line: string = (numberFailed > 1) ? 'linjer' : 'linje'
            alert('Det er ' + numberFailed + ' ' + line + ' du ikke har valgt produkt p�. Velg produkt og fors�k � lagre p� nytt');
            return false;
        }
        return true;
    }

    
}