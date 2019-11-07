import {Component, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../authService';
import {IUniWidget} from '../uniWidget';
import {WidgetDataService} from '../widgetDataService';
import * as moment from 'moment';
import {FinancialYearService} from '@app/services/services';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import PerfectScrollbar from 'perfect-scrollbar';
import {take} from 'rxjs/operators';

enum PayrollRunPaymentStatus {
    None = 0,
    SentToPayment = 1,
    PartlyPaid = 2,
    Paid = 3
}

@Component({
    selector: 'uni-transactions',
    template: `
    <section class="widget-wrapper">
        <section class="header">
            <span>{{ current?.header | translate }}</span>

            <section class="filters">
                <button #toggle class="tertiary toggle-button">
                    {{ current?.label | translate }}
                    <i class="material-icons">expand_more</i>
                </button>
                <dropdown-menu [trigger]="toggle" minWidth="8rem">
                    <ng-template>
                        <a class="dropdown-menu-item"
                            *ngFor="let item of items; let itemIndex = index;"
                            (click)="changeModel(itemIndex)">
                            {{ item.label | translate }}
                        </a>
                    </ng-template>
                </dropdown-menu>
            </section>
        </section>

        <section class="content" style="padding: .5rem 1.5rem">
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

                    <tbody id="transaction-list">
                        <tr *ngFor="let row of lookupResult; let i = index;">
                            <td *ngFor="let col of current?.columns"
                                [ngClass]="col.class" (click)="rowSelected(row, col)">
                                {{ col.displayFunction ? col.displayFunction(row[col.key]) : row[col.key] }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </section>
    `
})

export class UniTransactionsWidget implements AfterViewInit {

    public items: Array<any> = [];
    public lookupResult: any;
    public current: any;
    scrollbar: PerfectScrollbar;
    private lastVisitedModel: string;
    public widget: IUniWidget;
    private numberFormat: any = {
        thousandSeparator: ' ',
        decimalSeparator: '.',
        decimalLength: 2
    };

    constructor(
        private dataService: WidgetDataService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private financialYearService: FinancialYearService,
        private browserStorage: BrowserStorageService,
    ) { }

    public ngAfterViewInit() {
        if (this.widget) {
            this.lastVisitedModel = this.browserStorage.getItem('lastVisitedModel');

            // Authenticate all routes/modules
            this.authService.authentication$.pipe(take(1)).subscribe(auth => {
                if (auth.user) {
                    this.checkRoutesAndSetDefault(auth.user);
                    this.cdr.markForCheck();
                }
            });
        }
    }

    public changeModel(index: number) {
        // Set old currents active to false and new to true
        this.current.active = false;
        this.items[index].active = true;
        this.current = this.items[index];

        // Local variable and local storage to remember last
        this.lastVisitedModel = this.current.label;
        this.browserStorage.setItem('lastVisitedModel', this.lastVisitedModel);

        // Get new data
        this.getData();
    }

    public rowSelected(item, col?) {
        if (!item && !item.ID) {
            return;
        }
        if (col && col.link && col.linkValue && item[col.linkValue]) {
            this.router.navigateByUrl(col.link + item[col.linkValue]);
        } else {
            this.router.navigateByUrl(this.current.link + item.ID);
        }
    }

    private getData() {
        this.dataService.getData(this.current.dataEndPoint).subscribe((res) => {
            // Add res.Data check for when using statistics route
            if (res.Data) {
                this.lookupResult = res.Data;
            } else {
                this.lookupResult = res;
            }
            const elem = document.getElementById('transaction-list');
            if (elem) {
                this.scrollbar = new PerfectScrollbar(elem, {wheelPropagation: true});
            }

            this.cdr.markForCheck();
        });
    }

    private checkRoutesAndSetDefault(user) {
        if (this.widget.config.dashboard === 'Sale') {
            this.items = this.getSalesTransactionItems();
        } else if (this.widget.config.dashboard === 'Salary') {
            this.items = this.getSalaryTransactionItems(this.financialYearService.getActiveYear());
        } else if (this.widget.config.dashboard === 'Accounting') {
            this.items = this.getAccountingTransactionItems();
        }

        this.items = this.items.filter(item => {
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
            this.browserStorage.setItem('lastVisitedModel', this.items[0].label);
        }

        this.current.active = true;

        this.getData();
    }

    public statusCodeToText(value) {
        // Should be in helper class?
        if (!value && value !== 0) {
            return '';
        }

        let statusText: string = value;
        switch (value.toString()) {

            case '0':
                statusText = 'Opprettet';
                break;
            case '1':
                statusText = 'Avregnet';
                break;
            case '2':
                statusText = 'Godkjent';
                break;
            case '3':
                statusText = 'Sendt til utbetaling';
                break;
            case '4':
                statusText = 'Utbetalt';
                break;
            case '5':
                statusText = 'Bokført';
                break;
            case '6':
                statusText = 'Slettet';
                break;

                // Accounting/bills

            case '30102':
                statusText = 'Til godkjenning';
                break;
            case '30103':
                statusText = 'Godkjent';
                break;
            case '30104':
                statusText = 'Bokført';
                break;
            case '30105':
                statusText = 'Til betaling';
                break;
            case '30106':
                statusText = 'Delbetalt';
                break;
            case '30107':
                statusText = 'Betalt';
                break;
            case '30108':
                statusText = 'Avvist';
                break;
            case '40001':
                statusText = 'Arkivert';
                break;
            case '90001':
                statusText = 'Slettet';
                break;

            case '30101':
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

    public getSalesTransactionItems(): Array<any> {
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
                            return moment(value).format('DD MMM YYYY');
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
                        label: 'Tilbudsnr',
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
                            return moment(value).format('DD MMM YYYY');
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
                        class: 'transaction_table_ten_percent',
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
                        class: 'transaction_table_ten_percent',
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

    private getSalaryTransactionItems(year: number) {
        return [
            {
                label: 'NAVBAR.PAYROLL',
                header: 'SALARY.PAYROLL.LATEST',
                dataEndPoint: `/api/biz/payrollrun?orderby=ID desc&filter=${year ? 'year(PayDate) eq ' + year : ''}`,
                columns: [
                    {
                        label: 'Nr',
                        style: '',
                        class: 'transaction_table_ten_percent',
                        key: 'ID'
                    },
                    {
                        label: 'Navn',
                        style: '',
                        class: '',
                        key: 'Description'
                    },
                    {
                        label: 'Status',
                        style: '',
                        class: '',
                        displayFunction: (code) => {
                            return this.statusCodeToText(code);
                        },
                        key: 'StatusCode'
                    },
                    {
                        label: 'Betalingsstatus',
                        style: '',
                        class: '',
                        displayFunction: (status) => {
                            switch (status) {
                                case PayrollRunPaymentStatus.SentToPayment:
                                    return 'Sendt til utbetaling';
                                case PayrollRunPaymentStatus.PartlyPaid:
                                    return 'Delbetalt';
                                case PayrollRunPaymentStatus.Paid:
                                    return 'Utbetalt';
                                default:
                                    return '';
                            }
                        },
                        key: '_payStatus'
                    },
                    {
                        label: 'Utbetalingsdato',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return moment(value).format('DD MMM YYYY');
                        },
                        key: 'PayDate'
                    }
                ],
                urlToNew: '/salary/payrollrun/0',
                link: '/salary/payrollrun/'
            },
            {
                label: 'Ansatte',
                header: 'Siste ansatte',
                dataEndPoint: '/api/biz/employees?orderby=EmployeeNumber desc'
                    + '&expand=BusinessRelationInfo.DefaultEmail,SubEntity.BusinessRelationInfo&top=20',
                columns: [
                    {
                        label: 'Nr',
                        style: '',
                        class: 'transaction_table_ten_percent',
                        key: 'EmployeeNumber'
                    },
                    {
                        label: 'Navn',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return value ? value.Name : '';
                        },
                        key: 'BusinessRelationInfo'
                    },
                    {
                        label: 'E-post',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            if (value && value.DefaultEmail) {
                                return value.DefaultEmail.EmailAddress;
                            } else {
                                return '';
                            }
                        },
                        key: 'BusinessRelationInfo'
                    },
                    {
                        label: 'Fødselsdato',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            if (!value) { return ''; }
                            return moment(value).format('DD.MM.YYYY');
                        },
                        key: 'BirthDate'
                    },
                    {
                        label: 'Virksomhet',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            if (value && value.BusinessRelationInfo) {
                                return value.BusinessRelationInfo.Name;
                            } else {
                                return '';
                            }
                        },
                        key: 'SubEntity'
                    }
                ],
                urlToNew: '/salary/employees/0',
                link: '/salary/employees/'
            }
        ];
    }

    private getAccountingTransactionItems() {
        return [
            {
                label: 'NAVBAR.SUPPLIER_INVOICE',
                header: 'ACCOUNTING.SUPPLIER_INVOICE.LATEST',
                dataEndPoint: '/api/statistics/?model=SupplierInvoice&select=id as ID,statuscode as StatusCode,'
                + 'Supplier.SupplierNumber,Supplier.ID,Info.Name,paymentduedate as PaymentDueDate,invoicedate as InvoiceDate,'
                + 'invoicenumber as InvoiceNumber,stuff(user.displayname) as Assignees,BankAccount.AccountNumber,'
                + 'paymentinformation as PaymentInformation,taxinclusiveamount as TaxInclusiveAmount,'
                + 'taxinclusiveamountcurrency as TaxInclusiveAmountCurrency,paymentid as PaymentID,'
                + 'JournalEntry.JournalEntryNumber,restamount as RestAmount,Project.Name,Project.Projectnumber,'
                + 'Department.Name,Department.DepartmentNumber,currencycodeid as CurrencyCodeID,CurrencyCode.Code'
                + '&join=supplierinvoice.id eq task.entityid '
                + 'and task.id eq approval.taskid and approval.userid eq user.id'
                + '&expand=supplier.info,journalentry,dimensions.project,dimensions.department,bankaccount,'
                + 'CurrencyCode&orderby=id desc&filter=( isnull(deleted,0) eq 0  )&top=20',
                columns: [
                    {
                        label: 'Fakturanr',
                        style: '',
                        class: 'transaction_table_ten_percent',
                        key: 'InvoiceNumber'
                    },
                    {
                        label: 'Leverandør',
                        style: '',
                        class: 'transaction_table_fifteen_rem link',
                        key: 'InfoName',
                        link: '/accounting/suppliers/',
                        linkValue: 'SupplierID'
                    },
                    {
                        label: 'Fakturadato',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return moment(value).format('DD MMM YYYY');
                        },
                        key: 'InvoiceDate'
                    },
                    {
                        label: 'Forfallsdato',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return moment(value).format('DD MMM YYYY');
                        },
                        key: 'PaymentDueDate'
                    },
                    {
                        label: 'Beløp',
                        style: '',
                        class: 'right',
                        displayFunction: (value) => {
                            return this.numberToMoney(value);
                        },
                        key: 'TaxInclusiveAmount'
                    },
                    {
                        label: 'Status',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            return this.statusCodeToText(value);
                        },
                        key: 'StatusCode'
                    }
                ],
                urlToNew: '/accounting/bills/0',
                link: '/accounting/bills/'
            },
            {
                label: 'Leverandør',
                header: 'Siste leverandører',
                dataEndPoint: '/api/biz/suppliers?skip=0&top=20&expand=Info,Dimensions,'
                    + 'Dimensions.Department,Dimensions.Project',
                columns: [
                    {
                        label: 'Levnr',
                        style: '',
                        class: 'transaction_table_ten_percent',
                        key: 'SupplierNumber'
                    },
                    {
                        label: 'Navn',
                        style: '',
                        class: 'transaction_table_forty_percent',
                        displayFunction: (value) => {
                            return value ? value.Name : '';
                        },
                        key: 'Info'
                    },
                    {
                        label: 'Orgnr',
                        style: '',
                        class: 'transaction_table_fifteen_percent',
                        key: 'OrgNumber'
                    },
                    {
                        label: 'Avdeling',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            if (value  && value.Department) {
                                return value.Department.DepartmentNumber + ': ' + value.Department.Name;
                            } else {
                                return '';
                            }
                        },
                        key: 'Dimensions'
                    },
                    {
                        label: 'Prosjekt',
                        style: '',
                        class: '',
                        displayFunction: (value) => {
                            if (value  && value.Project) {
                                return value.Project.ProjectNumber + ': ' + value.Project.Name;
                            } else {
                                return '';
                            }
                        },
                        key: 'Dimensions'
                    }
                ],
                urlToNew: '/accounting/suppliers/0',
                link: '/accounting/suppliers/'
            }
        ];
    }

}
