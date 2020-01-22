import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Currency, LocalDate} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class CurrencyService extends BizHttp<Currency> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Currency.RelativeUrl;
        this.entityType = Currency.EntityType;
        this.DefaultOrderBy = null;
    }

    public getAllExchangeRates(toCurrencyCodeID: number, date: Date): Observable<any> {
        return this.GetAction(
            null,
            'get-all-exchange-rates',
            `toCurrencyCodeID=${toCurrencyCodeID}&currencyDate=${moment(date).format('YYYY-MM-DD')}`
        );
    }

    public getCurrencyExchangeRate(fromCurrencyCodeID: number = 1, toCurrencyCodeID: number = 1, currencyDate: LocalDate): Observable<any> {
        return this.GetAction(
            null,
            'get-currency-exchange-rate',
            `fromCurrencyCodeID=${fromCurrencyCodeID}&toCurrencyCodeID=${toCurrencyCodeID}&currencyDate=${currencyDate.toString()}`);
    }

    public downloadCurrency(): Observable<any> {
        return this.GetAction(null, 'download-from-norgesbank', null);
    }

    public getLatestCurrencyDownloadDate(downloadSource: number = 0): Observable<any> {
        return this.GetAction(
            null,
            'get-latest-currency-downloaded-date',
            `downloadSource=${downloadSource > 0 ? downloadSource : null}`
        );
    }

}
