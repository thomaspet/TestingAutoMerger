import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {Project as ProjectModel} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {NavbarLinkService} from '../../layout/navbar/navbar-link-service';
import {
    ProjectService,
    ErrorService,
    UserService,
    PageStateService
} from '../../../services/services';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {IToolbarConfig, ICommentsConfig} from '../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IStatus, STATUSTRACK_STATES} from '../../common/toolbar/statustrack';
import {IUniTab} from '@uni-framework/uni-tabs';
import PerfectScrollbar from 'perfect-scrollbar';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {AuthService} from '@app/authService';
declare var _;

@Component({
    selector: 'uni-project',
    templateUrl: './project.html'
})

export class Project {
    onDestroy$ = new Subject();
    childRoutes: IUniTab[] = [];
    activeProjectID: number;
    currentUser: { DisplayName: string, Email: string, GlobalIdentity: string, ID: number };
    filters: IUniTab[] = [
        { name: 'Alle', value: '' },
        { name: 'Registrerte', value: '( statuscode eq 42201 )' },
        { name: 'Tilbudsfase', value: '( statuscode eq 42202 )' },
        { name: 'Aktive', value: '( statuscode eq 42203 )' },
        { name: 'Fullførte', value: '( statuscode eq 42204 )' },
        { name: 'Avbrutte', value: '( statuscode eq 42205 )' },
        { name: 'Mine', value: '' },  // initFilters function expects this to be the last filter!
    ];

    currentFilter = this.filters[0];
    scrollbar: PerfectScrollbar;
    activeIndex: number = 0;

    allProjects: ProjectModel[] = [];
    filteredProjects: ProjectModel[] = [];

    projectSearchFilterString: string = '';
    searchControl: FormControl = new FormControl('');
    commentsConfig: ICommentsConfig;
    toolbarconfig: IToolbarConfig = {
        title: '',
        hideBreadcrumbs: true,
        navigation: {
            add: this.newProject.bind(this)
        }
    };

    saveActions: IUniSaveAction[];
    rootActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => setTimeout(() => this.saveProject(completeEvent)),
            main: true,
            disabled: false
        }
    ];

    constructor(
        private authService: AuthService,
        private tabService: TabService,
        public projectService: ProjectService,
        private errorService: ErrorService,
        private router: Router,
        private route: ActivatedRoute,
        private toast: ToastService,
        private user: UserService,
        private modalService: UniModalService,
        private navbarLinkService: NavbarLinkService,
        private pageStateService: PageStateService
    ) {

        this.init();
        this.searchControl.valueChanges
            .debounceTime(150)
            .subscribe(query => {
                this.filteredProjects = this.getFilteredProjects();
                setTimeout(() => {
                    this.scrollbar.update();
                });
            });
    }

    ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#scrolling-viewport');
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();

        if (this.scrollbar) {
            this.scrollbar.destroy();
        }
    }

    private init() {
        this.projectService.resetBools();
        this.tabService.addTab({
            name: 'Prosjekt',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Projects,
            active: true
        });

        this.childRoutes = [
            { name: 'Oversikt', path: 'overview'},
            { name: 'Oppgaver', path: 'tasks' }
        ];

        // Add tabs that the user has access to, and set some booleans used later when fetching data..
        const user = this.authService.currentUser;

        if (this.authService.canActivateRoute(user, '/sales/invoices')) {
            this.childRoutes.push( { name: 'Faktura', path: 'invoices' } );
        }

        if (this.authService.canActivateRoute(user, '/sales/orders')) {
            this.childRoutes.push( { name: 'Ordre', path: 'orders' } );
            this.projectService.hasOrderModule = true;
        }

        if (this.authService.canActivateRoute(user, '/sales/quotes')) {
            this.childRoutes.push( { name: 'Tilbud', path: 'quotes' } );
        }

        if (this.authService.canActivateRoute(user, '/accounting/journalentry')) {
            this.projectService.hasJournalEntryLineModule = true;
        }

        if (this.authService.canActivateRoute(user, '/accounting/bills')) {
            this.projectService.hasSupplierInvoiceModule = true;
            this.childRoutes.push( { name: 'Leverandørfaktura', path: 'supplierinvoices'} );
        }

        this.childRoutes = this.childRoutes.concat([], ...[
            { name: 'Timer', path: 'hours' },
            { name: 'Dokumenter', path: 'documents' },
            { name: 'Redigering', path: 'editmode' }
        ]);

        this.getAllProjects().subscribe((projects) => {
            this.allProjects = projects;
            this.filteredProjects = this.getFilteredProjects();

            this.user.getCurrentUser().subscribe( user => {
                this.currentUser = user;
                this.initFilters(user);
            });

            this.initDefaultActions();

            this.route.queryParams.subscribe((params) => {
                if (params && +params['projectID']) {
                    this.activeProjectID = +params['projectID'];
                    this.projectService
                        .Get(this.activeProjectID, ['ProjectTasks.ProjectTaskSchedules', 'ProjectResources,WorkPlaceAddress'], true)
                        .subscribe(project => {
                            this.toolbarconfig.title = project.ProjectNumber + ' - ' + project.Name;
                            this.onProjectSelect(project);
                            this.updateToolbar();
                        }, error => this.newProject());
                } else if (params && +params['projectID'] === 0) {
                    this.activeProjectID = 0;
                    this.newProject();
                } else {
                    this.onProjectSelect(this.filteredProjects[0]);
                }
            });
            this.updateToolbar();
        });

    }

    private getFilteredProjects() {
        const filtered = this.allProjects.filter((project: ProjectModel) => {
            const projectName = (project.Name || '').toLowerCase();
            const projectNumber = (project.ProjectNumber || '').toLowerCase();
            const filterString = (this.projectSearchFilterString || '').toLowerCase();

            return projectName.includes(filterString) || projectNumber.includes(filterString);
        });

        setTimeout(() => {
            if (this.scrollbar) {
                this.scrollbar.update();
            }
        }, 50);

        return filtered;
    }

    private updateToolbar() {
        this.projectService.currentProject.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe( p => {
            this.toolbarconfig.statustrack = this.buildStatusTrack(p);
            this.projectService.toolbarConfig.next(this.toolbarconfig);
            this.projectService.saveActions.next(this.saveActions);
        });
    }

    public childRouteChange(tab) {
        setTimeout(() => {
            this.tabService.currentActiveTab.url = this.pageStateService.getUrl();
        }, 500);
    }

    private buildStatusTrack(current: ProjectModel): IStatus[] {
        const track: IStatus[] = [];
        const defaultStatus = this.projectService.statusTypes[0].Code;
        const activeStatus = current ? current.StatusCode || defaultStatus : defaultStatus;
        this.projectService.statusTypes.forEach( status => {
            let _state: STATUSTRACK_STATES;
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

    private newProject() {
        this.projectService.setNew();
        this.toolbarconfig.title = 'Nytt prosjekt';
        this.router.navigateByUrl('/dimensions/projects/editmode?projectID=0');
        this.updateToolbar();
    }

    private getAllProjects() {
        return this.projectService.GetAll(
            this.currentFilter.value ? ('&filter=' + this.currentFilter.value) : '',
            ['ProjectTasks.ProjectTaskSchedules', 'ProjectResources,WorkPlaceAddress']
        );
    }

    public onProjectSelect(project: ProjectModel) {
        if (!project) {
            this.newProject();
            return;
        }
        this.projectService.currentProject.next(project);
        this.activeProjectID = project.ID;
        this.loadActionsFromEntity(project);
        this.commentsConfig = {
            entityType: 'Project',
            entityID: this.activeProjectID
        };
        this.setQueryParamAndNavigate(this.activeProjectID);
    }

    public setQueryParamAndNavigate(id: number) {
        // Gets URL from current URL without queryparams
        const url = this.router.url.split('?')[0];

        // Update the tabURL with new before routing
        this.tabService.currentActiveTab.url = url + '?projectID=' + id;

        // Route to new URL with QueryParams
        this.router.navigate([url], {
            queryParams: {
                projectID: id
            },
            skipLocationChange: false
        });
    }

    public saveProject(done: Function) {
        const project = this.projectService.currentProject.getValue();
        if (project.WorkPlaceAddress && !project.WorkPlaceAddress.ID) {
            project.WorkPlaceAddress._createguid = this.projectService.getNewGuid();
        }

        if (project.ProjectResources) {
            project.ProjectResources = project.ProjectResources.filter(r => !r['_isEmpty']);
        }

        const source = (project.ID > 0)
            ? this.projectService.Put(project.ID, project)
            : this.projectService.Post(project);

        source.finally( () => { if (done) { done(); } } )
            .subscribe((res: any) => {
                this.activeProjectID = res.ID;

                // Update the project in the list!
                const indexOfChanged = this.allProjects.findIndex(p => p.ID === res.ID);
                this.allProjects[indexOfChanged] = res;
                this.filteredProjects = this.getFilteredProjects();
                this.projectService.currentProject.next(res);

                done('Lagring fullført');
            },
            err => this.errorService.handle(err)
        );
    }

    public onActiveFilterChange(filter: any) {
        this.currentFilter = filter;
        this.getAllProjects().subscribe((projects) => {
            this.allProjects = projects;
            this.filteredProjects = this.getFilteredProjects();
        });
    }

    private loadActionsFromEntity(project: any) {
        const it: any = project;
        if (it && it._links) {
            const list: IUniSaveAction[] = [];
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

        this.projectService.PostAction(this.activeProjectID, key).subscribe((result) => {
            this.getAllProjects().subscribe((projects) => {
                this.allProjects = projects;
                this.filteredProjects = this.getFilteredProjects();
                const indexOfChanged = this.allProjects.findIndex(p => p.ID === this.activeProjectID);
                this.projectService.currentProject.next(this.allProjects[indexOfChanged]);
                done();
            });
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
        const labels = {
            InitiateProject: 'Sett i tilbudsfase',
            StartProject: 'Sett som pågående',
            CompleteProject: 'Avslutt prosjekt',
            DiscardProject: 'Deaktiver prosjekt'
        };
        return labels[name] || name;
    }

    private addActions(linkNode: any, list: any[], mainFirst = false, priorities?: string[], filters?: string[]) {
        let ix = 0, setAsMain = false, isFiltered = false, key: string;
        let ixFound = -1;
        if (!linkNode) { return; }

        for (key in linkNode) {
            if (linkNode.hasOwnProperty(key)) {

                isFiltered = filters ? (filters.findIndex(x => x === key) >= 0) : false;
                if (!isFiltered) {
                    ix++;
                    setAsMain = mainFirst ? ix <= 1 : false;
                    // prioritized main?
                    if (priorities) {
                        const ixPri = priorities.findIndex(x => x === key);
                        if (ixPri >= 0 && (ixPri < ixFound || ixFound < 0)) {
                            ixFound = ixPri;
                            setAsMain = true;
                        }
                    }
                    // reset main?
                    if (setAsMain) { list.forEach(x => x.main = false); }
                    const itemKey = key;
                    const label = this.mapActionLabel(itemKey);
                    const href = linkNode[itemKey].href;
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
