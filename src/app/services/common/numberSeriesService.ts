import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {NumberSeries} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

const MAXNUMBER = 2147483647;

@Injectable()
export class NumberSeriesService extends BizHttp<NumberSeries> {

    public suggestions: any[] = [
        {
            Name: 'JournalEntry supplierinvoice number series type',
            DisplayName: 'Faktura bilag (innkjøp)',
            _Task: 'SupplierInvoice',
            _Register: 'Bilag',
            NextNumber: null,
            _FromNumber: 60000, _ToNumber: 69999, _NextNumber: 60000, UseNumbersFromNumberSeriesID: null
        },
        {
            Name: 'JournalEntry salary number series type',
            DisplayName: 'Lønnsbilag',
            _Task: 'Salary',
            _Register: 'Bilag',
            NextNumber: null,
            _FromNumber: 70000, _ToNumber: 79999, _NextNumber: 70000, UseNumbersFromNumberSeriesID: null
        },
        {
            Name: 'JournalEntry bank number series type',
            DisplayName: 'Bank',
            _Task: 'Bank',
            _Register: 'Bilag',
            NextNumber: null,
            _FromNumber: 80000, _ToNumber: 89999, _NextNumber: 80000, UseNumbersFromNumberSeriesID: null
        },
        {
            Name: 'JournalEntry vatreport number series type',
            DisplayName: 'MVA',
            _Task: 'VatReport',
            _Register: 'Bilag',
            NextNumber: null,
            _FromNumber: 90000, _ToNumber: 99999, _NextNumber: 90000, UseNumbersFromNumberSeriesID: null
        },
        {
            Name: 'JournalEntry invoice number series type',
            DisplayName: 'Faktura bilag (salg)',
            _Task: 'CustomerInvoice',
            _Register: 'Bilag',
            NextNumber: null,
            _FromNumber: 100000, _ToNumber: MAXNUMBER, _NextNumber: 100000, UseNumbersFromNumberSeriesID: null
        },
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
        {EntityType: 'JournalEntry', DisplayName: 'Bilag', Sale: false},
        {EntityType: 'Customer', DisplayName: 'Kunde', Sale: false},
        {EntityType: 'Supplier', DisplayName: 'Leverandør', Sale: false},
        {EntityType: 'CustomerInvoice', DisplayName: 'Faktura', Sale: true},
        {EntityType: 'CustomerOrder', DisplayName: 'Ordre', Sale: true},
        {EntityType: 'CustomerQuote', DisplayName: 'Tilbud', Sale: true},
        {EntityType: 'CustomerInvoiceReminder', DisplayName: 'Purring', Sale: true},
        {EntityType: 'Project', DisplayName: 'Prosjekt', Sale: false},
        {EntityType: 'Department', DisplayName: 'Avdeling', Sale: false},
    ];

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
            .withEndPoint('number-series?hateoas=false&orderby=AccountYear desc,NumberSeriesTaskID,FromNumber&expand=NumberSeriesType,NumberSeriesTask,MainAccount')
            .send().map(response => response.body);
    }

    public getActiveNumberSeries(entityType: string, year: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=get-active-numberseries&entityType=${entityType}&year=${year}`)
            .send()
            .map(response => response.body);
    }

    public getNumberSeriesAsInvoice(): Observable<NumberSeries> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=get-numberseries-asinvoice`)
            .send()
            .map(response => response.body);
    }

    public getAvailableNumbersInNumberSeries(numberSeriesID: number): Observable<string[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=get-available-numbers-in-numberseries&numberSeriesID=${numberSeriesID}`)
            .send()
            .map(response => response.body)
            .map(numberIntervalsStrings => numberIntervalsStrings.map(x => x.replace(',', ' - ')));
    }

    public findAndSetNextNumber(numberSeriesID: number): Observable<any> {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=reset-numberseries-next-number&numberSeriesID=${numberSeriesID}`)
            .send();
    }

    public getMaxUsedNumberInNumberSeries(numberSeriesID: number) {
        return this.http
        .asGET()
        .usingBusinessDomain()
        .withEndPoint(`${this.relativeURL}?action=get-max-used-number&numberSeriesID=${numberSeriesID}`)
        .send()
        .map(response => response.body);
    }

    public getSelectConfig(ID: number, numberSeries: any[], numberSerieName: string): any {
        return numberSeries && numberSeries.length > 1 && ID === 0 ?
            {
                items: numberSeries,
                selectedItem: numberSeries.find(x => x.Name === numberSerieName),
                label: 'Nummerserie'
            } : null;
    }

    public save<T>(item: T): Observable<T> {
        const itemX: any = item;
        if (itemX && itemX.ID) {
            return this.Put(itemX.ID, itemX);
        }
        return this.Post(itemX);
    }

    public getNewGuid(): string {
        return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,function(){return(0|Math.random()*16).toString(16)});
    }

    public CreateAndSet_DisplayNameAttributeOnSerie(serie: NumberSeries) {
        serie['_DisplayName'] = serie.DisplayName;
        return serie;
    }

    public CreateAndSet_DisplayNameAttributeOnSeries(series: Array<NumberSeries>) {
        series.forEach(serie => {
            serie = this.CreateAndSet_DisplayNameAttributeOnSerie(serie);
        });
        return series;
    }
}
