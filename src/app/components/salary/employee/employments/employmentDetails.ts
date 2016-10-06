import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {EmploymentService, StaticRegisterService} from '../../../../services/services';
import {STYRKCode, Employment} from '../../../../unientities';
import {UniForm} from '../../../../../framework/uniform';
import {UniFieldLayout} from '../../../../../framework/uniform/index';
import {EmployeeService} from '../../../../services/Salary/Employee/EmployeeService';

declare var _; // lodash

@Component({
    selector: 'employment-details',
    template: `
        <section *ngIf="employment" [attr.aria-busy]="busy">
            <uni-form *ngIf="employment"
                      [config]="config"
                      [fields]="fields"
                      [model]="employment"
                      (onChange)="onFormChange($event)">
            </uni-form>
        </section>
    `
})
export class EmploymentDetails {
    @ViewChild(UniForm)
    private form: UniForm;

    @Input()
    private employment: Employment;

    @Output()
    private employmentChange: EventEmitter<Employment> = new EventEmitter<Employment>();

    private styrks: STYRKCode[];
    private config: any = {};
    private subEntities: any[] = [];
    private fields: UniFieldLayout[] = [];

    constructor(private employeeService: EmployeeService,
                private statReg: StaticRegisterService,
                private employmentService: EmploymentService) {
    }

    public ngOnInit() {
        this.styrks = this.statReg.getStaticRegisterDataset('styrk');
        this.buildForm();

        this.employeeService.getSubEntities().subscribe((subEntities) => {
            this.subEntities = subEntities;
            this.buildForm();
        });
    }

    private buildForm() {
        this.employmentService.layout('EmploymentDetails').subscribe((layout: any) => {
            // Expand A-meldings section by default
            this.config = {
                sections: {
                    '1': {isOpen: true}
                }
            };

            this.fields = layout.Fields;
            let jobCodeField = this.fields.find(field => field.Property === 'JobCode');
            jobCodeField.Options = {
                source: this.styrks,
                template: (obj) => obj ? `${obj.styrk} - ${obj.tittel}` : '',
                displayProperty: 'styrk',
                valueProperty: 'styrk',
                debounceTime: 500,
                events: {
                    select: (model: Employment) => {
                        this.updateTitle(model.JobCode);
                    },
                    enter: (model: Employment) => {
                        this.updateTitle(model.JobCode);
                    }
                }
            };
        });

        const subEntityField = this.fields.find(field => field.Property === 'SubEntityID');
        subEntityField.Options.source = this.subEntities;
    }

    private updateTitle(styrk) {
        if (styrk) {
            let styrkObj = this.styrks.find(x => x.styrk === styrk);
            this.employment.JobName = styrkObj.tittel;
            this.employment = _.cloneDeep(this.employment);
            this.form.field('WorkPercent').focus();
        }
    }

    private onFormChange(value: Employment) {
        this.employmentChange.emit(value);
    }
}
