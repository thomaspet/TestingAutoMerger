import {Component, ViewChild, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Project, Customer, ProjectTask} from '../../../../unientities';
import {ProjectService, CustomerService, PageStateService} from '../../../../services/services';
import * as Chart from 'chart.js';
import * as moment from 'moment';

export interface IMyProject extends Project {
    ProjectCustomerID: number;
}

interface IMonthAndYear {
    month: number;
    year: number;
}

@Component({
    selector: 'project-overview',
    templateUrl: './overview.html'
})

export class ProjectOverview {

    @ViewChild('chartElement1')
    private chartElement1: ElementRef;

    @ViewChild('chartElement2')
    private chartElement2: ElementRef;

    private MONTHS: string[] = [
        'Januar', 'Februar', 'Mars', 'April',
        'Mai', 'Juni', 'Juli', 'August',
        'September', 'Oktober', 'November', 'Desember'
    ];
    public MONTHS_SHORT: string[] = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
    ];
    public QUARTERS: string[] = [
        '1. Kvartal',
        '2. Kvartal',
        '3. Kvartal',
        '4. Kvartal'
    ];
    public QUARTERS_SHORT: string[] = ['Q1', 'Q2', 'Q3', 'Q4'];

    private myChart: any;
    private myChart2: any;
    public projectHoursTotal: number;
    public projectHoursInvoiced: number;
    public projectExpectedResult: number;
    public currentResult: number;
    public remainingTasks: number;
    private customer: Customer;
    public customerName: string;
    private monthAndYearDataInBarChart: IMonthAndYear[] = [];

    public project: IMyProject;
    private chart: any = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Loggede timer',
                data: [],
                backgroundColor: '#7293cb',
                borderColor: '#fff',
                borderWidth: 1
            }, {
                label: 'Fakturerte timer',
                data: [],
                backgroundColor: '#e1974c',
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {}
    };
    private chart2: any = {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                label: '% ferdig',
                data: [],
                backgroundColor: ['#7293cb', '#e1974c'],
                borderColor: '#FFFFFF',
                borderWidth: 1
            }],
        },
        options: {
            cutoutPercentage: 60,
            legend: {
                position: 'bottom'
            },
        }
    };

    constructor(
        private projectService: ProjectService,
        private customerService: CustomerService,
        private pageStateService: PageStateService,
        private router: Router,
        private route: ActivatedRoute) {
    }

    public ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            if (!this.projectService.currentProject.getValue()) {
                if (params && params['projectID']) {
                    this.projectService.Get(
                        +params['projectID'],
                        ['ProjectTasks.ProjectTaskSchedules', 'ProjectResources'])
                    .subscribe((project: Project) => {
                        this.projectChanged(project);
                    });
                }
            } else {
                this.projectChanged(this.projectService.currentProject.getValue());
            }
        });
    }

    public ngAfterViewInit() {
        this.chartElement1.nativeElement.onclick = (event) => {
            if (!this.myChart || !event) { return; }
            let temp = this.myChart.getElementAtEvent(event);
            this.router.navigate(['/dimensions/projects/hours'], {
                queryParams: {
                    projectID: this.projectService.currentProject.getValue().ID,
                    page: this.pageStateService.getPageState().page || 1,
                    month: this.monthAndYearDataInBarChart[temp[0]._index].month,
                    year: this.monthAndYearDataInBarChart[temp[0]._index].year
                }
            });
        };
    }

    public navigateToEditmode() {
        this.router.navigateByUrl('/dimensions/projects/editmode');
    }

    private projectChanged(project: IMyProject) {
        if (project && project.ID) {
            this.project = project;
            this.getDataAndDrawChart();
        }
    }

    private getDataAndDrawChart() {
        if (this.project && this.project.ID) {

            if (this.project.ProjectCustomerID) {
                this.customerService.Get(this.project.ProjectCustomerID).subscribe((customer: Customer) => {
                    if (customer) {
                        this.customer = customer;
                        this.customerName = customer.Info.Name;
                    } else {
                        this.customerName = '';
                    }
                });
            } else {
                this.customerName = '';
            }

            this.remainingTasks = 0;
            this.projectExpectedResult = 0;
            this.currentResult = 0;
            this.chart2.data.datasets[0].data = [];
            this.chart2.data.labels = [];

            this.project.ProjectTasks.forEach((task: ProjectTask) => {
                if (moment(task.EndDate) > moment()) {
                    this.remainingTasks++;
                }
                this.projectExpectedResult += task.Total;
            });

            if (this.project.ProjectTasks.length) {
                let currentPercentCompleted = (
                    ((this.project.ProjectTasks.length - this.remainingTasks)
                    || this.project.ProjectTasks.length) / this.project.ProjectTasks.length
                ) * 100;
                let currentPercentRemaining = (this.remainingTasks / this.project.ProjectTasks.length) * 100;

                this.chart2.data.datasets[0].data.push(this.project.ProjectTasks.length - this.remainingTasks);
                this.chart2.data.labels.push(currentPercentCompleted + '% av oppgavene er ferdig');

                if (currentPercentRemaining) {
                    this.chart2.data.datasets[0].data.push(this.remainingTasks);
                    this.chart2.data.labels.push(currentPercentRemaining + '% gjennstår');
                }
            } else {
                this.chart2.data.datasets[0].data.push(0);
                this.chart2.data.labels.push('Ingen oppgaver på prosjekt');
            }

            this.projectService.getProjectHours(this.project.ID).subscribe((res) => {
                this.monthAndYearDataInBarChart = [];
                this.chart.data.labels = [];
                this.chart.data.datasets[0].data = [];
                this.chart.data.datasets[1].data = [];
                this.projectHoursTotal = 0;
                this.projectHoursInvoiced = 0;

                res.Data.forEach((data: any) => {
                    this.monthAndYearDataInBarChart.push({ month: data.mnd, year: data.year });
                    this.chart.data.labels.push(this.MONTHS[data.mnd - 1] + ' ' + data.year);
                    this.chart.data.datasets[0].data.push(data.summinutes / 60);
                    this.chart.data.datasets[1].data.push(data.WorkItemMinutesToOrder / 60);
                    this.projectHoursTotal += data.summinutes;
                    this.projectHoursInvoiced += data.WorkItemMinutesToOrder || 0;
                });

                this.projectHoursTotal /= 60;
                this.projectHoursInvoiced /= 60;
                this.drawChart();
            });
        }
    }

    private drawChart() {

        if (this.myChart) {
            this.myChart.destroy();
        }

        if (this.myChart2) {
            this.myChart2.destroy();
        }

        let element = this.chartElement1.nativeElement;
        let element2 = this.chartElement2.nativeElement;
        element2.style.maxWidth = '300px';
        this.myChart = new Chart(<any>element, this.chart);
        this.myChart2 = new Chart(<any>element2, this.chart2);
    }
}
