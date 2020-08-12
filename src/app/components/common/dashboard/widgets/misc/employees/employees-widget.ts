import {Component, ChangeDetectionStrategy, ChangeDetectorRef, HostBinding} from '@angular/core';
import {DashboardDataService} from '../../../dashboard-data.service';
import {catchError, map} from 'rxjs/operators';
import {of, forkJoin} from 'rxjs';
import {COLORS} from '../../../colors';

@Component({
    selector: 'employees-widget',
    templateUrl: './employees-widget.html',
    styleUrls: ['./employees-widget.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesWidget {
    loading = true;
    hasData = false;

    colors = [COLORS.primary, COLORS.secondary];
    chartConfig;

    activeEmployees: number;
    femaleEmployees: number;
    maleEmployees: number;
    startDateThisYear: number;
    endDateThisYear: number;
    fullTimeEquivalents: number;

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService,
    ) {}

    ngOnInit() {
        this.getEmployeeCounts().subscribe(res => {
            const counts = res && res[0] || {};
            if (counts.employeeCount) {
                this.hasData = true;

                this.activeEmployees = counts.employeeCount;
                this.femaleEmployees = counts.female || 0;
                this.maleEmployees = counts.male || 0;
                this.fullTimeEquivalents = Math.round((counts.fullTimeEquivalents || 0));

                forkJoin([this.getStartDateThisYear(), this.getEndDateThisYear()]).subscribe(([start, end]) => {
                    this.startDateThisYear = start || 0;
                    this.endDateThisYear = end || 0;

                    this.chartConfig = this.getChartConfig();
                    this.loading = false;
                    this.cdr.markForCheck();
                });
            } else {
                this.hasData = false;
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    private getStartDateThisYear() {
        return this.dataService.get(
            '/api/statistics?model=Employment&select=min(StartDate),employeeID&having=year(min(StartDate)) eq activeyear()&wrap=false'
        ).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map(employments => employments?.length)
        );
    }

    private getEndDateThisYear() {
        return this.dataService.get(
            '/api/statistics?model=Employment&select=max(EndDate),employeeID,sum(casewhen(setornull(EndDate),1,0))&having=year(max(EndDate)) eq activeyear() and sum(casewhen(setornull(EndDate),1,0)) le 0&wrap=false'
        ).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            }),
            map(employments => employments?.length)
        );
    }

    private getEmployeeCounts() {
        const select = `count(ID) as employeeCount,divide(sum(WorkPercent),100) as fullTimeEquivalents,sum(casewhen(Employee.Sex eq 1,1,0)) as female,sum(casewhen(Employee.Sex eq 2,1,0)) as male`;
        const filter = `StartDate le getdate() and (setornull(EndDate) or EndDate ge getdate() )`;

        return this.dataService.get(`/api/statistics?model=Employment&expand=Employee&select=${select}&filter=${filter}&wrap=false`).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }

    private getChartConfig() {
        return {
            type: 'pie',
            data: {
                labels: ['Kvinner', 'Menn'],
                datasets: [{
                    data: [this.femaleEmployees, this.maleEmployees],
                    backgroundColor: this.colors,
                    borderColor: '#fff',
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 72,
                legend: {display: false},
                tooltips: {enabled: false},
                elements: {arc: {borderWidth: 8}},
                animation: {animateScale: true},
                plugins: {
                    doughnutlabel: {
                        labels: [
                            {
                                text: this.fullTimeEquivalents,
                                color: '#2b2b2b',
                                font: {size: '17', weight: '500'}
                            },
                            {
                                text: 'årsverk',
                                color: '#2b2b2b',
                                font: {size: '15', weight: '400'}
                            }
                        ]
                    }
                },
            }
        };
    }

}
