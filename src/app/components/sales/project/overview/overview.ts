import { Component, ViewChild, ElementRef } from '@angular/core';
import { Project } from '../../../../unientities';
import * as Chart from 'chart.js';
import { ProjectService } from '../../../../services/services';

@Component({
    selector: 'project-overview',
    templateUrl: './overview.html'
}) 

export class ProjectOverview {

    @ViewChild('chartElement1')
    private chartElement1: ElementRef;

    @ViewChild('chartElement2')
    private chartElement2: ElementRef;

    private project: Project;
    private chart = {
        type: 'bar',
        data: {
            labels: ["Mars", "April", "Mai", "Juni", "Juli", "August"],
            datasets: [{
                label: 'Loggede timer',
                data: [120, 125, 143, 118, 116, 125],
                backgroundColor: '#7293cb',
                borderColor: '#fff',
                borderWidth: 1
            }, {
                label: 'Fakturerte timer',
                data: [120, 120, 140, 110, 100, 105],
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

    constructor(private projectService: ProjectService) {}

    public ngOnInit() {
        this.projectService.currentProject.subscribe(project => this.project = project);
    }

    public ngAfterViewInit() {
        this.drawChart();
    }

    private drawChart() {
        let element = this.chartElement1.nativeElement;
        let element2 = this.chartElement2.nativeElement;
        element2.style.maxWidth = '300px';
        let chart = new Chart(<any>element, this.chart);
        let chart2 = new Chart(<any>element2, this.chart2);
    }
}