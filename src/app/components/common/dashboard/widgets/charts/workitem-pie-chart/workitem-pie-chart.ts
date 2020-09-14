import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {DashboardDataService} from '../../../dashboard-data.service';
import {AuthService} from '@app/authService';
import {map, catchError} from 'rxjs/operators';
import {of} from 'rxjs';
import * as moment from 'moment';
import {theme} from 'src/themes/theme';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'workitem-pie-chart',
    templateUrl: './workitem-pie-chart.html',
    styleUrls: ['./workitem-pie-chart.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkItemPieChart {
    // Provided in the widget config
    options;

    viewMode: 'project' | 'worktype';

    periodFilters = this.getPeriodFilters();
    activeFilter = this.periodFilters[this.periodFilters.length - 1];

    hasData = false;
    loading = true;

    workRelationID: number;
    data;
    projectPercent: number;
    chartConfig;

    constructor(
        private dataService: DashboardDataService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        if (this.options?.viewMode) {
            this.viewMode = this.options.viewMode;

            this.getWorkRelation().subscribe(workRelation => {
                if (workRelation?.ID) {
                    this.workRelationID = workRelation.ID;
                    this.loadData();
                } else {
                    this.hasData = false;
                    this.loading = false;
                    this.cdr.markForCheck();
                }
            });
        }
    }

    setActiveFilter(filter) {
        this.activeFilter = filter;
        this.loadData();
    }

    private loadData() {
        const select = this.viewMode === 'project'
            ? 'Project.ID as ProjectID,Project.Name as Label'
            : 'WorkType.Name as Label';

        const expand = this.viewMode === 'project' ? 'Dimensions.Project' : 'WorkType';

        let endpoint = '/api/statistics?model=workitem&wrap=false'
            + `&select=sum(minutes) as Sum,${select}&expand=${expand}`
            + `&filter=( workrelationid eq ${this.workRelationID} )`;

        if (this.activeFilter.fromDate && this.activeFilter.toDate) {
            endpoint += ` and date ge '${this.activeFilter.fromDate}' and date le '${this.activeFilter.toDate}'`;
        }

        this.dataService.get(endpoint).subscribe(res => {
            this.hasData = res?.length > 0;

            if (this.hasData) {
                const data = cloneDeep(res).sort((a, b) => (b.Sum || 0) - (a.Sum || 0));

                if (this.viewMode === 'project') {
                    let sumHours = 0;
                    let sumHoursWithProject = 0;
                    data.forEach(item => {
                        sumHours += (item.Sum || 0);
                        if (item.ProjectID) {
                            sumHoursWithProject += (item.Sum || 0);
                        } else {
                            item.Label = 'Uten prosjekt';
                        }
                    });

                    this.projectPercent = (sumHoursWithProject / sumHours) * 100;
                }

                let rest = [];
                if (data.length > 6) {
                    rest = data.splice(5);
                }

                if (rest.length) {
                    data.push({
                        Label: 'Resterende',
                        Sum: rest.reduce((sum, item) => sum += (item.Sum || 0), 0)
                    });
                }

                this.data = data;
                this.chartConfig = this.getChartConfig();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    private getWorkRelation() {
        const userID = this.authService.currentUser.ID;
        return this.dataService.get(
            `/api/biz/workrelations?expand=worker&filter=worker.userid eq ${userID}&hateoas=false`
        ).pipe(
            map(res => res && res[0]),
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
                labels: this.data.map(item => item.Label),
                datasets: [{
                    data: this.data.map(item => {
                        const hours = (item.Sum || 0) / 60;
                        return parseFloat(hours.toFixed(2));
                    }),
                    backgroundColor: theme.widgets.pie_colors,
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

    private getPeriodFilters() {
        return [
            {
                label: 'Denne uken',
                fromDate: moment().startOf('week').format('YYYY-MM-DD'),
                toDate: moment().endOf('week').format('YYYY-MM-DD')
            },
            {
                label: 'Denne måneden',
                fromDate: moment().startOf('month').format('YYYY-MM-DD'),
                toDate: moment().endOf('month').format('YYYY-MM-DD')
            },
            {
                label: 'I år',
                fromDate: moment().startOf('year').format('YYYY-MM-DD'),
                toDate: moment().endOf('year').format('YYYY-MM-DD')
            },
            {
                label: 'Totalt',
                fromDate: null,
                toDate: null
            }
        ];
    }
}
