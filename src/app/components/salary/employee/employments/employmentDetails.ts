import { Component, Input, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { EmploymentService, AccountService, StatisticsService } from '../../../../services/services';
import { Employment, Account, SubEntity } from '../../../../unientities';
import { UniForm } from 'uniform-ng2/main';
import { UniFieldLayout } from 'uniform-ng2/main';
import { EmployeeService } from '../../../../services/Salary/Employee/EmployeeService';
import { Observable } from 'rxjs/Observable';
import {ErrorService} from '../../../../services/common/ErrorService';

declare var _; // lodash

@Component({
    selector: 'employment-details',
    template: `
        <section *ngIf="employment" [attr.aria-busy]="busy">
            <uni-form *ngIf="employment"
                      [config]="config"
                      [fields]="fields"
                      [model]="employment"
                      (changeEvent)="onFormChange($event)">
            </uni-form>
        </section>
    `
})
export class EmploymentDetails implements OnChanges {
    @ViewChild(UniForm)
    private form: UniForm;

    @Input()
    private employment: Employment;

    @Input()
    private subEntities: SubEntity[];

    @Output()
    private employmentChange: EventEmitter<Employment> = new EventEmitter<Employment>();

    private config: any = {};
    private fields: UniFieldLayout[] = [];
    private formReady: boolean;

    constructor(
        private employeeService: EmployeeService,
        private employmentService: EmploymentService,
        private accountService: AccountService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService
        ) {
    }

    public ngOnChanges() {
        if (!this.formReady && this.subEntities) {
            this.buildForm();
        }
    }

    private buildForm() {
        this.employmentService.layout('EmploymentDetails').subscribe((layout: any) => {
            // Expand A-meldings section by default
            this.config = {
                sections: {
                    '1': { isOpen: true }
                }
            };

            this.fields = layout.Fields;
            let jobCodeField = this.fields.find(field => field.Property === 'JobCode');
            jobCodeField.Options = {
                getDefaultData: () => Observable.of([this.employment ? { styrk: this.employment.JobCode, tittel: this.employment.JobName } : { styrk: '', tittel: '' }]),
                template: (obj) => obj ? `${obj.styrk} - ${obj.tittel}` : '',
                search: (query: string) => this.statisticsService.GetAll(`top=50&model=STYRKCode&select=styrk as styrk,tittel as tittel&filter=startswith(styrk,'${query}') or startswith(tittel,'${query}')`).map(x => x.Data),
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
            let ledgerAccountField = this.fields.find(field => field.Property === 'LedgerAccount');
            let accountObs: Observable<Account> = this.employment && this.employment.LedgerAccount
                ? this.accountService.GetAll(`filter=AccountNumber eq ${this.employment.LedgerAccount}` + '&top=1')
                : Observable.of([{ AccountName: '', AccountNumber: null }]);
            ledgerAccountField.Options = {
                getDefaultData: () => accountObs,
                search: (query: string) => this.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`),
                displayProperty: 'AccountName',
                valueProperty: 'AccountNumber',
                template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            };

            const subEntityField = this.fields.find(field => field.Property === 'SubEntityID');
            subEntityField.Options.source = this.subEntities;

            this.formReady = true;
        }, err => this.errorService.handle(err));
    }

    private updateTitle(styrk) {
        if (styrk) {
            this.statisticsService.GetAll(`top=50&model=STYRKCode&select=styrk as styrk,tittel as tittel&filter=styrk eq '${styrk}'`)
                .map(x => x.Data)
                .subscribe(styrkObjArray => {
                    if (styrkObjArray && styrkObjArray.length > 0) {
                        this.employment.JobName = styrkObjArray[0].tittel;
                        this.employment = _.cloneDeep(this.employment);

                        setTimeout(() => {
                            this.form.field('WorkPercent').focus();
                        }, 50);
                    }
                }, err => this.errorService.handle(err));
        }
    }

    private onFormChange(value: Employment) {
        this.employmentChange.emit(value);
    }
}
