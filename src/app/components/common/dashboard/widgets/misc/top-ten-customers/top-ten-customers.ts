import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {DashboardDataService} from '../../../dashboard-data.service';

@Component({
    selector: 'top-ten-customers',
    templateUrl: './top-ten-customers.html',
    styleUrls: ['./top-ten-customers.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopTenCustomersWidget {
    year = new Date().getFullYear();
    years = [this.year, this.year - 1, this.year - 2];

    dataSubscription: Subscription;
    loading = true;
    hasData = false;

    data: {
        ID: number,
        CustomerNumber: number,
        Name: string,
        SumThisYear: number;
        SumLastYear: number;
        SumUnpaid: number;
    }[];

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.loadData();
    }

    ngOnDestroy() {
        this.dataSubscription?.unsubscribe();
    }

    private loadData() {
        const selects = [
            `sum(casewhen(CustomerInvoice.InvoiceDate gt ${this.year}0101 and CustomerInvoice.InvoiceDate lt ${this.year + 1}0101,CustomerInvoice.TaxInclusiveAmount,0)) as SumThisYear`,
            `sum(casewhen(CustomerInvoice.InvoiceDate gt ${this.year - 1}0101 and CustomerInvoice.InvoiceDate lt ${this.year}0101,CustomerInvoice.TaxInclusiveAmount,0)) as SumLastYear`,
            `sum(CustomerInvoice.RestAmount) as SumUnpaid`,
            `ID as ID`,
            `CustomerNumber as CustomerNumber`,
            `Info.Name as Name`
        ];

        const endpoint = `/api/statistics?model=Customer`
            + `&select=${selects.join(',')}`
            + `&filter=CustomerInvoice.StatusCode gt 42001`
            + `&orderby=sum(casewhen(CustomerInvoice.InvoiceDate gt ${this.year}0101,CustomerInvoice.TaxInclusiveAmount,0)) desc`
            + `&join=Customer.ID eq CustomerInvoice.CustomerID`
            + `&expand=Info&top=10&wrap=false&distinct=false`;

        this.dataSubscription?.unsubscribe();
        this.dataSubscription = this.dataService.get(endpoint).subscribe(
            res => {
                this.data = (res || []).sort((a, b) => (b.SumThisYear || 0) - (a.SumThisYear || 0));
                this.loading = false;
                this.cdr.markForCheck();
            },
            err => {
                console.error(err);
                this.loading = false;
                this.cdr.markForCheck();
            }
        );
    }

    goToCustomer(item) {
        this.router.navigateByUrl('/sales/customer/' + item.ID);
    }

    onYearSelected(year) {
        this.year = year;
        this.loadData();
    }
}
