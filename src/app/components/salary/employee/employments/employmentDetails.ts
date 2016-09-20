import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {EmployeeDS} from '../../../../data/employee';
import {EmploymentService, StaticRegisterService} from '../../../../services/services';
import {STYRKCode, Employment} from '../../../../unientities';
import {UniForm} from '../../../../../framework/uniform';
import {UniFieldLayout} from '../../../../../framework/uniform/index';

declare var _; // lodash

@Component({
    selector: 'employment-details',
    directives: [UniForm],
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
    private config: any;
    private fields: UniFieldLayout[] = [];

    constructor(private employeeDS: EmployeeDS,
                private statReg: StaticRegisterService,
                private employmentService: EmploymentService) {
    }

    public ngOnInit() {
        this.styrks = this.statReg.getStaticRegisterDataset('styrk');
        this.buildForm();

        if (!this.employmentService.subEntities) {
            this.employeeDS.getSubEntities().subscribe((response) => {
                this.employmentService.subEntities = response;
                this.employmentService.subEntities.unshift([{ID: 0}]);
            });
        }
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
