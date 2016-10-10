import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ProjectService} from '../../../../../services/services';
import {FieldType, Project} from '../../../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../../framework/uniform';
import {TabService} from '../../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';

@Component({
    selector: 'Project-dimensions-details',
    templateUrl: 'app/components/common/dimensions/project/details/projectDetails.html'
})
export class ProjectDetails implements OnInit {
    public config: any = {};
    public fields: UniFieldLayout[] = [];
    private project: Project;

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.save(completeEvent),
            main: true,
            disabled: false
        }
    ];

    private errorHandler(err: Error) {
        console.log('Error in ProjectDetails:', err);
        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ett problem oppstod, forsøk igjen senere');
    }

    constructor(private projectService: ProjectService,
                private router: Router,
                private route: ActivatedRoute,
                private tabService: TabService,
                private toastService: ToastService) {
    }

    public ngOnInit() {
        this.fields = this.getComponentFields();

        this.route.params.subscribe(params => {
            const projectID = +params['id'];
            if (projectID) {
                this.projectService.Get(projectID)
                    .subscribe(
                        project => this.setProject(project),
                        err => this.errorHandler(err)
                    );
            } else {
                this.setProject(new Project);
            }
        });
    }

    private setProject(project: Project) {
        this.project = project;
        const tabTitle = this.project.ID ? 'Prosjekt ' + this.project.Name : 'Prosjekt (nytt)';
        const ID = this.project.ID ? this.project.ID : 'new';
        this.tabService.addTab({url: '/dimensions/project/' + ID, name: tabTitle, active: true, moduleID: 22});
    }

    public next() {
        this.projectService.getNextID(this.project.ID || 0)
            .subscribe(
                projectID => {
                    if (projectID) {
                        this.router.navigateByUrl('/dimensions/project/' + projectID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere prosjekt etter denne');
                    }
                },
                err => this.errorHandler(err)
            );
    }

    public previous() {
        this.projectService.getPreviousID(this.project.ID || 999999)
            .subscribe(
                projectID => {
                    if (projectID) {
                        this.router.navigateByUrl('/dimensions/project/' + projectID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere prosjekt før denne');
                    }
                },
                err => this.errorHandler(err)
            );
    }

    public add() {
        this.router.navigateByUrl('/dimensions/project/new');
    }

    private save(done: Function) {
        if (this.project.ID) {
            this.projectService.Put(this.project.ID, this.project)
                .subscribe(
                    updatedProject => {
                        this.router.navigateByUrl('/dimensions/project/' + updatedProject.ID);
                        done('Prosjekt lagret');
                    },
                    err => {
                        if (err.status === 400) {
                            this.toastService.addToast('Warning', ToastType.warn, 0, 'Prosjekt nummer allerede brukt, venligst bruk et annet nummer');
                        } else {
                            this.errorHandler(err);
                        }
                    });
        } else {
            this.projectService.Post(this.project)
                .subscribe(
                    newProject => {
                        this.router.navigateByUrl('/dimensions/project/' + newProject.ID);
                        done('Prosjekt lagret');
                    },
                    err => this.errorHandler(err));
        }
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Prosjektnummer',
                Property: 'ProjectNumber',
                Placeholder: 'Autogenerert hvis blank',

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
