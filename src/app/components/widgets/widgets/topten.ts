import {Component, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router/';
import {FinancialYearService} from '@app/services/services';
import {WidgetDataService} from '../widgetDataService';
import {IUniWidget} from '../uniWidget';

@Component({
    selector: 'uni-top-ten-widget',
    template: `
        <section class="uni-widget-header">
            {{widget.description}}
            <i class="material-icons state-icon" title="Listevisning" (click)="changeState(0)"> view_list </i>
            <i class="material-icons state-icon" style="right: .8rem" title="Kunde for kunde" (click)="changeState(1)"> view_week </i>
        </section>

        <section class="uni-widget-content topten-table-container">
            <div class="top-ten-single-view" *ngIf="state === 'SINGLE' && currentCustomer">
                <div class="top-ten-customername">
                    <i class="material-icons" title="Forrige kunde" (click)="changeCustomer(-1)"> chevron_left </i>
                    <span title="Gå til kundekortet" (click)="navigateToCustomer(currentCustomer.ID)"> {{ currentCustomer.Name }} </span>
                    <i class="material-icons" title="Neste kunde" (click)="changeCustomer(1)"> chevron_right </i>
                </div>
                <div class="top-ten-new-buttons">
                    <button (click)="navigateToEntity('invoices', currentCustomer.ID)"> Ny faktura </button>
                    <button (click)="navigateToEntity('orders', currentCustomer.ID)"> Ny ordre </button>
                    <button (click)="navigateToEntity('quotes', currentCustomer.ID)"> Nytt tilbud </button>
                </div>
                <div class="top-ten-info-container">
                    <div class="top-ten-infobox top-ten-current-year">
                        <span> {{ currentYear }} </span>
                        <span> {{numberToMoney(currentCustomer.SumThisYear)}} </span>
                    </div>
                    <div class="top-ten-infobox top-ten-previous-year">
                        <span> {{ previousYear }} </span>
                        <span> {{numberToMoney(currentCustomer.SumPreviousYear)}} </span>
                    </div>
                    <div class="top-ten-infobox top-ten-unpaid">
                        <span> Utestående </span>
                        <span> {{numberToMoney(currentCustomer.SumRest)}}</span>
                    </div>
                </div>
            </div>

            <table class="topten-table" *ngIf="state === 'LIST'">
                <thead>
                    <tr>
                        <th class="thirtyfive-width-start"></th>
                        <th class="twenty-width-right">Salg {{ currentYear }}</th>
                        <th class="previous-year twenty-width-right">Salg {{ previousYear }}</th>
                        <th class="twenty-width-right">Utestående </th>
                        <th class="five-width-end"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let customer of data; let i = index;">
                        <td
                            class="customer-name-col thirtyfive-width-start"
                            title="Gå til kundekortet"
                            (click)="navigateToCustomer(customer.ID)">
                            {{ customer.Name }}
                        </td>
                        <td class="twenty-width-right">{{ numberToMoney(customer.SumThisYear) }}</td>
                        <td class="previous-year  twenty-width-right">{{ numberToMoney(customer.SumPreviousYear) }}</td>
                        <td class="twenty-width-right">{{ numberToMoney(customer.SumRest) }}</td>
                        <td class="five-width-end" [matMenuTriggerFor]="contextMenu">
                            <ng-container>
                                <i class="material-icons" style="font-size: 15px; vertical-align: middle; cursor: pointer;">
                                    more_horiz
                                </i>
                                <mat-menu #contextMenu="matMenu" [overlapTrigger]="false" yPosition="below">
                                    <ul class="menu-list">
                                        <li *ngFor="let item of contextMenuItems"
                                            (click)="navigateToEntity(item.entity, customer.ID, i)">
                                            {{item.label}}
                                        </li>
                                    </ul>
                                </mat-menu>
                            </ng-container>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    `
})

export class UniTopTenWidget {
    widget: IUniWidget;
    data = [];
    currentYear: number;
    previousYear: number;

    states = ['LIST', 'SINGLE'];
    state = this.states[0];

    currentCustomer: any;
    currentCustomerIndex: number = 0;

    contextMenuItems = [
        { label: 'Ny faktura', entity: 'invoices' },
        { label: 'Ny ordre', entity: 'orders' },
        { label: 'Nytt tilbud', entity: 'quotes' },
        { label: 'Detaljvisning', entity: 'customer' }
    ];

    private numberFormat: any = {
        thousandSeparator: ' ',
        decimalSeparator: '.',
        decimalLength: 2
    };

    constructor(
        private financialYearService: FinancialYearService,
        private dataService: WidgetDataService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.currentYear = this.financialYearService.getActiveYear();
        this.previousYear = this.currentYear - 1;
        this.dataService.getData(this.getEndPoint()).subscribe((res) => {
            this.data = res;
            this.currentCustomer = this.data[0];
        });
    }

    public navigateToCustomer(id: number) {
        this.router.navigateByUrl('/sales/customer/' + id);
    }

    public changeCustomer(direction: number) {
        if (this.currentCustomerIndex === this.data.length - 1 && direction > 0) {
            this.currentCustomerIndex = 0;
        } else if (this.currentCustomerIndex === 0 && direction < 0) {
            this.currentCustomerIndex = this.data.length - 1;
        } else {
            this.currentCustomerIndex += direction;
        }
        this.currentCustomer = this.data[this.currentCustomerIndex];
        this.cdr.markForCheck();
    }

    public changeState(index: number) {
        this.state = this.states[index];
        this.cdr.markForCheck();
    }

    public navigateToEntity(entity: string, id: number, index?: number) {
        if (entity === 'customer') {
            this.currentCustomerIndex = index;
            this.currentCustomer = this.data[index];
            this.state = this.states[1];
        } else {
            this.router.navigateByUrl(`sales/${entity}/0;customerID=${id}`);
        }
    }

    public numberToMoney(value: any) {
        if (!value) {
             return value === 0 ? '0,00' : '';
        }
        let stringValue = value.toString().replace(',', '.');
        stringValue = parseFloat(stringValue).toFixed(this.numberFormat.decimalLength);

        // tslint:disable-next-line
        let [integer, decimal] = stringValue.split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.numberFormat.thousandSeparator);

        stringValue = decimal ? (integer + this.numberFormat.decimalSeparator + decimal) : integer;

        return stringValue;
    }

    // In case of top ten of other entities, endpoint could come from widget config. The x as value too?
    public getEndPoint() {
        return '/api/statistics?model=Customer'
        + `&select=sum(casewhen(CustomerInvoice.InvoiceDate gt ${this.currentYear}0101 `
        + `and CustomerInvoice.InvoiceDate lt ${this.currentYear + 1}0101,`
        + 'CustomerInvoice.TaxInclusiveAmount,0)) as SumThisYear,'
        + `sum(casewhen(CustomerInvoice.InvoiceDate gt ${this.currentYear - 1}0101 and `
        + `CustomerInvoice.InvoiceDate lt ${this.currentYear}0101,`
        + 'CustomerInvoice.TaxInclusiveAmount,0)) as SumPreviousYear,'
        + 'sum(CustomerInvoice.RestAmount) as SumRest,'
        + 'ID as ID,CustomerNumber as CustomerNumber,info.name as Name'
        + '&join=Customer.ID eq CustomerInvoice.CustomerID'
        + '&top=10'
        + '&expand=info'
        + '&orderby=sum(casewhen(CustomerInvoice.InvoiceDate gt 20170101,CustomerInvoice.TaxInclusiveAmount,0)) desc'
        + '&wrap=false'
        + '&distinct=false';
    }
}
