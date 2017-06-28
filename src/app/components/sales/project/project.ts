import { Component } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { IUniTabsRoute } from '../../layout/uniTabs/uniTabs';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { ProjectService, ErrorService } from '../../../services/services';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '../../../../framework/ui/unitable/index';
import { IToolbarConfig } from '../../common/toolbar/toolbar';
import { IUniSaveAction } from '../../../../framework/save/save';

@Component({
    selector: 'uni-project',
    templateUrl: './project.html'
})

export class Project {


    private childRoutes: IUniTabsRoute[];
    private projectFilterString: string = '';
    private activeProjectID: any = '21323';
    private activeChildRoute: string = '';

    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    private projectList;

    private toolbarconfig: IToolbarConfig = {
        title: '',
        navigation: {
            add: this.newProject.bind(this)
        }
    };

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.saveProject(completeEvent),
            main: true,
            disabled: false
        }
    ];

    constructor(
        private tabService: TabService,
        private projectService: ProjectService,
        private errorService: ErrorService,
        private router: Router) {

        this.tabService.addTab({
            name: 'Prosjekt',
            url: '/sales/project/overview',
            moduleID: UniModules.Projects,
            active: true
        });
        

        this.childRoutes = [
            { name: 'Oversikt', path: 'overview'},
            { name: 'Oppgaver', path: 'tasks'},
            { name: 'Budsjett', path: 'budget' },
            { name: 'Ordre', path: 'orders' },
            { name: 'Rapport', path: 'reports' },
            { name: 'Nøkkeltall', path: 'kpi' },
            { name: 'Tidslinje', path: 'timeline' },
            { name: 'Redigering', path: 'editmode' }
        ];
        this.setUpTable();
    }

    private newProject() {
        this.projectService.setNew();
        this.toolbarconfig.title = 'Nytt prosjekt';
        this.router.navigateByUrl('/sales/project/editmode');
    }

    private setUpTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            return this.projectService.GetAllByUrlSearchParams(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        this.tableConfig = new UniTableConfig(false, true, 15)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('ProjectNumber', 'Nummer', UniTableColumnType.Text)
                    .setFilterOperator('contains').setWidth('30%'),
                new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
                    .setFilterOperator('contains')
            ]);
    }

    private onRowSelected(event: any) {
        this.toolbarconfig.title = event.rowModel.Name;
        this.projectService.currentProject.next(event.rowModel);
        this.activeProjectID = event.rowModel.ID;
    }

    public saveProject(done: Function) {
        if (this.projectService.currentProject.getValue().ID) {
            this.projectService.Put(this.projectService.currentProject.getValue().ID, this.projectService.currentProject.getValue())
                .subscribe(
                updatedProject => {
                    //this.router.navigateByUrl('/dimensions/project/' + updatedProject.ID);
                    this.projectService.currentProject.next(updatedProject);
                    done('Prosjekt lagret');
                },
                err => {
                    if (err.status === 400) {
                        //this.toastService.addToast('Warning', ToastType.warn, 0, 'Prosjekt nummer allerede brukt, venligst bruk et annet nummer');
                    } else {
                        this.errorService.handle(err);
                    }
                });
        } else {
            this.projectService.Post(this.projectService.currentProject.getValue())
                .subscribe(
                newProject => {
                    //this.router.navigateByUrl('/dimensions/project/' + newProject.ID);
                    this.projectService.currentProject.next(newProject);
                    done('Prosjekt lagret');
                },
                err => this.errorService.handle(err));
        }
    }
}