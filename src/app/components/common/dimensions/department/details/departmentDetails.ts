import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FieldType, Department} from '../../../../../unientities';
import {IUniSaveAction} from '../../../../../../framework/save/save';
import {TabService} from '../../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';
import {DepartmentService, ErrorService} from '../../../../../services/services';
import {UniFieldLayout} from 'uniform-ng2/main';

@Component({
    selector: 'department-dimensions-details',
    templateUrl: 'app/components/common/dimensions/department/details/departmentDetails.html'
})
export class DepartmentDetails implements OnInit {
    public config: any = {autofocus: true};
    public fields: any[] = [];
    private department: Department;

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.save(completeEvent),
            main: true,
            disabled: false
        }
    ];

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
        this.fields = this.getComponentFields();

        this.route.params.subscribe(params => {
            const departmentID = +params['id'];
            if (departmentID) {
                this.departmentService.Get(departmentID)
                    .subscribe(
                        department => this.setDepartment(department),
                        err => err => this.errorService.handle(err)
                    );
            } else {
                this.setDepartment(new Department);
            }
        });
    }

    private setDepartment(department: Department) {
        this.department = department;
        const tabTitle = this.department.ID ? 'Avdeling ' + this.department.Name : 'Avdeling (ny)';
        const ID = this.department.ID ? this.department.ID : 'new';
        this.tabService.addTab({url: '/dimensions/department/' + ID, name: tabTitle, active: true, moduleID: 23});
    }

    public next() {
        this.departmentService.getNextID(this.department.ID || 0)
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
        this.departmentService.getPreviousID(this.department.ID || 999999)
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
        if (this.department.ID) {
            this.departmentService.Put(this.department.ID, this.department)
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
            this.departmentService.Post(this.department)
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
