import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {IUniWidget} from '../../uniWidget';
import {WidgetDataService} from '../../widgetDataService';
import {Router} from '@angular/router';

@Component({
    selector: 'top-ten-customers',
    templateUrl: './top-ten-customers.html',
    styleUrls: ['./top-ten-customers.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopTenCustomersWidget {
    widget: IUniWidget;
    customers: any[];
    currentYear = new Date().getFullYear();
    unauthorized: boolean = false;

    contextMenuItems = [
        { label: 'Ny faktura', entity: 'invoices' },
        { label: 'Ny ordre', entity: 'orders' },
        { label: 'Nytt tilbud', entity: 'quotes' },
    ];

    constructor(
        private dataService: WidgetDataService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        if (this.dataService.hasAccess('ui_sales_invoices')) {
            this.dataService.getData(this.getEndPoint()).subscribe((res) => {
                this.customers = (res || []).filter(customer => {
                    return customer.SumPreviousYear > 0
                        || customer.SumThisYear > 0
                        || customer.SumRest > 0;
                });

                this.cdr.markForCheck();
            });
        } else {
            this.unauthorized = true;
            this.cdr.markForCheck();
        }
    }

    goToCustomer(id: number) {
        this.router.navigateByUrl('/sales/customer/' + id);
    }

    goToEntity(entity: string, customerID: number) {
        this.router.navigateByUrl(`/sales/${entity}/0;customerID=${customerID}`);
    }

    private getEndPoint() {
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
