import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Department} from '../../../../../unientities';
import {FieldType} from 'uniform-ng2/main';
import {IUniSaveAction} from '../../../../../../framework/save/save';
import {TabService, UniModules} from '../../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';
import {DepartmentService, ErrorService} from '../../../../../services/services';
import {UniFieldLayout} from 'uniform-ng2/main';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IToolbarConfig} from './../../../../common/toolbar/toolbar';

@Component({
    selector: 'department-dimensions-details',
    templateUrl: './departmentDetails.html'
})
export class DepartmentDetails implements OnInit {
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private department$: BehaviorSubject<Department> = new BehaviorSubject(null);

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.save(completeEvent),
            main: true,
            disabled: false
        }
    ];

    private toolbarconfig: IToolbarConfig = {
        title: 'Prosjekt',
        navigation: {
            prev: () => this.previous(),
            next: () => this.next(),
            add: () => this.add()
        }
    };

    constructor(
        private departmentService: DepartmentService,
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
            const departmentID = +params['id'];
            if (departmentID) {
                this.departmentService.Get(departmentID)
                    .subscribe(
                        department => this.setDepartment(department),
                        err => this.errorService.handle(err)
                    );
            } else {
                this.setDepartment(new Department);
            }
        });
    }

    private setDepartment(department: Department) {
        this.department$.next(department);
        const tabTitle = department.ID ? 'Avdeling ' + department.Name : 'Avdeling (ny)';
        const ID = department.ID ? department.ID : 'new';
        this.tabService.addTab({url: '/dimensions/department/' + ID, name: tabTitle, active: true, moduleID: UniModules.Departments});

        this.toolbarconfig.title = department.ID ? department.Name : 'Ny avdeling';
        this.toolbarconfig.subheads = department.ID ? [{title: 'Avdelingsnr. ' + department.DepartmentNumber}] : [];
    }

    public next() {
        this.departmentService.getNextID(this.department$.getValue().ID || 0)
            .subscribe(
                departmentID => {
                    if (departmentID) {
                        this.router.navigateByUrl('/dimensions/department/' + departmentID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere avdelinger etter denne');
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public previous() {
        this.departmentService.getPreviousID(this.department$.getValue().ID || 999999)
            .subscribe(
                departmentID => {
                    if (departmentID) {
                        this.router.navigateByUrl('/dimensions/department/' + departmentID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere avdelinger før denne');
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    public add() {
        this.router.navigateByUrl('/dimensions/department/new');
    }

    private save(done: Function) {
        if (this.department$.getValue().ID) {
            this.departmentService.Put(this.department$.getValue().ID, this.department$.getValue())
                .subscribe(
                    updatedDepartment => {
                        this.router.navigateByUrl('/dimensions/department/' + updatedDepartment.ID);
                        done('Avdeling lagret');
                    },
                    err => {
                        if (err.status === 400) {
                            this.toastService.addToast('Warning', ToastType.warn, 0, 'Avdelingsnummer allerede brukt, venligst bruk et annet nummer');
                        } else {
                            this.errorService.handle(err);
                        }
                    });
        } else {
            this.departmentService.Post(this.department$.getValue())
                .subscribe(
                    newDepartment => {
                        this.router.navigateByUrl('/dimensions/department/' + newDepartment.ID);
                        done('Avdeling lagret');
                    },
                    err => this.errorService.handle(err));
        }
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Avdelingsnummer',
                Property: 'DepartmentNumber',
                Placeholder: 'Autogenerert hvis blank'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Property: 'Name'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Avdelingsleder',
                Property: 'DepartmentManagerName'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse',
                Property: 'Description'
            }
        ];
    }
}
