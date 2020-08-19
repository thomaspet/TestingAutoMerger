import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {DashboardDataService} from '../../../dashboard-data.service';
import {forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'unpaid-per-customer',
    templateUrl: './unpaid-per-customer.html',
    styleUrls: ['./unpaid-per-customer.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnpaidPerCustomer {
    loading = true;

    data;
    chartConfig;

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService
    ) {}

    ngOnInit() {
        forkJoin([
            this.getCustomerSums(),
            this.getTotalUnpaid()
        ]).subscribe(
            res => {
                if (res) {
                    const data = res[0] || [];
                    const totalUnpaid = res[1] || 0;

                    let rest = totalUnpaid;
                    data.forEach(customer => {
                        rest -= (customer.RestAmount || 0);
                    });


                    if (rest > 0) {
                        data.push({
                            Name: 'Resterende',
                            RestAmount: rest
                        });
                    }

                    this.data = data;
                    this.chartConfig = this.getChartConfig();
                }

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

    private getTotalUnpaid() {
        const endpoint = `/api/statistics?model=CustomerInvoice&wrap=false`
            + `&select=sum(RestAmount) as TotalUnpaid`
            + `&filter=StatusCode gt 42001`;

        return this.dataService.get(endpoint).pipe(
            map(res => res && res[0]?.TotalUnpaid)
        );
    }

    private getCustomerSums() {
        const endpoint = `/api/statistics?model=Customer`
            + `&select=Info.Name as Name,isnull(sum(CustomerInvoices.RestAmount),0) as RestAmount`
            + `&filter=CustomerInvoices.StatusCode gt 42001`
            + `&expand=Info,CustomerInvoices`
            + `&orderby=sum(CustomerInvoices.RestAmount) desc&distinct=false`
            + `&top=4&wrap=false&distinct=false`;

        return this.dataService.get(endpoint);
    }

    private getChartConfig() {
        return {
            type: 'pie',
            data: {
                labels: this.data.map(item => item.Name),
                datasets: [{
                    data: this.data.map(item => item.RestAmount),
                    backgroundColor: theme.widgets.pie_colors,
                    borderColor: '#fff',
                    hoverBorderColor: '#fff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateScale: true
                },
                legend: {
                    position: 'right',
                    align: 'center',
                },
                elements: {
                    arc: {borderWidth: 2}
                }
            }
        };
    }
}
