import {Injectable} from '@angular/core';
import {TOFCurrencySettings} from '../../unientities';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';

export enum DefaultTOFCurrencySettingsOptions {
  QuoteToOrder = 0,
  QuoteToInvoice = 1,
  OrderToInvoice = 2,
  QuotedateChange = 3,
  OrderdateChange = 4,
  InvoicedateChange = 5
}

@Injectable()
export class TofCurrencySettingsService extends BizHttp<TOFCurrencySettings> {

    constructor(http: UniHttp) {
      super(http);

      this.relativeURL = TOFCurrencySettings.RelativeUrl;
    }

    public getDefaultTOFCurrencySettings(currSet: TOFCurrencySettings): DefaultTOFCurrencySettingsOptions[] {
      const currSetOpt = [];

      if (currSet) {
          if (currSet.UpdateCurrencyAmountsOnQuoteToOrder) {
              currSetOpt.push(DefaultTOFCurrencySettingsOptions.QuoteToOrder);
          }

          if (currSet.UpdateCurrencyAmountsOnQuoteToInvoice) {
              currSetOpt.push(DefaultTOFCurrencySettingsOptions.QuoteToInvoice);
          }

          if (currSet.UpdateCurrencyAmountsOnOrderToInvoice) {
              currSetOpt.push(DefaultTOFCurrencySettingsOptions.OrderToInvoice);
          }

          if (currSet.UpdateCurrencyAmountsOnQuotedateChange) {
              currSetOpt.push(DefaultTOFCurrencySettingsOptions.QuotedateChange);
          }

          if (currSet.UpdateCurrencyAmountsOnOrderdateChange) {
              currSetOpt.push(DefaultTOFCurrencySettingsOptions.OrderdateChange);
          }

          if (currSet.UpdateCurrencyAmountsOnInvoicedateChange) {
              currSetOpt.push(DefaultTOFCurrencySettingsOptions.InvoicedateChange);
          }
      }

      return currSetOpt;
    }

    // tslint:disable-next-line:max-line-length
    public setDefaultTOFCurrencySettings(currSet: TOFCurrencySettings, currSetOpt: DefaultTOFCurrencySettingsOptions[]): TOFCurrencySettings {
        currSet = currSet || new TOFCurrencySettings();
        currSet.UpdateCurrencyAmountsOnQuoteToOrder = currSetOpt.some(x => x === DefaultTOFCurrencySettingsOptions.QuoteToOrder);
        currSet.UpdateCurrencyAmountsOnQuoteToInvoice = currSetOpt.some(x => x === DefaultTOFCurrencySettingsOptions.QuoteToInvoice);
        currSet.UpdateCurrencyAmountsOnOrderToInvoice = currSetOpt.some(x => x === DefaultTOFCurrencySettingsOptions.OrderToInvoice);
        currSet.UpdateCurrencyAmountsOnQuotedateChange = currSetOpt.some(x => x === DefaultTOFCurrencySettingsOptions.QuotedateChange);
        currSet.UpdateCurrencyAmountsOnOrderdateChange = currSetOpt.some(x => x === DefaultTOFCurrencySettingsOptions.OrderdateChange);
        currSet.UpdateCurrencyAmountsOnInvoicedateChange = currSetOpt.some(x => x === DefaultTOFCurrencySettingsOptions.InvoicedateChange);

        return currSet;
    }

}
