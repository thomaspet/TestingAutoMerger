import {Component, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../authService';
import {WidgetDataService} from '../widgetDataService';
import * as moment from 'moment';

@Component({
    selector: 'uni-transactions',
    template: `
        <section class="uni-widget-header">{{ current?.header }}</section>

        <section class="uni-widget-content" style="display: flex; flex-direction: row; text-align: left; padding: 0;">
            <div class="transaction-list">
                <ul style="list-style: none">
                    <li *ngFor="let item of items; let itemIndex = index;"
                        [ngClass]="{ 'is-active' : item.active }"
                        (click)="changeModel(itemIndex)">
                     {{ item.label }}
                    </li>
                </ul>
            </div>
            <div class="transaction_table">
                <table>
                    <thead>
                        <tr>
                            <th *ngFor="let col of current?.columns; let i = index;"
                                [ngClass]="col.class">
                                {{ col.label }}
                            </th>
                        <tr>
                    </thead>

                    <tbody>
                        <tr *ngFor="let row of lookupResult; let i = index;">
                            <td *ngFor="let col of current?.columns"
                                [ngClass]="col.class"
                                (click)="rowSelected(row)">
                                {{ col.displayFunction ? col.displayFunction(row[col.key]) : row[col.key] }}
                            </td>
                        </tr>
                    </tbody>

                </table>
            </div>

        </section>
    `
})

export class UniTransactionsWidget {

    public items: Array<any> = [];
    public lookupResult: any;
    private current: any;
    private lastVisitedModel: string;
    private numberFormat: any = {
        thousandSeparator: ' ',
        decimalSeparator: '.',
        decimalLength: 2
    };

    constructor(
        private dataService: WidgetDataService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {
        this.lastVisitedModel = localStorage.getItem('lastVisitedModel');

        // Authenticate all routes/modules
        this.authService.authentication$.subscribe(auth => {
            if (auth.user) {
                this.checkRoutesAndSetDefault(auth.user);
                this.cdr.markForCheck();
            }
        });
    }

    public changeModel(index: number) {
        // Set old currents active to false and new to true
        this.current.active = false;
        this.items[index].active = true;
        this.current = this.items[index];

        // Local variable and local storage to remember last
        this.lastVisitedModel = this.current.label;
        localStorage.setItem('lastVisitedModel', this.lastVisitedModel);

        // Get new data
        this.getData();
    }

    public rowSelected(item) {
        if (!item && !item.ID) {
            return;
        }
        this.router.navigateByUrl(this.current.link + item.ID);
    }

    private getData() {
        this.dataService.getData(this.current.dataEndPoint).subscribe((res) => {
            this.lookupResult = res;
            this.cdr.markForCheck();
        });
    }

    private checkRoutesAndSetDefault(user) {
        this.items = this.getTransactionItems().filter(item => {
            return this.authService.canActivateRoute(user, item.link);
        });

        if (!this.items.length) {
            // What to do with widget if user has none of the modules shown??
            return;
        }

        if (this.lastVisitedModel) {
            this.current = this.items.filter(item => item.label === this.lastVisitedModel)[0];
        }

        if (!this.current) {
            this.current = this.items[0];
            localStorage.setItem('lastVisitedModel', this.items[0].label);
        }

        this.current.active = true;

        this.getData();
    };

    public statusCodeToText(value) {
        // Should be in helper class?
        if (!value) {
            return '';
        }

        let statusText: string = value;
        switch (value.toString()) {
            case '40101':
            case '41001':
            case '42001':
                statusText = 'Kladd';
                break;
            case '40102':
            case '41002':
                statusText = 'Registrert';
                break;
            case '40103':
                statusText = 'Sendt til kunde';
                break;
            case '40104':
                statusText = 'Godkjent';
                break;
            case '41003':
                statusText = 'Delvis overført';
                break;
            case '40105':
                statusText = 'Overført til ordre';
                break;
            case '40106':
            case '41004':
                statusText = 'Overført til faktura';
                break;
            case '40107':
                statusText = 'Ferdigstilt';
                break;
            case '42002':
                statusText = 'Fakturert';
                break;
            case '42003':
                statusText = 'Delbetalt';
                break;
            case '42004':
                statusText = 'Betalt';
                break;
            case '42501':
                statusText = 'Purret';
                break;
            case '42502':
                statusText = 'Inkasso';
                break;
        }
        return statusText;
    }

    public numberToMoney(value: any) {
        if (!value) {
             return '';
        }
        let stringValue = value.toString().replace(',', '.');
        stringValue = parseFloat(stringValue).toFixed(this.numberFormat.decimalLength);

        let [integer, decimal] = stringValue.split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.numberFormat.thousandSeparator);

        stringValue = decimal ? (integer + this.numberFormat.decimalSeparator + decimal) : integer;

        return stringValue;
    }

    public getTransactionItems(): Array<any> {
        // Can come from caller/dashboard?
        return [
            {
                label: 'Faktura',
                header: 'Siste faktura',
                dataEndPoint: '/api/biz/invoices?top=20&orderby=ID%20DESC&expand=Customer',
                columns: [
                    {
                        label: 'Fakturanr',
                        style: 'color: red',
                        class: 'transaction_table_ten_percent',
                        displayFunction: (value) => {
                            return value || 'Kladd';
                        },
                        key: 'InvoiceNumber'
                    },
                    {
                        label: 'Kunde',
                        style: '',
                        class: 'transaction_table_forty_percent',
                        key: 'CustomerName'
                    },
                    {
                        label: 'Dato',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return moment(value).format('DD MMM YYYY');
                        },
                        key: 'InvoiceDate'
                    },
                    {
                        label: 'Status',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return this.statusCodeToText(value);
                        },
                        key: 'StatusCode'
                    },
                    {
                        label: 'Sum',
                        style: '',
                        class: 'transaction_table_align_right transaction_table_fifteen_percent',
                        displayFunction: (value) => {
                            return this.numberToMoney(value);
                        },
                        key: 'TaxInclusiveAmount'
                    }
                ],
                urlToNew: '/sales/invoices/0',
                link: '/sales/invoices/'
            },
            {
                label: 'Ordre',
                header: 'Siste ordre',
                dataEndPoint: '/api/biz/orders?top=20&orderby=ID DESC',
                columns: [
                    {
                        label: 'Ordrenr',
                        style: 'color: red',
                        class: 'transaction_table_ten_percent',
                        displayFunction: (value) => {
                            return value || 'Kladd';
                        },
                        key: 'OrderNumber'
                    },
                    {
                        label: 'Kunde',
                        style: '',
                        class: 'transaction_table_forty_percent',
                        key: 'CustomerName'
                    },
                    {
                        label: 'Dato',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return moment(value).format('do MMM YYYY');
                        },
                        key: 'OrderDate'
                    },
                    {
                        label: 'Status',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return this.statusCodeToText(value);
                        },
                        key: 'StatusCode'
                    },
                    {
                        label: 'Sum',
                        style: '',
                        class: 'transaction_table_align_right transaction_table_fifteen_percent',
                        displayFunction: (value) => {
                            return this.numberToMoney(value);
                        },
                        key: 'TaxInclusiveAmount'
                    }
                ],
                urlToNew: '/sales/orders/0',
                link: '/sales/orders/'
            },
            {
                label: 'Tilbud',
                header: 'Siste tilbud',
                dataEndPoint: '/api/biz/quotes?top=20&orderby=ID DESC&expand=Customer',
                columns: [
                    {
                        label: 'Ordrenr',
                        style: 'color: red',
                        class: 'transaction_table_ten_percent',
                        displayFunction: (value) => {
                            return value || 'Kladd';
                        },
                        key: 'QuoteNumber'
                    },
                    {
                        label: 'Kunde',
                        style: '',
                        class: 'transaction_table_forty_percent',
                        key: 'CustomerName'
                    },
                    {
                        label: 'Dato',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return moment(value).format('do MMM YYYY');
                        },
                        key: 'QuoteDate'
                    },
                    {
                        label: 'Status',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return this.statusCodeToText(value);
                        },
                        key: 'StatusCode'
                    },
                    {
                        label: 'Sum',
                        style: '',
                        class: 'transaction_table_align_right transaction_table_fifteen_percent',
                        displayFunction: (value) => {
                            return this.numberToMoney(value);
                        },
                        key: 'TaxInclusiveAmount'
                    }
                ],
                urlToNew: '/sales/quotes/0',
                link: '/sales/quotes/'
            },
            {
                label: 'Kunde',
                header: 'Siste kunder',
                dataEndPoint: '/api/biz/customers?top=20&orderby=ID DESC&expand=Info',
                columns: [
                    {
                        label: 'Kundenr',
                        style: '',
                        class: 'transaction_table_fifteen_percent',
                        key: 'CustomerNumber'
                    },
                    {
                        label: 'Navn',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            if (!value) {
                                return '';
                            }
                            return value.Name;
                        },
                        key: 'Info'
                    }
                ],
                urlToNew: '/sales/customer/0',
                link: '/sales/customer/'
            },
            {
                label: 'Prosjekt',
                header: 'Siste prosjekter',
                dataEndPoint: '/api/biz/projects?top=20&orderby=ID DESC',
                columns: [
                    {
                        label: 'Prosjektnr',
                        style: '',
                        class: 'transaction_table_fifteen_percent',
                        key: 'ProjectNumber'
                    },
                    {
                        label: 'Navn',
                        style: '',
                        class: '',
                        key: 'Name'
                    },
                    {
                        label: 'Prosjektleder',
                        style: '',
                        class: '',
                        key: 'ProjectLeadName'
                    },
                    {
                        label: 'Sum',
                        style: '',
                        class: 'transaction_table_align_right transaction_table_fifteen_percent',
                        displayFunction: (value) => {
                            return this.numberToMoney(value);
                        },
                        key: 'Total'
                    },
                ],
                urlToNew: '/dimensions/projects/editmode?projectID=0',
                link: '/dimensions/projects/overview?projectID='
            }
        ];
    }

}
