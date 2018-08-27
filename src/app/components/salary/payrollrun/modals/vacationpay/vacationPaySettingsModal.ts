import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../../framework/uni-modal';
import {UniFieldLayout, FieldType} from '../../../../../../framework/ui/uniform/index';
import {
    UniTable, UniTableConfig, UniTableColumnType, UniTableColumn
} from '../../../../../../framework/ui/unitable/index';
import {
    CompanySalaryService, CompanyVacationRateService, AccountService, ErrorService, VacationpayLineService, YearService
} from '../../../../../services/services';
import {
    CompanyVacationRate, Account, LocalDate, CompanySalary
} from '../../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as moment from 'moment';

@Component({
    selector: 'vacation-pay-settings-modal',
    templateUrl: './vacationPaySettingsModal.html'
})
export class VacationPaySettingsModal implements OnInit, IUniModal {
    @ViewChild(UniTable) private table: UniTable;
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

    public busy: boolean;
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public companysalaryModel$: BehaviorSubject<any> = new BehaviorSubject({});

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public tableConfig: UniTableConfig;
    public vacationRates: CompanyVacationRate[] = [];
    private changedVacationRates: CompanyVacationRate[] = [];
    public infoText: string;
    private originalDeduction: number;
    public dueToHolidayChanged: boolean = false;
    private saveStatus: { numberOfRequests: number, completeCount: number, hasErrors: boolean };
    private activeYear: number;
    private stdCompVacRate: CompanyVacationRate;

    constructor(
        private _companysalaryService: CompanySalaryService,
        private _companyvacationRateService: CompanyVacationRateService,
        private _accountService: AccountService,
        private errorService: ErrorService,
        private vacationPayLineService: VacationpayLineService,
        private yearService: YearService
    ) { }

    public ngOnInit() {
        this.busy = true;
        this.yearService
            .getActiveYear()
            .do(yr => this.activeYear = yr || null)
            .switchMap(yr =>
                Observable.forkJoin(
                    this._companysalaryService.getCompanySalary(),
                    this._companyvacationRateService.GetAll(''),
                    this._companyvacationRateService.getCurrentRates(yr)
                ))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .finally(() => this.busy = false)
            .subscribe((response: any) => {
                const [compsal, rates, stdRate] = response;
                this.setDefaultValues(compsal, stdRate);
                this.companysalaryModel$.next(compsal);
                this.originalDeduction = this.companysalaryModel$.getValue().WageDeductionDueToHoliday;
                this.stdCompVacRate = stdRate;
                this.vacationRates = rates;
                this.formConfig$.next({
                    submitText: ''
                });
                this.setFormFields();
                this.setTableConfig();
                this.done('');
            });
    }

    public saveSettings() {
        this.busy = true;
        this.saveStatus = {
            numberOfRequests: 0,
            completeCount: 0,
            hasErrors: false
        };

        // save uniform
        if (this.companysalaryModel$.getValue().ID > 0) {
            this.saveStatus.numberOfRequests++;
            this._companysalaryService.Put(
                this.companysalaryModel$.getValue().ID, this.companysalaryModel$.getValue()
            )
                .finally(() => this.checkForSaveDone())
                .subscribe((formresponse) => {
                    this.done('Firmalønn oppdatert');
                    if (this.originalDeduction !== formresponse.WageDeductionDueToHoliday) {
                        this.dueToHolidayChanged = true;
                        this.options.cancelValue = true;
                    }
                    this.saveStatus.completeCount++;
                }, (err) => {
                    this.saveStatus.completeCount++;
                    this.saveStatus.hasErrors = true;
                    this.errorService.handle(err);
                });
        }

        // save unitable
        this.changedVacationRates = this.table.getTableData();
        this.changedVacationRates.forEach(vacationRate => {
            this.saveStatus.numberOfRequests++;
            if (vacationRate.ID > 0) {
                this._companyvacationRateService.Put(vacationRate.ID, vacationRate)
                    .finally(() => this.checkForSaveDone())
                    .subscribe((response) => {
                        this.done('Feriepengesats oppdatert');
                        this.saveStatus.completeCount++;
                    },
                    (err) => {
                        this.saveStatus.completeCount++;
                        this.saveStatus.hasErrors = true;
                        this.errorService.handle(err);
                    });
            } else {
                this._companyvacationRateService.Post(vacationRate)
                    .finally(() => this.checkForSaveDone())
                    .subscribe((response) => {
                        this.done('Feriepengesats lagret');
                        this.saveStatus.completeCount++;
                    },
                    (err) => {
                        this.saveStatus.completeCount++;
                        this.saveStatus.hasErrors = true;
                        this.errorService.handle(err);
                    });
            }
        });
    }

    private checkForSaveDone() {
        this.busy = false;
        if (this.saveStatus.completeCount === this.saveStatus.numberOfRequests) {
            if (this.saveStatus.hasErrors) {
                this.done('Feil ved lagring');
            } else {
                this.done('Lagring fullført');
                this.close();
            }
        }
    }

    private done(infotext: string) {
        this.infoText = infotext;
    }

    private setFormFields() {
        const mainAccountCostVacation = new UniFieldLayout();
        const companysalaryModel = this.companysalaryModel$.getValue();
        const cosVacAccountObs: Observable<Account> = companysalaryModel && companysalaryModel.MainAccountCostVacation
            ? this._accountService.GetAll(
                `filter=AccountNumber eq ${companysalaryModel.MainAccountCostVacation}` + '&top=1'
            )
            : Observable.of([{ AccountName: '', AccountNumber: null }]);
        mainAccountCostVacation.Label = 'Kostnad feriepenger';
        mainAccountCostVacation.Property = 'MainAccountCostVacation';
        mainAccountCostVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountCostVacation.Options = {
            getDefaultData: () => cosVacAccountObs,
            search: (query: string) => this._accountService.GetAll(
                `filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`
            ),
            displayProperty: 'AccountName',
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };

        const mainAccountAllocatedVacation = new UniFieldLayout();
        const allVacAccountObs: Observable<Account> = companysalaryModel
            && companysalaryModel.MainAccountAllocatedVacation
                ? this._accountService.GetAll(
                    `filter=AccountNumber eq ${companysalaryModel.MainAccountAllocatedVacation}` + '&top=1'
                )
                : Observable.of([{ AccountName: '', AccountNumber: null }]);
        mainAccountAllocatedVacation.Label = 'Avsatt feriepenger';
        mainAccountAllocatedVacation.Property = 'MainAccountAllocatedVacation';
        mainAccountAllocatedVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountAllocatedVacation.Options = {
            getDefaultData: () => allVacAccountObs,
            search: (query: string) => this._accountService.GetAll(
                `filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`
            ),
            displayProperty: 'AccountName',
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };

        const payInHoliday = new UniFieldLayout();
        payInHoliday.Label = 'Trekk i fastlønn i feriemåned';
        payInHoliday.Property = 'WageDeductionDueToHoliday';
        payInHoliday.FieldType = FieldType.DROPDOWN;
        payInHoliday.Options = {
            source:
            this.vacationPayLineService.WageDeductionDueToHolidayArray,
            displayProperty: 'name',
            valueProperty: 'id'
        };

        const vacationpayRate = new UniFieldLayout();
        vacationpayRate.Label = 'Standard feriepengesats';
        vacationpayRate.Property = '_standardVacationRate';
        vacationpayRate.Hidden = this.vacationRates.length > 0;
        vacationpayRate.FieldType = FieldType.TEXT;
        vacationpayRate.ReadOnly = true;

        this.fields$.next([payInHoliday, mainAccountCostVacation, mainAccountAllocatedVacation, vacationpayRate]);
    }

    private setTableConfig() {
        const rateCol = new UniTableColumn('Rate', 'Feriepengesats', UniTableColumnType.Percent);
        const rate60Col = new UniTableColumn('Rate60', 'Tilleggssats over 60 år', UniTableColumnType.Percent);
        const dateCol = new UniTableColumn('FromDate', 'Gjelder fra opptjeningsår', UniTableColumnType.Text)
            .setTemplate((rowModel) => {
                return rowModel.FromDate ? moment(rowModel.FromDate).format('YYYY') : '';
            });

        this.tableConfig = new UniTableConfig('salary.payrollrun.vacationpaySettingModalContent', true)
            .setColumns([rateCol, rate60Col, dateCol])
            .setPageable(this.vacationRates.length > 10)
            .setCopyFromCellAbove(false)
            .setChangeCallback((event) => {
                const row = event.rowModel;
                if (event.field === 'FromDate') {
                    row.FromDate = row.FromDate
                    ? new LocalDate(moment(row.FromDate).format('YYYY') + '-01-01')
                    : new LocalDate(this.activeYear - 1 + '-01-01');
                }
                if (event.field === 'Rate60') {
                    row.Rate60 = row.Rate60 ? row.Rate60 : this.stdCompVacRate.Rate60;
                }
                if (event.field === 'Rate') {
                    row.Rate = row.Rate ? row.Rate : this.stdCompVacRate.Rate;
                }
                return row;
            });
    }

    private setDefaultValues(compSalary: CompanySalary, compVacRate: CompanyVacationRate) {
        compSalary['_standardVacationRate'] = compVacRate !== undefined ? compVacRate.Rate + '%' : '';
    }

    public close() {
        this.onClose.next(this.dueToHolidayChanged);
    }
}
