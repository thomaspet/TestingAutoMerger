import {Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, SimpleChange} from '@angular/core';
import {Employment, Account, SubEntity, Project, Department} from '../../../../unientities';
import {UniForm} from '../../../../../framework/ui/uniform/index';
import {UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TypeOfEmployment} from '@uni-entities';
import {
    EmployeeService,
    ErrorService,
    EmploymentService,
    AccountService,
    StatisticsService
} from '../../../../services/services';
declare var _;

@Component({
    selector: 'employment-details',
    template: `
        <section *ngIf="employment" [attr.aria-busy]="busy">
            <uni-form [config]="config$"
                      [fields]="fields$"
                      [model]="employment$"
                      (changeEvent)="onFormChange($event)"
                      (readyEvent)="onFormReady($event)">
            </uni-form>
        </section>
    `
})
export class EmploymentDetails implements OnChanges {
    @ViewChild(UniForm) private form: UniForm;

    @Input() public employment: Employment;
    @Input() private subEntities: SubEntity[];
    @Input() private projects: Project[];
    @Input() private departments: Department[];
    @Input() private employeeID: number;

    @Output() private employmentChange: EventEmitter<Employment> = new EventEmitter<Employment>();

    private focusJobCode: boolean;

    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private formReady: boolean;
    private employment$: BehaviorSubject<Employment> = new BehaviorSubject(new Employment());
    private searchCache: any[] = [];
    private jobCodeInitValue: Observable<any>;

    constructor(
        private employeeService: EmployeeService,
        private employmentService: EmploymentService,
        private accountService: AccountService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {}

    public ngOnChanges(change: SimpleChanges) {
        if (!this.formReady) {
            this.buildForm();
        }

        if (change['employeeID'] && !change['employeeID'].currentValue) {
            this.employment = null;
            this.formReady = false;
        }

        if (change['employment'] && change['employment'].currentValue) {
            const currEmployment: Employment = change['employment'].currentValue;
            const prevEmployment: Employment = change['employment'].previousValue;
            if (!currEmployment.ID && ( !prevEmployment || currEmployment.ID !== prevEmployment.ID)) {
                if (this.form) {
                    this.form.field('JobCode').focus();
                } else {
                    this.focusJobCode = true;
                }
            }

            if (!!prevEmployment && currEmployment.ID !== prevEmployment.ID) {
                this.resetAutocompletes();
            }


            if (this.employment.JobCode) {
                this.jobCodeInitValue = this.statisticsService
                    .GetAll(
                        'model=STYRKCode&select=styrk as styrk,'
                        + 'tittel as tittel&filter=styrk eq '
                        + this.employment.JobCode
                    )
                    .map(res => res.Data)
                    .share();
            } else {
                this.jobCodeInitValue = Observable.of([{ styrk: '', tittel: '' }]);
            }

            this.employment$.next(change['employment'].currentValue);
            this.updateAmeldingTooltips();
        }

        if (change['subEntities'] && change['subEntities'].currentValue) {
            this.setSourceOn('SubEntityID', this.subEntities);
        }

        if (change['projects'] && change['projects'].currentValue) {
            this.setSourceOn('Dimensions.ProjectID', this.projects);
        }

        if (change['departments'] && change['departments'].currentValue) {
            this.setSourceOn('Dimensions.DepartmentID', this.departments);
        }
    }

    private buildForm() {
        this.employmentService.layout('EmploymentDetails').subscribe((layout: any) => {
            // Expand A-meldings section by default
            this.config$.next({
                sections: {
                    '1': { isOpen: true }
                }
            });

            const subEntityField = layout.Fields.find(field => field.Property === 'SubEntityID');
            subEntityField.Options = {
                valueProperty: 'ID',
                debounceTime: 200,
                template: (obj: SubEntity) =>
                    obj && obj.BusinessRelationInfo
                    ?
                    obj.BusinessRelationInfo.Name
                        ? `${obj.OrgNumber} - ${obj.BusinessRelationInfo.Name}`
                        : `${obj.OrgNumber}`
                    : ''
            };

            const jobCodeField = layout.Fields.find(field => field.Property === 'JobCode');
            jobCodeField.Options = {
                getDefaultData: () => this.jobCodeInitValue,
                template: (obj) => obj && obj.styrk ? `${obj.styrk} - ${obj.tittel}` : '',
                search: (query: string) => {
                    if (this.searchCache[query]) {
                        return this.searchCache[query];
                    }
                    return this.statisticsService
                        .GetAll(
                            `top=50&model=STYRKCode&select=styrk as styrk,tittel as tittel`
                            + `&filter=startswith(styrk,'${query}') or contains(tittel,'${query}')`
                        )
                        .do(x => this.searchCache[query] = Observable.of(x.Data))
                        .map(x => x.Data);
                },
                displayProperty: 'styrk',
                valueProperty: 'styrk',
                debounceTime: 200,
            };
            const ledgerAccountField = layout.Fields.find(field => field.Property === 'LedgerAccount');
            const accountObs: Observable<Account> = this.employment && this.employment.LedgerAccount
                ? this.accountService.GetAll(`filter=AccountNumber eq ${this.employment.LedgerAccount}` + '&top=1')
                : Observable.of([undefined]);
            ledgerAccountField.Options = {
                getDefaultData: () => accountObs,
                search: (query: string) => {
                    const filter = `filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`;
                    return this.accountService.GetAll(filter);
                },
                displayProperty: 'AccountName',
                valueProperty: 'AccountNumber',
                template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            };
            this.fields$.next(layout.Fields);
            this.formReady = true;
        }, err => this.errorService.handle(err));
    }

    public updateAmeldingTooltips() {
        const employment = this.employment$.getValue();
        const fields: any[] = this.fields$.getValue();

        fields.forEach(field => {
            if (field.Tooltip && field.Tooltip._isAmeldingValidationTooltip) {
                field.Tooltip = undefined;
            }
        });

        // TypeOfEmployment is always required
        this.setRequiredTooltip(fields, employment, 'TypeOfEmployment');

        // "Not set" and Pension has no more required fields
        if (employment.TypeOfEmployment === TypeOfEmployment.notSet
            || employment.TypeOfEmployment === TypeOfEmployment.PensionOrOtherNonEmployedBenefits
        ) {
            this.fields$.next(fields);
            return;
        }

        // Ordinary, maritime and frilancer
        this.setRequiredTooltip(fields, employment, 'StartDate');

        // Ordinary and maritime
        if (employment.TypeOfEmployment !== TypeOfEmployment.FrilancerContratorFeeRecipient) {
            this.setRequiredTooltip(fields, employment, 'JobCode');
            this.setRequiredTooltip(fields, employment, 'HoursPerWeek');
            this.setRequiredTooltip(fields, employment, 'WorkPercent');
            this.setRequiredTooltip(fields, employment, 'LastWorkPercentChangeDate');
            this.setRequiredTooltip(fields, employment, 'LastSalaryChangeDate');
            this.setRequiredTooltip(fields, employment, 'WorkingHoursScheme');
        }

        // Only maritime
        if (employment.TypeOfEmployment === TypeOfEmployment.MaritimeEmployment) {
            this.setRequiredTooltip(fields, employment, 'RemunerationType');
        }

        this.fields$.next(fields);
    }

    private setRequiredTooltip(fields, model, property) {
        const field = fields.find(f => f.Property === property);
        if (field && !_.get(model, property)) {
            field.Tooltip = {
                Type: 'warn',
                Text: 'Dette feltet er påkrevd ved innrapportering av A-melding',
                // Set flag to avoid clearing other tooltips in updateAmeldingTooltips()
                _isAmeldingValidationTooltip: true
            };
        }
    }

    private resetAutocompletes() {
        const fields = this.fields$.getValue();
        this.resetFields(
            this.getFields(['SubEntityID', 'Dimensions.ProjectID', 'Dimensions.DepartmentID'], fields),
            fields);
    }

    private getFields(fieldNames: string[], allFields: UniFieldLayout[]) {
        return fieldNames.map(name => this.getField(name, allFields));
    }

    private getField(fieldName: string, allFields: UniFieldLayout[]) {
        return allFields.find(field => field.Property === fieldName);
    }

    private resetFields(fields: UniFieldLayout[], allFields: UniFieldLayout[]) {
        fields.forEach(field => field.Hidden = !field.Hidden);
        this.fields$.next(allFields);
        fields.forEach(field => field.Hidden = !field.Hidden);
        this.fields$.next(allFields);
    }

    public setSourceOn(searchField: string, source: any) {
        const fields = this.fields$.getValue();
        const currentField = fields.find(field => field.Property === searchField);
        if (currentField) {
            currentField.Options.source = source;
        }
        this.fields$.next(fields);
    }

    public getJobName(styrk) {
        return this.statisticsService
            .GetAll(`top=50&model=STYRKCode&select=styrk as styrk,tittel as tittel&filter=styrk eq '${styrk}'`)
            .catch((err, source) => this.errorService.handleRxCatch(err, source))
            .map(x => x.Data)
            .map(styrkObjArray => {
                if (styrkObjArray && styrkObjArray.length > 0) {
                    return styrkObjArray[0].tittel;
                } else {
                    return '';
                }
            });
    }

    public onFormChange(changes: SimpleChanges) {

        const employment = this.employment$.getValue();

        if (changes['JobCode'] && employment.JobCode) {
            this.getJobName(changes['JobCode'].currentValue).subscribe(jobName => {
                employment.JobName = jobName;
                this.jobCodeInitValue = Observable.of([{ styrk: employment.JobCode, tittel: employment.JobName }]);
                this.employment$.next(employment);
                this.employmentChange.emit(employment);
            });
        } else {
            this.employmentChange.emit(this.employment$.getValue());
        }
    }

    public onFormReady(value) {
        if (this.focusJobCode) {
            this.form.field('JobCode').focus();
            this.focusJobCode = false;
        }
    }
}
