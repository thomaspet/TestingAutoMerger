import { Component, ViewChild, ElementRef } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Project, Customer } from '../../../../unientities';
import * as Chart from 'chart.js';
import { ProjectService, CustomerService } from '../../../../services/services';

export interface myProject extends Project {
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

    private MONTHS = [
        'Januar', 'Februar', 'Mars', 'April',
        'Mai', 'Juni', 'Juli', 'August',
        'September', 'Oktober', 'November', 'Desember'
    ];
    private MONTHS_SHORT = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
    ];
    private QUARTERS = [
        '1. Kvartal',
        '2. Kvartal',
        '3. Kvartal',
        '4. Kvartal'
    ];
    private QUARTERS_SHORT = ['Q1', 'Q2', 'Q3', 'Q4'];

    private myChart: any;
    private myChart2: any;
    private projectHoursTotal: number;
    private projectHoursInvoiced: number;
    private customer: Customer;
    private customerName: string;
    private monthAndYearDataInBarChart: IMonthAndYear[] = [];

    private project: myProject;
    private chart = {
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
    private chart2 = {
        type: 'pie',
        data: {
            labels: ["% ferdigstilt", '% gjennstående'],
            datasets: [{
                label: '% ferdig',
                data: [84, 16],
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
        private router: Router) { }

    public ngOnInit() {
        this.projectService.currentProject.subscribe((project: any) => { this.projectChanged(project); });
    }

    public ngAfterViewInit() {
        this.getDataAndDrawChart();
        this.chartElement1.nativeElement.onclick = (event) => {
            let temp = this.myChart.getElementAtEvent(event);
            this.router.navigate(['/sales/project/hours'], {
                queryParams: {
                    projectID: this.projectService.currentProject.getValue().ID,
                    month: this.monthAndYearDataInBarChart[temp[0]._index].month,
                    year: this.monthAndYearDataInBarChart[temp[0]._index].year
                }
            });
        }
    }

    private navigateToEditmode() {
        this.router.navigateByUrl('/sales/project/editmode');
    }

    private projectChanged(project: myProject) {
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
                })
            } else {
                this.customerName = '';
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
                })

                this.projectHoursTotal /= 60;
                this.projectHoursInvoiced /= 60;
                this.drawChart();
            })
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
