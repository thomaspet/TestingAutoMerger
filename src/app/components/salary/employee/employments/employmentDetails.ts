import {Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, OnInit} from '@angular/core';
import {
    Employment,
    Account,
    Employee,
    LocalDate,
    CompanySalary,
    RegulativeGroup,
    RegulativeStep,
    SalaryRegistry,
    TypeOfEmployment,
    SubEntity,
} from '@uni-entities';
import {UniForm} from '../../../../../framework/ui/uniform/index';
import {UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {Observable, of} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {
    ErrorService,
    EmploymentService,
    AccountService,
    StatisticsService,
    CompanySalaryService,
    RegulativeGroupService,
    SubEntityService
} from '../../../../services/services';
import {filter, take, switchMap, map, tap} from 'rxjs/operators';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import { ConfirmActions, UniConfirmModalV2 } from '@uni-framework/uni-modal';
import * as moment from 'moment';
import { AuthService } from '@app/authService';

declare var _;
const UPDATE_RECURRING = '_updateRecurringTranses';

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
export class EmploymentDetails implements OnChanges, OnInit {
    @ViewChild(UniForm, { static: false }) private form: UniForm;

    @Input() public employment: Employment;
    @Input() private employee: Employee;

    @Output() private employmentChange: EventEmitter<Employment> = new EventEmitter<Employment>();
    @Output() private employeeChange: EventEmitter<Employee> = new EventEmitter<Employee>();

    private focusJobCode: boolean;

    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private formReady: boolean;
    private employment$: BehaviorSubject<Employment> = new BehaviorSubject(new Employment());
    private searchCache: any[] = [];
    private jobCodeDefaultData: Observable<any>;
    private companySalarySettings: CompanySalary;
    private regulativeGroups: RegulativeGroup[];
    private regulativeSteps: RegulativeStep[];

    constructor(
        private employmentService: EmploymentService,
        private accountService: AccountService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private companySalaryService: CompanySalaryService,
        private regulativeGroupService: RegulativeGroupService,
        private authService: AuthService,
        private subEntityService: SubEntityService
    ) {}

    ngOnInit() {
        this.companySalaryService.getCompanySalary()
            .subscribe((compsalarysettings: CompanySalary) => {
                this.companySalarySettings = compsalarysettings;
            });

            const hasAcessToRegulative = this.authService.hasUIPermission(this.authService.currentUser, 'ui_salary_regulative');
            if (hasAcessToRegulative) {
                this.regulativeGroupService.GetAll('expand=regulatives.steps').subscribe(x => {
                    this.employmentService.setRegulativeGroups(x);
                    if (this.employment && this.employment.RegulativeGroupID) {
                        this.employmentService.setRegulativeSteps(
                            x.filter((regulativeGroup: RegulativeGroup) =>
                            regulativeGroup.ID === this.employment.RegulativeGroupID)[0].Regulatives[0].Steps);
                    }
                    this.regulativeGroups = x;
                });
            }
    }

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


            if (this.employment && this.employment.JobCode) {
                this.jobCodeDefaultData = this.statisticsService
                    .GetAll(
                        'model=STYRKCode&select=styrk as styrk,'
                        + 'tittel as tittel&filter=styrk eq '
                        + this.employment.JobCode
                    )
                    .map(res => res.Data)
                    .share();
            } else {
                this.jobCodeDefaultData = Observable.of([{ styrk: '', tittel: '' }]);
            }

            this.employment$.next(change['employment'].currentValue);
            this.employmentService.updateDefaults(change['employment'].currentValue);
            this.fields$
                .pipe(
                    filter(fields => !!fields && !!fields.length),
                    take(1),
                )
                .subscribe(fields => this.updateAmeldingTooltips(change['employment'].currentValue, fields));
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

            const jobCodeField = layout.Fields.find(field => field.Property === 'JobCode');
            jobCodeField.Options = {
                getDefaultData: () => this.jobCodeDefaultData,
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
                    const filtr = `filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`;
                    return this.accountService.GetAll(filtr);
                },
                displayProperty: 'AccountName',
                valueProperty: 'AccountNumber',
                template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            };
            this.fields$.next(layout.Fields);
            this.formReady = true;
        }, err => this.errorService.handle(err));
    }

    public updateAmeldingTooltips(employment: Employment, fields: any[]) {
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
            setTimeout(() => this.fields$.next(fields));
            return;
        }

        // Ordinary, maritime and frilancer
        this.setRequiredTooltip(fields, employment, 'StartDate');
        if ( employment.TypeOfEmployment === TypeOfEmployment.FrilancerContratorFeeRecipient) {
            this.setRequiredTooltip(fields, employment, 'JobCode');
        }

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
            this.setRequiredTooltip(fields, employment, 'ShipReg');
            this.setRequiredTooltip(fields, employment, 'ShipType');
            this.setRequiredTooltip(fields, employment, 'TradeArea');
        }

        setTimeout(() => this.fields$.next(fields));
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

    public fillInJobName(employment: Employment): Observable<Employment> {
        return this.getJobName(employment.JobCode)
            .pipe(
                tap(name => this.jobCodeDefaultData = Observable.of([{styrk: employment.JobCode, tittel: name}])),
                map(name => {
                    employment.JobName = name;
                    return employment;
                })
            );
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
        const fields = this.fields$.value;

        if (changes['TypeOfEmployment']) {
            this.employmentService.checkTypeOfEmployment(changes['TypeOfEmployment'].currentValue);
        }

        const subEntityIDChange = changes['SubEntityID'];
        const previousSubEntityID = subEntityIDChange
            && (isNaN(+subEntityIDChange.previousValue)
                ? subEntityIDChange.previousValue.ID
                : subEntityIDChange.previousValue);
        if (changes['SubEntityID'] && previousSubEntityID) {
            this.askUserAboutAmeldingIfNeeded(employment)
                .subscribe((answer) => {
                    if (answer === ConfirmActions.ACCEPT) {
                        return;
                    }
                    employment.SubEntityID = previousSubEntityID;
                    this.employment$.next(employment);
                    this.employmentChange.next(employment);
                });
        }

        if (changes['JobCode'] && employment.JobCode) {
            const confirmObs = changes['JobCode'].previousValue.styrk !== ''
                ? this.askUserAboutAmeldingIfNeeded(employment)
                : of(ConfirmActions.ACCEPT);

            confirmObs
                .pipe(
                    switchMap((answer) => {
                        if (answer !== ConfirmActions.ACCEPT) {
                            employment.JobCode = changes['JobCode'].previousValue.styrk;
                            return of(employment);
                        }
                        return this.fillInJobName(employment);
                    }),

                )
                .subscribe(empl => {
                    this.employment$.next(empl);
                    this.employmentChange.next(empl);
                });
        } else {
            this.employmentChange.emit(this.employment$.getValue());
        }

        if (changes['StartDate'] && !this.employee.EmploymentDateOtp) {
            this.employee.EmploymentDateOtp = changes['StartDate'].currentValue;
            this.employeeChange.emit(this.employee);
        }

        if (changes['RegulativeGroupID']) {
            fields.find(f => f.Property === 'RegulativeStepNr').ReadOnly = false;

            this.regulativeSteps = this.regulativeGroups.filter((regulativeGroup: RegulativeGroup) => regulativeGroup.ID === changes['RegulativeGroupID'].currentValue)[0].Regulatives[0].Steps;
            this.employmentService.setRegulativeSteps(this.regulativeSteps);
        }

        if (changes['RegulativeStepNr']) {
            fields.find(f => f.Property === 'MonthRate').ReadOnly = true;
            fields.find(f => f.Property === 'HourRate').ReadOnly = true;
            this.fields$.next(fields);

            employment.MonthRate = this.regulativeSteps.filter((step: RegulativeStep) => step.Step === changes['RegulativeStepNr'].currentValue)[0].Amount / 12;
            this.employment$.next(employment);
            this.employmentChange.emit(employment);
        }

        if (changes['Dimensions.ProjectID'] || changes['Dimensions.DepartmentID']) {
            employment[UPDATE_RECURRING] = !!employment.ID;
            this.employmentChange.emit(employment);
        }

        if (changes['SubEntityID'] && !!this.employment.ID) {
            const change = changes['SubEntityID'];
            const prevSubEntity$: Observable<SubEntity> = isNaN(change.previousValue)
                ? of(change.previousValue)
                : this.subEntityService.Get(change.previousValue);
            prevSubEntity$
                .subscribe(prevSubEntity => {
                    if (prevSubEntity && !prevSubEntity.SuperiorOrganizationID) {
                        employment.SubEntityID = prevSubEntity.ID;
                        this.employment$.next(employment);
                        this.employmentChange.emit(employment);
                        this.modalService.confirm({
                            header: 'Kan ikke endre fra juridisk enhet',
                            message: 'Feltet virksomhet kan ikke endres fordi arbeidsforholdet er knyttet til juridisk enhet.'
                                + '<br/>'
                                + 'Du må sette sluttdato på dette arbeidsforholdet '
                                + 'og deretter opprette et nytt arbeidsforhold som du knytter til korrekt virksomhet.',
                            buttonLabels: {
                                accept: 'OK',
                            }
                        });
                    }
                });

        }

        if (changes['StartDate'] && this.employee.EndDateOtp) {
            if (!changes['StartDate'].previousValue && !employment.ID) {
                if (this.companySalarySettings.OtpExportActive) {
                    const obs = this.modalService
                    .confirm({
                        header: 'Oppdater Slutttdato OTP',
                        message: `Den ansatte er satt opp med sluttdato for OTP.
                            Vil du fjerne sluttdato for OTP nå som du legger til nytt arbeidsforhold?`,
                        buttonLabels: {
                            accept: 'Ja, fjern sluttdato OTP',
                            cancel: 'Nei, behold sluttdato OTP'
                        }
                    })
                    .onClose;
                    return obs
                        .filter((res: ConfirmActions) => res === ConfirmActions.ACCEPT)
                        .map(() => this.employee)
                        .subscribe((employee) => {
                            employee.EndDateOtp = null;
                            employee.IncludeOtpUntilMonth = 0;
                            employee.IncludeOtpUntilYear = 0;
                            this.employeeChange.emit(employee);
                        });
                }
            }
        }

        if (changes['EndDate']) {
            const enddate: LocalDate = changes['EndDate'].currentValue;
            if (!!enddate) {
                if (this.companySalarySettings.OtpExportActive) {
                    const includedate = moment(new Date()).add(2, 'months');
                    const obs = this.modalService
                    .confirm({
                        header: 'Oppdater Slutttdato OTP',
                        message: 'Vil du også oppdatere sluttdato OTP?',
                        buttonLabels: {
                            accept: 'Ja, oppdater sluttdato OTP',
                            cancel: 'Nei, den ansatte har ikke sluttet. Endrer bare på arbeidsforhold'
                        }
                    })
                    .onClose;
                    return obs
                        .filter((res: ConfirmActions) => res === ConfirmActions.ACCEPT)
                        .switchMap(() => Observable.of(this.employee))
                        .subscribe((employee) => {
                            employee.EndDateOtp = enddate;
                            employee.IncludeOtpUntilMonth = includedate.month();
                            employee.IncludeOtpUntilYear = includedate.year();
                            this.employeeChange.emit(employee);
                        });
                }
            }
        }
    }

    askUserAboutAmeldingIfNeeded(employment: Employment, changes?: SimpleChanges) {
        if (!employment || !employment.ID || (changes && !changes['JobCode'].previousValue)) {
            return of(ConfirmActions.ACCEPT);
        }
        return this.statisticsService
            .GetAll(
                `model=ameldingData` +
                `&select=year,period,log.key` +
                `&expand=log` +
                `&filter=log.registry eq ${SalaryRegistry.Employment} and log.key eq ${employment.ID}` +
                `&distinct=true`)
            .pipe(
                switchMap(res => {
                    if (res.Data.length < 2) {
                        return of(ConfirmActions.ACCEPT);
                    }
                    return this.modalService.open(UniConfirmModalV2, {
                        header: 'Varsel ved endring av felter på arbeidsforhold',
                        message: 'Ved endring av feltene Yrkeskode eller Virksomhet risikerer du at a-melding blir avvist.'
                            + ' Vi anbefaler deg å avslutte arbeidsforholdet med sluttdato '
                            + 'og opprette et nytt dersom du har sendt a-melding på denne ansatte.',
                        buttonLabels: {
                            accept: 'Ok',
                            cancel: 'Avbryt',
                        }
                    })
                    .onClose;
                })
            );
    }

    public onFormReady(value) {
        if (this.focusJobCode) {
            this.form.field('JobCode').focus();
            this.focusJobCode = false;
        }
    }
}
