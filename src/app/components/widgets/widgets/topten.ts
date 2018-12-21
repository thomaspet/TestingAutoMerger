import {Component} from '@angular/core';
import {Router} from '@angular/router/';
import {FinancialYearService} from '@app/services/services';
import {WidgetDataService} from '../widgetDataService';
import {IUniWidget} from '../uniWidget';

@Component({
    selector: 'uni-top-ten-widget',
    template: `
        <section class="uni-widget-header">
            {{widget.description}}
        </section>

        <section class="uni-widget-content topten-table-container">
            <table class="topten-table">
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
                    <tr *ngFor="let customer of data">
                        <td
                            class="customer-name-col thirtyfive-width-start"
                            title="Gå til kundekortet"
                            (click)="navigateToCustomer(customer.ID)">
                            {{ customer.Name }}
                        </td>
                        <td class="twenty-width-right">{{ numberToMoney(customer.SumThisYear) }}</td>
                        <td class="previous-year  twenty-width-right">{{ numberToMoney(customer.SumPreviousYear) }}</td>
                        <td class="twenty-width-right">{{ numberToMoney(customer.SumRest) }}</td>
                        <td class="five-width-end">
                            <a (click)="hideShowContextMenu(customer)" class="context-menu-link">...</a>
                            <ul *ngIf="customer.showContextMenu" class="topten-context-menu">
                                <li *ngFor="let item of widget.config.contextMenuItems"
                                    tabindex="-1"
                                    (click)="newItem(customer, item)"
                                    (clickOutside)="onBlur(customer)">
                                    {{ item.label }}
                                </li>
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    `
})

export class UniTopTenWidget {
    public widget: IUniWidget;
    public data = [];
    public currentYear: number;
    public previousYear: number;

    private numberFormat: any = {
        thousandSeparator: ' ',
        decimalSeparator: '.',
        decimalLength: 2
    };

    constructor(
        private financialYearService: FinancialYearService,
        private dataService: WidgetDataService,
        private router: Router
    ) {
        this.currentYear = this.financialYearService.getActiveYear();
        this.previousYear = this.currentYear - 1;
        this.dataService.getData(this.getEndPoint()).subscribe((res) => {
            res.forEach(item => item.showContextMenu = false);
            this.data = res;
        });
    }

    public navigateToCustomer(id: number) {
        this.router.navigateByUrl('/sales/customer/' + id);
    }

    public newItem(entity, item) {
        let url = item.link;

        if (item.needsID) {
            url += entity.ID;
        }

        this.router.navigateByUrl(url);
    }

    public hideShowContextMenu(row) {
        row.showContextMenu = !row.showContextMenu;
    }

    public onBlur(row) {
        row.showContextMenu = false;
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
