import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {NumberSeries} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class NumberSeriesService extends BizHttp<NumberSeries> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = NumberSeries.RelativeUrl;
        this.entityType = NumberSeries.EntityType;
        this.DefaultOrderBy = null;
    }

    public getNumberSeriesList() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('number-series?hateoas=false&orderby=FromNumber,NumberSeriesTaskID,AccountYear desc&expand=NumberSeriesType,NumberSeriesTask&filter=disabled eq 0')
            .send().map(response => response.json());
    }

    public save<T>(item: T): Observable<T> {
        var itemX: any = item;
        if (itemX && itemX.ID) {
            return this.Put(itemX.ID, itemX);
        }
        return this.Post(itemX)
    }

    public suggestions: any[] = [
        {Name: 'JournalEntry invoice number series type', _DisplayName: 'Faktura bilag (salg)', _Task: 'CustomerInvoice', _Register: 'Bilag', NextNumber: null, _FromNumber: 50000, _ToNumber: 59999, _NextNumber: 50000, UseNumbersFromNumberSeriesID: null},
        {Name: 'JournalEntry supplierinvoice number series type', _DisplayName: 'Faktura bilag (innkjøp)', _Task: 'SupplierInvoice', _Register: 'Bilag', NextNumber: null, _FromNumber: 60000, _ToNumber: 69999, _NextNumber: 60000, UseNumbersFromNumberSeriesID: null},
        {Name: 'JournalEntry salary number series type', _DisplayName: 'Lønnsbilag', _Task: 'Salary', _Register: 'Bilag', NextNumber: null, _FromNumber: 70000, _ToNumber: 79999, _NextNumber: 70000, UseNumbersFromNumberSeriesID: null},
        {Name: 'JournalEntry bank number series type', _DisplayName: 'Bank', _Task: 'Bank', _Register: 'Bilag', NextNumber: null, _FromNumber: 80000, _ToNumber: 89999, _NextNumber: 80000, UseNumbersFromNumberSeriesID: null},
        {Name: 'JournalEntry vatreport number series type', _DisplayName: 'MVA', _Task: 'VatReport', _Register: 'Bilag', NextNumber: null, _FromNumber: 90000, _ToNumber: 99999, _NextNumber: 60000, UseNumbersFromNumberSeriesID: null}
    ];

    public yearly: any[] = [
        {ID: true, DisplayName: 'Årlig'},
        {ID: false, DisplayName: 'Fortløpende'}
    ];

    public asinvoicenumber: any[] = [
        {ID: false, DisplayName: 'Nei'},
        {ID: true, DisplayName: 'Ja'}
    ];

    public series: any[] = [
        {ID: 'JournalEntry', Name: 'Regnskap'},
        {ID: 'Sale', Name: 'Salg'},
        {ID: 'Accounts', Name: 'Kontoer'},
        {ID: 'Others', Name: 'Andre serier'}
    ];

    public registers: any[] = [
        {EntityType: 'JournalEntry', DisplayName: 'Bilag'},
        {EntityType: 'CustomerInvoice', DisplayName: 'Faktura'},
        {EntityType: 'CustomerOrder', DisplayName: 'Ordre'},
        {EntityType: 'CustomerQuote', DisplayName: 'Tilbud'},
        {EntityType: 'Reminder', DisplayName: 'Purring'},
        {EntityType: 'Project', DisplayName: 'Prosjekt'},
        {EntityType: 'Department', DisplayName: 'Avdeling'},
        {EntityType: 'Employee', DisplayName: 'Ansatt'},
    ];

    public translateSerie(serie) {
        switch(serie.Name) {
            case 'JournalEntry number series Yearly':
            case 'JournalEntry number series yearly':
                serie._DisplayName = `Generelle bilag ${serie.AccountYear}`;
                break;
            case 'JournalEntry number series type NOT yearly':
                serie._DisplayName = 'Generelle bilag';
                break;
            case 'JournalEntry invoice number series type':
                serie._DisplayName = 'Faktura bilag (salg)';
                break;
            case 'JournalEntry supplierinvoice number series type':
                serie._DisplayName = 'Faktura bilag (innkjøp)';
                break;
            case 'JournalEntry salary number series type':
                serie._DisplayName = 'Lønnsbilag';
                break;
            case 'JournalEntry bank number series type':
                serie._DisplayName = 'Bank';
                break;
            case 'JournalEntry vatreport number series type':
                serie._DisplayName = 'MVA';
                break;
            case 'Customer Invoice number series':
                serie._DisplayName = 'Fakturanummer';
                break;
            case 'Customer Order number series':
                serie._DisplayName = 'Ordrenummer'
                break;
            case 'Customer Quote number series':
                serie._DisplayName = 'Tilbudsnummer';
                break;
            case 'Customer Invoice Reminder number series':
                serie._DisplayName = 'Purrenummer';
                break;
            case 'Customer number series':
                serie._DisplayName = 'Debitor';
                break;
            case 'Supplier number series':
                serie._DisplayName = 'Kreditor';
                break;
            case 'Department number series':
                serie._DisplayName = 'Avdeling';
                break;
            case 'Employee number series':
                serie._DisplayName = 'Ansatt';
                break;
            case 'Project number series':
                serie._DisplayName = 'Prosjekt';
                break;
            default:
                serie._DisplayName = serie.Name;
        }

        return serie;
    }
}
