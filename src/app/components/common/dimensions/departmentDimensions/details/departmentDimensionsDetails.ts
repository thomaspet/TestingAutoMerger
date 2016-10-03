import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FieldType, Department} from '../../../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../../framework/uniform';
import {TabService} from '../../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';
import {DepartmentService} from '../../../../../services/common/DepartmentService';

@Component({
    selector: 'department-dimensions-details',
    templateUrl: 'app/components/common/dimensions/departmentDimensions/details/departmentDimensionsDetails.html',
    directives: [UniSave, UniForm],
    providers: [DepartmentService]
})
export class DepartmentDimensionsDetails implements OnInit {
    public config: any = {};
    public fields: UniFieldLayout[] = [];
    private department: Department;

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.save(completeEvent),
            main: true,
            disabled: false
        }
    ];

    private errorHandler(err: Error) {
        console.log('Error in DepartmentDimensionsDetails:', err);
        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ett problem oppstod, forsøk igjen senere');
    }

    constructor(
        private departmentService: DepartmentService,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        this.fields = this.getComponentFields();

        this.route.params.subscribe(params => {
            const departmentID = +params['id'];
            if (departmentID) {
                this.departmentService.Get(departmentID)
                    .subscribe(
                        department => this.setDepartment(department),
                        err => this.errorHandler(err)
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
        this.tabService.addTab({ url: '/dimensions/departmentDimensions/' + ID, name: tabTitle, active: true, moduleID: 23 });
    }

    public next() {
        this.departmentService.getNextID(this.department.ID || 0)
            .subscribe(
                departmentID => {
                    if (departmentID) {
                        this.router.navigateByUrl('/dimensions/departmentDimensions/' + departmentID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere avdelinger etter denne');
                    }
                },
                err => this.errorHandler(err)
            );
    }

    public previous() {
        this.departmentService.getPreviousID(this.department.ID || 999999)
            .subscribe(
                departmentID => {
                    if (departmentID) {
                        this.router.navigateByUrl('/dimensions/departmentDimensions/' + departmentID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere avdelinger før denne');
                    }
                },
                err => this.errorHandler(err)
            );
    }

    public add() {
        this.router.navigateByUrl('/dimensions/departmentDimensions/new');
    }

    private save(done: Function) {
        if (this.department.ID) {
            this.departmentService.Put(this.department.ID, this.department)
                .subscribe(
                    updatedDepartment => {
                        this.router.navigateByUrl('/dimensions/departmentDimensions/' + updatedDepartment.ID);
                        done('Avdeling lagret');
                    },
                    err => {
                        if (err.status === 400) {
                            this.toastService.addToast('Warning', ToastType.warn, 0, 'Avdelingsnummer allerede brukt, venligst bruk et annet nummer');
                        } else {
                            this.errorHandler(err);
                        }
                    });
        } else {
            this.departmentService.Post(this.department)
                .subscribe(
                    newDepartment => {
                        this.router.navigateByUrl('/dimensions/departmentDimensions/' + newDepartment.ID);
                        done('Avdeling lagret');
                    },
                    err => this.errorHandler(err));
        }
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <UniFieldLayout> {
                FieldType: FieldType.TEXT,
                Label: 'Avdelingsnummer',
                Property: 'DepartmentNumber',
                Placeholder: 'Autogenerert hvis blank'
            },
            <UniFieldLayout> {
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Property: 'Name'
            },
            <UniFieldLayout> {
                FieldType: FieldType.TEXT,
                Label: 'Avdelingsleder',
                Property: 'DepartmentManagerName'
            },
            <UniFieldLayout> {
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse',
                Property: 'Description'
            }
        ];
    }
}
