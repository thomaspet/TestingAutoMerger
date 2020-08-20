import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {DashboardDataService} from '../../../dashboard-data.service';
import {Subscription, of, Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {theme} from 'src/themes/theme';

interface ExpenseItem {
    GroupName: string;
    Sum: number;
}

@Component({
    selector: 'expenses',
    templateUrl: './expenses.html',
    styleUrls: ['./expenses.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpensesWidget {
    dataSubscription: Subscription;
    colors = theme.widgets.pie_colors;

    year = new Date().getFullYear();
    years = [this.year, this.year - 1, this.year - 2, this.year - 3];

    loading: boolean = true;
    hasData: boolean;

    data: ExpenseItem[];
    totalAmount: number;
    chartConfig: any;

    constructor(
        private cdr: ChangeDetectorRef,
        private dashboardDataService: DashboardDataService
    ) { }

    ngAfterViewInit() {
        this.initChart();
    }

    ngOnDestroy() {
        this.dataSubscription?.unsubscribe();
    }

    initChart() {
        this.dataSubscription = this.loadData().subscribe(items => {
            this.hasData = items.length && items.some(item => !!item.Sum);

            if (this.hasData) {
                this.data = items;
                this.totalAmount = items.reduce((sum, item) => sum += (item.Sum || 0), 0);

                this.chartConfig = this.getChartConfig();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    onYearSelected(year) {
        this.year = year;
        this.initChart();
    }

    private getChartConfig() {
        return {
            type: 'pie',
            data: {
                labels: this.data.map(item => item.GroupName),
                datasets: [{
                    data: this.data.map(item => item.Sum),
                    backgroundColor: this.colors,
                    borderColor: '#fff',
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateScale: true
                },
                elements: {
                    arc: {borderWidth: 2}
                }
            }
        };
    }

    private loadData(): Observable<ExpenseItem[]> {
        return this.dashboardDataService.get(
            '/api/biz/accounts?action=profit-and-loss-grouped&FinancialYear=' + this.year
        ).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map(res => {
                return (res || []).filter(item => {
                    return item.GroupName === 'Varekostnad'
                        || item.GroupName === 'Lønnskostnad'
                        || item.GroupName === 'Annen driftskostnad';
                });
            })
        );
    }
}
