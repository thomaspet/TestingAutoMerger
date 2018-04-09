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

    @Input() private employment: Employment;
    @Input() private subEntities: SubEntity[];
    @Input() private projects: Project[];
    @Input() private departments: Department[];
    @Input() private employeeID: number;

    @Output() private employmentChange: EventEmitter<Employment> = new EventEmitter<Employment>();

    private focusJobCode: boolean;

    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
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
                events: {
                    select: (model: Employment) => {
                        this.updateTitle(model.JobCode);
                    },
                    enter: (model: Employment) => {
                        this.updateTitle(model.JobCode);
                    }
                }
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

    public setSourceOn(searchField: string, source: any) {
        const fields = this.fields$.getValue();
        const currentField = fields.find(field => field.Property === searchField);
        if (currentField) {
            currentField.Options.source = source;
        }
        this.fields$.next(fields);
    }

    public updateTitle(styrk) {
        if (styrk) {
            this.statisticsService
                .GetAll(`top=50&model=STYRKCode&select=styrk as styrk,tittel as tittel&filter=styrk eq '${styrk}'`)
                .map(x => x.Data)
                .subscribe(styrkObjArray => {
                    if (styrkObjArray && styrkObjArray.length > 0) {
                        const employment = this.employment$.getValue();
                        employment.JobName = styrkObjArray[0].tittel;
                        this.employment$.next(employment);

                        setTimeout(() => {
                            this.form.field('JobName').focus();
                        }, 50);
                    }
                }, err => this.errorService.handle(err));
        }
    }

    public onFormChange(value: SimpleChanges) {
        if (!Object.keys(value).some(key => this.hasChanged(value[key]))) {
            return;
        }
        this.employmentChange.emit(this.employment$.getValue());
    }

    private hasChanged(value: SimpleChange) {
        if (isNaN(value.currentValue) || isNaN(value.previousValue)) {
            return value.currentValue !== value.previousValue;
        }

        return Math.round(value.currentValue) !== Math.round(value.previousValue);
    }

    public onFormReady(value) {
        if (this.focusJobCode) {
            this.form.field('JobCode').focus();
            this.focusJobCode = false;
        }
    }
}
