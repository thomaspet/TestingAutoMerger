import {Component, ViewChild} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import {Project as ProjectModel} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ProjectService, ErrorService, UserService} from '../../../services/services';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {trimLength} from '../../common/utils/utils';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';
import {IToolbarConfig, ICommentsConfig} from '../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IStatus, STATUSTRACK_STATES} from '../../common/toolbar/statustrack';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';
declare var _;

@Component({
    selector: 'uni-project',
    templateUrl: './project.html'
})

export class Project {
    @ViewChild(UniTable)
    private table: UniTable;
    public childRoutes: IUniTab[];
    private activeProjectID: any = '';
    public currentPage: number = 1;
    private isStart: boolean = true;
    public currentUser: { DisplayName: string, Email: string, GlobalIdentity: string, ID: number };

    public activeFilterIndex: number = 0;
    public filters: IUniTab[] = [
        { name: 'Alle' },
        { name: 'Aktive', value: '( statuscode le 42204 )' },
        { name: 'Mine' },  // initFilters function expects this to be the last filter!
    ];

    public tableConfig: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;

    public commentsConfig: ICommentsConfig;
    public toolbarconfig: IToolbarConfig = {
        title: '',
        hideBreadcrumbs: true,
        navigation: {
            add: this.newProject.bind(this)
        }
    };

    public saveActions: IUniSaveAction[];
    private rootActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => setTimeout(this.saveProject(completeEvent)),
            main: true,
            disabled: false
        }
    ];

    constructor(
        private tabService: TabService,
        public projectService: ProjectService,
        private errorService: ErrorService,
        private router: Router,
        private route: ActivatedRoute,
        private toast: ToastService,
        private user: UserService,
        private modalService: UniModalService) {

        this.init();
    }

    private init() {

        this.tabService.addTab({
            name: 'Prosjekt',
            url: '/dimensions/projects/overview',
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
            { name: 'Inng. faktura', path: 'supplierinvoices'},
            { name: 'Dokumenter', path: 'documents' },
            // { name: 'Budsjett', path: 'budget' },     // TODO: uncomment when available
            // { name: 'Ordre', path: 'orders' },        // TODO: uncomment when available
            // { name: 'Rapport', path: 'reports' },     // TODO: uncomment when available
            // { name: 'Nøkkeltall', path: 'kpi' },      // TODO: uncomment when available
            // { name: 'Tidslinje', path: 'timeline' },  // TODO: uncomment when available
            { name: 'Redigering', path: 'editmode' }
        ];
        this.setUpTable();

        this.user.getCurrentUser().subscribe( user => {
            this.currentUser = user;
            this.initFilters(user);
        });

        this.initDefaultActions();

        this.route.queryParams.subscribe((params) => {
            if (params && +params['projectID']) {
                this.activeProjectID = +params['projectID'];
                this.projectService
                    .Get(this.activeProjectID, ['ProjectTasks.ProjectTaskSchedules', 'ProjectResources'])
                    .subscribe(project => {
                        const projectNumber = project.ProjectNumber + ' - ' || '';
                        this.toolbarconfig.title = projectNumber + project.Name;

                        this.projectService.currentProject.next(project);
                        this.updateToolbar();
                    }, error => this.newProject());
            }

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

        this.updateToolbar();
    }

    private updateToolbar() {
        this.projectService.currentProject.subscribe( p => {
            this.toolbarconfig.statustrack = this.buildStatusTrack(p);
            this.projectService.toolbarConfig.next(this.toolbarconfig);
            this.projectService.saveActions.next(this.saveActions);
        });
    }

    private buildStatusTrack(current: ProjectModel): IStatus[] {
        var track: IStatus[] = [];
        var defaultStatus = this.projectService.statusTypes[0].Code;
        var activeStatus = current ? current.StatusCode || defaultStatus : defaultStatus;
        this.projectService.statusTypes.forEach( status => {
            var _state: STATUSTRACK_STATES;
            if (status.Code > activeStatus) {
                _state = STATUSTRACK_STATES.Future;
            } else if (status.Code < activeStatus) {
                _state = STATUSTRACK_STATES.Completed;
            } else if (status.Code === activeStatus) {
                _state = STATUSTRACK_STATES.Active;
            }
            if (status.isPrimary || status.Code === activeStatus) {
                track.push({
                    title: status.Text,
                    state: _state,
                    code: status.Code
                });
            }
        });
        return track;
    }

    private initDefaultActions() {
        this.saveActions = this.rootActions;
    }

    private initFilters(user: { GlobalIdentity: string }) {
        this.filters[this.filters.length - 1].value = `( StatusCode lt 42204 and ( CreatedBy eq '${user.GlobalIdentity}'`
            + ` or UpdatedBy eq '${user.GlobalIdentity}' ))`;
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
        this.router.navigateByUrl('/dimensions/projects/editmode?projectID=0');
        this.updateToolbar();
    }

    private setUpTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            urlParams.set('expand', 'ProjectTasks.ProjectTaskSchedules,ProjectResources');

            const activeFilter = this.filters[this.activeFilterIndex];
            return this.projectService.FindProjects(urlParams, activeFilter && activeFilter.value)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        this.tableConfig = new UniTableConfig('sales.project.projectList', false, true, 15)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('ProjectNumber', 'Nr.', UniTableColumnType.Text)
                    .setFilterOperator('contains').setWidth('4.5rem'),
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
        this.loadActionsFromEntity(event.rowModel);
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
        if (project.ProjectResources) {
            project.ProjectResources = project.ProjectResources.filter(r => !r['_isEmpty']);
        }

        const source = (project.ID > 0)
            ? this.projectService.Put(project.ID, project)
            : this.projectService.Post(project);

        source
            .finally( () => { if (done) { done(); } } )
            .subscribe(
            (result) => {
                this.activeProjectID = result.ID;
                this.table.refreshTableData();
                done('Lagring fullført');
            },
            err => this.errorService.handle(err)
        );
    }

    public onActiveFilterChange(index: number) {
        this.activeFilterIndex = index;
        this.table.refreshTableData();
    }

    private loadActionsFromEntity(project: Project) {
        var it: any = project;
        if (it && it._links) {
            var list: IUniSaveAction[] = [];
            this.rootActions.forEach(x => list.push(x));
            this.addActions(it._links.transitions, list, false);
            this.saveActions = list;
        } else {
            this.initDefaultActions();
        }
    }

    private handleAction(key: string, label: string, href: string,
                         done?: (value?: string) => void, confirmed?: boolean) {

        switch (key) {
            case 'DiscardProject':
            case 'CompleteProject':
                if (!confirmed) {
                    this.confirm(`<strong>${label}</strong><br/><br/>Ønsker du å fortsette?`, label)
                        .then( (choice: boolean) => {
                            if (choice) {
                                this.handleAction(key, label, href, done, true);
                            } else {
                                done();
                            }
                        });
                    return;
                }
        }

        this.projectService.PostAction(this.activeProjectID, key)
            .finally( () => {
                done();
            })
            .subscribe( result => {
                this.table.refreshTableData();
            });

    }

    private confirm(msg: string, header: string): Promise<boolean> {
        return new Promise<boolean>( (resolve, reject) => {
            this.modalService.confirm({
                header: header,
                message: msg
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    private mapActionLabel(name: string) {
        var labels = {
            InitiateProject: 'Sett i tilbudsfase',
            StartProject: 'Sett som pågående',
            CompleteProject: 'Avslutt prosjekt',
            DiscardProject: 'Slett prosjekt'
        };
        return labels[name] || name;
    }

    private addActions(linkNode: any, list: any[], mainFirst = false, priorities?: string[], filters?: string[]) {
        var ix = 0, setAsMain = false, isFiltered = false, key: string;
        var ixFound = -1;
        if (!linkNode) { return; }

        for (key in linkNode) {
            if (linkNode.hasOwnProperty(key)) {

                isFiltered = filters ? (filters.findIndex(x => x === key) >= 0) : false;
                if (!isFiltered) {
                    ix++;
                    setAsMain = mainFirst ? ix <= 1 : false;
                    // prioritized main?
                    if (priorities) {
                        let ixPri = priorities.findIndex(x => x === key);
                        if (ixPri >= 0 && (ixPri < ixFound || ixFound < 0)) {
                            ixFound = ixPri;
                            setAsMain = true;
                        }
                    }
                    // reset main?
                    if (setAsMain) { list.forEach(x => x.main = false); }
                    let itemKey = key;
                    let label = this.mapActionLabel(itemKey);
                    let href = linkNode[itemKey].href;
                    list.push({
                        label: label,
                        action: (done) => {
                            this.handleAction(itemKey, label, href, done);
                        },
                        main: setAsMain,
                        disabled: false
                    });
                }
            }
        }
    }

}
