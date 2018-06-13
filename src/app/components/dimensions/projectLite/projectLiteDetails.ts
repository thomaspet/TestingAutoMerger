import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Project} from '../../../unientities';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {IUniSaveAction} from '../../../../framework/save/save';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {ProjectService, ErrorService} from '../../../services/services';
import {UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'uni-project-lite-details',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [saveactions]="saveActions">
        </uni-toolbar>

        <section class="supplier-details application">
            <uni-form [config]="config$"
                    [fields]="fields$"
                    [model]="project$">
            </uni-form>
        </section>
    `
})

export class ProjectLiteDetails {
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public project$: BehaviorSubject<Project> = new BehaviorSubject(null);

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.save(completeEvent),
            main: true,
            disabled: false
        }
    ];

    public toolbarconfig: IToolbarConfig = {
        title: 'Prosjekt',
        navigation: {
            prev: () => this.previous(),
            next: () => this.next(),
            add: () => this.add()
        }
    };

    constructor(
        private projectService: ProjectService,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService
    ) {
    }

    public ngOnInit() {
        this.fields$.next(this.getComponentFields());

        this.route.params.subscribe(params => {
            const id = +params['id'];
            if (id) {
                this.projectService.Get(id)
                    .subscribe(
                        project => this.setProejct(project),
                        err => this.errorService.handle(err)
                    );
            } else {
                this.setProejct(new Project);
            }
        });
    }

    private setProejct(project: Project) {
        this.project$.next(project);
        const tabTitle = project.ID ? 'Prosjekt: ' + project.Name : 'Nytt prosjekt';

        this.tabService.addTab({
            url: '/dimensions/projectslite/' + project.ID || '0',
            name: tabTitle,
            active: true,
            moduleID: UniModules.Projects
        });

        this.toolbarconfig.title = project.ID ? project.Name : 'Nytt prosjekt';
        this.toolbarconfig.subheads = project.ID ? [{title: 'Prosjektnr. ' + project.ProjectNumber}] : [];
    }

    public next() {
        this.projectService.getNextID(this.project$.getValue().ID || 0)
            .subscribe(
                projectID => {
                    if (projectID) {
                        this.router.navigateByUrl('/dimensions/projectslite/' + projectID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere prosjekter etter denne');
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public previous() {
        this.projectService.getPreviousID(this.project$.getValue().ID || 999999)
            .subscribe(
                projectID => {
                    if (projectID) {
                        this.router.navigateByUrl('/dimensions/projectslite/' + projectID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere prosjekter før denne');
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public add() {
        this.router.navigateByUrl('/dimensions/projectslite/0');
    }

    private save(done: Function) {
        if (this.project$.getValue().ID) {
            this.projectService.Put(this.project$.getValue().ID, this.project$.getValue())
                .subscribe(project => {
                    this.router.navigateByUrl('/dimensions/projectslite/' + project.ID);
                    done('Prosjekt lagret');
                },
                err => {
                    if (err.status === 400) {
                        this.toastService.addToast(
                            'Warning',
                            ToastType.warn,
                            0,
                            'Prosjektnummer allerede brukt, venligst bruk et annet nummer');
                    } else {
                        this.errorService.handle(err);
                    }
                });
        } else {
            this.projectService.Post(this.project$.getValue())
                .subscribe(project => {
                    this.router.navigateByUrl('/dimensions/projectslite/' + project.ID);
                    done('Prosjekt lagret');
                },
                err => this.errorService.handle(err));
    }
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Prosjektnummer',
                Property: 'ProjectNumber',
                Placeholder: 'Autogenerert hvis blank'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Property: 'Name'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Prosjektleder',
                Property: 'ProjectLeadName'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse',
                Property: 'Description'
            }
        ];
    }
}
