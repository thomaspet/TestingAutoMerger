import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Currency, LocalDate} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class CurrencyService extends BizHttp<Currency> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Currency.RelativeUrl;
        this.entityType = Currency.EntityType;
        this.DefaultOrderBy = null;
    }

    public getAllExchangeRates(toCurrencyCodeID: number, currencyDate: LocalDate): Observable<any> {
        return this.GetAction(
            null,
            'get-all-exchange-rates',
            `toCurrencyCodeID=${toCurrencyCodeID}&currencyDate=${currencyDate.toString()}`);
    }

    public getCurrencyExchangeRate(fromCurrencyCodeID: number = 1, toCurrencyCodeID: number = 1, currencyDate: LocalDate): Observable<any> {
        return this.GetAction(
            null,
            'get-currency-exchange-rate',
            `fromCurrencyCodeID=${fromCurrencyCodeID}&toCurrencyCodeID=${toCurrencyCodeID}&currencyDate=${currencyDate.toString()}`);
    }
}
