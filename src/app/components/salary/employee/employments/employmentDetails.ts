import {Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges} from '@angular/core';
import { Employment, Account, SubEntity, Project, Department } from '../../../../unientities';
import { UniForm } from 'uniform-ng2/main';
import { UniFieldLayout } from 'uniform-ng2/main';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
    EmployeeService,
    ErrorService,
    EmploymentService,
    AccountService,
    StatisticsService
} from '../../../../services/services';
declare var _; // lodash

@Component({
    selector: 'employment-details',
    template: `
        <section *ngIf="employment" [attr.aria-busy]="busy">
            <uni-form [config]="config$"
                      [fields]="fields$"
                      [model]="employment$"
                      (changeEvent)="onFormChange($event)">
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

    @Output() private employmentChange: EventEmitter<Employment> = new EventEmitter<Employment>();

    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private formReady: boolean;
    private employment$: BehaviorSubject<Employment> = new BehaviorSubject(new Employment())
    constructor(
        private employeeService: EmployeeService,
        private employmentService: EmploymentService,
        private accountService: AccountService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {
    }

    public ngOnInit() {
        this.employment$.next(this.employment);
    }

    public ngOnChanges(change) {
        if (!this.formReady) {
            this.buildForm();
        }

        if (change['employment'] && change['employment'].currentValue) {
            this.employment$.next(change['employment'].currentValue);
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

            let jobCodeField = layout.Fields.find(field => field.Property === 'JobCode');
            jobCodeField.Options = {
                getDefaultData: () => this.employment && this.employment.JobCode
                    ? this.statisticsService
                        .GetAll('model=STYRKCode&select=styrk as styrk,tittel as tittel&filter=styrk eq ' + this.employment.JobCode)
                        .map(x => x.Data)
                    : Observable.of([{ styrk: '', tittel: '' }]),
                template: (obj) => obj && obj.styrk ? `${obj.styrk} - ${obj.tittel}` : '',
                search: (query: string) => this.statisticsService
                    .GetAll(`top=50&model=STYRKCode&select=styrk as styrk,tittel as tittel&filter=startswith(styrk,'${query}') or startswith(tittel,'${query}')`)
                    .map(x => x.Data),
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
            let ledgerAccountField = layout.Fields.find(field => field.Property === 'LedgerAccount');
            let accountObs: Observable<Account> = this.employment && this.employment.LedgerAccount
                ? this.accountService.GetAll(`filter=AccountNumber eq ${this.employment.LedgerAccount}` + '&top=1')
                : Observable.of([{ AccountName: '', AccountNumber: null }]);
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

    private setSourceOn(searchField: string, source: any) {
        let fields = this.fields$.getValue();
        let currentField = fields.find(field => field.Property === searchField);
        if (currentField) {
            currentField.Options.source = source;
        }
        this.fields$.next(fields);
    }

    private updateTitle(styrk) {
        if (styrk) {
            this.statisticsService
                .GetAll(`top=50&model=STYRKCode&select=styrk as styrk,tittel as tittel&filter=styrk eq '${styrk}'`)
                .map(x => x.Data)
                .subscribe(styrkObjArray => {
                    if (styrkObjArray && styrkObjArray.length > 0) {
                        let employment = this.employment$.getValue();
                        employment.JobName = styrkObjArray[0].tittel;
                        this.employment$.next(employment);

                        setTimeout(() => {
                            this.form.field('WorkPercent').focus();
                        }, 50);
                    }
                }, err => this.errorService.handle(err));
        }
    }

    private onFormChange(value: SimpleChanges) {
        this.employmentChange.emit(this.employment$.getValue());
    }
}
