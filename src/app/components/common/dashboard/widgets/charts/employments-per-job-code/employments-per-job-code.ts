import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {DashboardDataService} from '../../../dashboard-data.service';
import {COLORS} from '../../../colors';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
    selector: 'employments-per-job-code',
    templateUrl: './employments-per-job-code.html',
    styleUrls: ['./employments-per-job-code.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmploymentsPerJobCodeWidget {
    loading = true;
    hasData = false;

    chartConfig;
    data: {JobName: string; Count: number}[];

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService
    ) {}

    ngOnInit() {
        this.dataService.get(
            `/api/statistics?model=Employee&select=count(ID) as Count,isnull(Employments.JobName,'Ingen stillingskode') as JobName&expand=Employments&wrap=false`
        ).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            })
        ).subscribe(counts => {
            this.hasData = counts?.length;
            if (this.hasData) {
                this.data = counts.sort((a, b) => b.Count - a.Count);
                this.chartConfig = this.getChartConfig();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    private getChartConfig() {
        const data = this.data.slice(0, 4);
        const rest = this.data.slice(4);

        data.push({
            JobName: 'Resterende',
            Count: rest.reduce((count, item) => count += (item.Count || 0), 0)
        });

        return {
            type: 'pie',
            data: {
                labels: data.map(item => item.JobName),
                datasets: [{
                    data: data.map(item => item.Count),
                    backgroundColor: COLORS.pie_colors,
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
                legend: {
                    position: 'right',
                    align: 'center',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                elements: {
                    arc: {borderWidth: 2}
                }
            }
        };
    }
}
