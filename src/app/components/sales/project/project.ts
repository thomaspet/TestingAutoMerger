import { Component } from '@angular/core';
import { IUniTabsRoute } from '../../layout/uniTabs/uniTabs';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-project',
    templateUrl: './project.html'
})

export class Project {


    private childRoutes: IUniTabsRoute[];
    private projectFilterString: string = '';

    // TODO: Get actual projects
    private projectList = [
        { name: 'Titan', status: 'Aktivt' },
        { name: 'Project Hanks ', status: 'Aktivt' },
        { name: 'Kodiak', status: 'Avsluttet' },
        { name: 'Code Talkers  ', status: 'Aktivt' },
        { name: 'Project Blue Book ', status: 'Aktivt' },
        { name: 'X Lab  ', status: 'Avsluttet' },
        { name: 'Project 404 ', status: 'Avsluttet' },
        { name: 'Manhattan Project', status: 'Aktivt' },
        { name: 'Durango', status: 'Aktivt' },
        { name: 'Apollo', status: 'Avsluttet' },
        { name: 'Project X ', status: 'Avsluttet' },
        { name: 'The Graduate', status: 'Aktivt' }
    ]

    constructor(private tabService: TabService) {

        this.tabService.addTab({
            name: 'Prosjekt',
            url: '/sales/project/overview',
            moduleID: UniModules.Projects,
            active: true
        });
        

        this.childRoutes = [
            { name: 'Oversikt', path: 'overview' },
            { name: 'Oppgaver', path: 'tasks' },
            { name: 'Budsjett', path: 'budget' },
            { name: 'Ordre', path: 'orders' },
            { name: 'Rapport', path: 'reports' },
            { name: 'Nøkkeltall', path: 'kpi' },
            { name: 'Tidslinje', path: 'timeline' }
        ];
    }
}