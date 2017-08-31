import {Component, ViewChild} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import {IUniTabsRoute} from '../../layout/uniTabs/uniTabs';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ProjectService, ErrorService} from '../../../services/services';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';

declare var _;

@Component({
    selector: 'uni-project',
    templateUrl: './project.html'
})

export class Project {
    @ViewChild(UniTable)
    private table: UniTable;

    private childRoutes: IUniTabsRoute[];
    private activeProjectID: any = '';
    private currentPage: number = 1;
    private isStart: boolean = true;


    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    private toolbarconfig: IToolbarConfig = {
        title: '',
        navigation: {
            add: this.newProject.bind(this)
        }
    };

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => setTimeout(this.saveProject(completeEvent)),
            main: true,
            disabled: false
        }
    ];

    private commentsConfig: any;

    constructor(
        private tabService: TabService,
        private projectService: ProjectService,
        private errorService: ErrorService,
        private router: Router,
        private route: ActivatedRoute) {

        this.tabService.addTab({
            name: 'Prosjekt',
            url: '/sales/project/overview',
            moduleID: UniModules.Projects,
            active: true
        });

        this.childRoutes = [
            { name: 'Oversikt', path: 'overview' },
            { name: 'Oppgaver', path: 'tasks' },
            { name: 'Faktura', path: 'invoices' },
            { name: 'Ordre', path: 'orders' },
            { name: 'Tilbud', path: 'quotes' },
            { name: 'Timer', path: 'hours' },
            { name: 'Inng.faktura', path: 'supplierinvoices'},
            { name: 'Dokumenter', path: 'documents' },
            // { name: 'Budsjett', path: 'budget' },     // TODO: uncomment when available
            // { name: 'Ordre', path: 'orders' },        // TODO: uncomment when available
            // { name: 'Rapport', path: 'reports' },     // TODO: uncomment when available
            // { name: 'Nøkkeltall', path: 'kpi' },      // TODO: uncomment when available
            // { name: 'Tidslinje', path: 'timeline' },  // TODO: uncomment when available
            { name: 'Redigering', path: 'editmode' }
        ];
        this.setUpTable();

        this.route.queryParams.subscribe((params) => {
            if (params && +params['projectID']) {
                this.activeProjectID = +params['projectID'];
                this.projectService
                    .Get(this.activeProjectID, ['ProjectTasks.ProjectTaskSchedules', 'ProjectResources'])
                    .subscribe(project => {
                        this.toolbarconfig.title = project.Name;
                        this.projectService.currentProject.next(project);
                    }, error => this.newProject());
            };

            if (params && params['page']) {
                if (this.table) {
                    if (this.currentPage !== +params['page']) {
                        this.table.goToPage(+params['page']);
                    } else {
                        this.markSelectedProject();
                    }
                }
                this.currentPage = +params['page'];
            }
        });
    }

    public onTableReady() {
        if (this.currentPage > 1 && this.isStart) {
            this.table.goToPage(this.currentPage);
            this.isStart = false;
            return;
        }

        if (!this.activeProjectID) {
            if (this.table.getRowCount() === 0) {
                this.newProject();
            } else {
                let current = this.projectService.currentProject.getValue();
                this.table.focusRow(current && current['_originalIndex'] ? current['_originalIndex'] : 0);
            }
        } else {
            this.markSelectedProject();
        }
    }

    public onPageChange(page) {
        this.currentPage = page;
        this.setQueryParamAndNavigate(this.activeProjectID);
    }

    private newProject() {
        this.projectService.setNew();
        this.toolbarconfig.title = 'Nytt prosjekt';
        this.router.navigateByUrl('/sales/project/editmode?projectID=0');
    }

    private setUpTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            urlParams.set('expand', 'ProjectTasks.ProjectTaskSchedules,ProjectResources');

            return this.projectService.GetAllByUrlSearchParams(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        this.tableConfig = new UniTableConfig('sales.project.projectList', false, true, 15)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('ProjectNumber', 'Nummer', UniTableColumnType.Text)
                    .setFilterOperator('contains').setWidth('30%'),
                new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
                    .setFilterOperator('contains')
            ]);
    }

    private markSelectedProject() {
        let projects = this.table.getTableData();
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].ID === this.activeProjectID) {
                this.table.focusRow(i);
                break;
            }
        }
    }

    public onRowSelected(event: any) {
        this.projectService.currentProject.next(event.rowModel);
        this.activeProjectID = event.rowModel.ID;

        this.commentsConfig = {
            entityType: 'Project',
            entityID: this.activeProjectID
        };
        this.setQueryParamAndNavigate(this.activeProjectID);
    };

    public setQueryParamAndNavigate(id: number) {
        // Gets URL from current URL without queryparams
        let url = this.router.url.split('?')[0];

        // Update the tabURL with new before routing
        this.tabService.currentActiveTab.url = url + '?projectID=' + id
            + '&page=' + this.currentPage;

        // Route to new URL with QueryParams
        this.router.navigate([url], {
            queryParams: {
                projectID: id,
                page: this.currentPage
            },
            skipLocationChange: false
        });
    }

    public saveProject(done: Function) {
        const project = this.projectService.currentProject.getValue();
        let source = (project.ID > 0)
            ? this.projectService.Put(project.ID, project)
            : this.projectService.Post(project);

        source.subscribe(
            (project) => {
                this.table.refreshTableData();
                done('Lagring fullført');
            },
            err => {
                this.errorService.handle(err);
                done('Lagring feilet');
            }
        );
    }
}
