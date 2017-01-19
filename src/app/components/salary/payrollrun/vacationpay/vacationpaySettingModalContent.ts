import {Component, Input, ViewChild, Output,  EventEmitter} from '@angular/core';
import {UniFieldLayout} from 'uniform-ng2/main';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {CompanySalaryService, CompanyVacationRateService, AccountService, ErrorService} from '../../../../services/services';
import {FieldType, CompanyVacationRate, Account, LocalDate, WageDeductionDueToHolidayType} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';

@Component({
    selector: 'vacationpay-setting-modal-content',
    templateUrl: './vacationpaySettingModalContent.html'
})
export class VacationpaySettingModalContent {
    private busy: boolean;
    private fields: UniFieldLayout[] = [];
    private companysalaryModel: any = {};
    @Input() public config: any;
    @ViewChild(UniTable) private table: UniTable;
    private formConfig: any = {};
    private tableConfig: UniTableConfig;
    private vacationRates: CompanyVacationRate[] = [];
    private changedVacationRates: CompanyVacationRate[] = [];
    private infoText: string;
    private originalDeduction: number;
    public dueToHolidayChanged: boolean = false;
    private saveStatus: { numberOfRequests: number, completeCount: number, hasErrors: boolean };

    constructor(
        private _companysalaryService: CompanySalaryService,
        private _companyvacationRateService: CompanyVacationRateService,
        private _accountService: AccountService,
        private errorService: ErrorService
    ) {

    }

    public loadData() {
        this.busy = true;
        Observable.forkJoin(
            this._companysalaryService.getCompanySalary(),
            this._companyvacationRateService.GetAll('')
        ).subscribe((response: any) => {
            var [compsal, rates] = response;
            this.companysalaryModel = compsal[0];
            this.originalDeduction = this.companysalaryModel.WageDeductionDueToHoliday;
            this.vacationRates = rates;
            this.formConfig = {
                submitText: ''
            };
            this.setFormFields();
            this.setTableConfig();
            this.done('');
            this.busy = false;
        }, err => this.errorService.handle(err));
    }

    public ready(value) {

    }

    public change(value) {

    }

    public saveSettings() {

        this.saveStatus = {
            numberOfRequests: 0,
            completeCount: 0,
            hasErrors: false
        };

        // save uniform
        if (this.companysalaryModel.ID > 0) {
            this.saveStatus.numberOfRequests++;
            this._companysalaryService.Put(this.companysalaryModel.ID, this.companysalaryModel)
                .finally(() => this.checkForSaveDone())
                .subscribe((formresponse) => {
                    this.done('Firmalønn oppdatert');
                    if (this.originalDeduction !== formresponse.WageDeductionDueToHoliday) {
                        this.dueToHolidayChanged = true;
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
        if (this.saveStatus.completeCount === this.saveStatus.numberOfRequests) {
            if (this.saveStatus.hasErrors) {
                this.done('Feil ved lagring');
            } else {
                this.done('Lagring fullført');
                this.config.cancel();
            }
        }
    }

    private done(infotext: string) {
        this.infoText = infotext;
    }

    private setFormFields() {
        var mainAccountCostVacation = new UniFieldLayout();
        let cosVacAccountObs: Observable<Account> = this.companysalaryModel && this.companysalaryModel.MainAccountCostVacation
                ? this._accountService.GetAll(`filter=AccountNumber eq ${this.companysalaryModel.MainAccountCostVacation}` + '&top=1')
                : Observable.of([{ AccountName: '', AccountNumber: null }]);
        mainAccountCostVacation.Label = 'Kostnad feriepenger';
        mainAccountCostVacation.Property = 'MainAccountCostVacation';
        mainAccountCostVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountCostVacation.Options = {
            getDefaultData: () => cosVacAccountObs,
            search: (query: string) => this._accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`),
            displayProperty: 'AccountName',
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };

        var mainAccountAllocatedVacation = new UniFieldLayout();
        let allVacAccountObs: Observable<Account> = this.companysalaryModel && this.companysalaryModel.MainAccountAllocatedVacation
                ? this._accountService.GetAll(`filter=AccountNumber eq ${this.companysalaryModel.MainAccountAllocatedVacation}` + '&top=1')
                : Observable.of([{ AccountName: '', AccountNumber: null }]);
        mainAccountAllocatedVacation.Label = 'Avsatt feriepenger';
        mainAccountAllocatedVacation.Property = 'MainAccountAllocatedVacation';
        mainAccountAllocatedVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountAllocatedVacation.Options = {
            getDefaultData: () => allVacAccountObs,
            search: (query: string) => this._accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`),
            displayProperty: 'AccountName',
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };

        var payInHoliday = new UniFieldLayout();
        payInHoliday.Label = 'Trekk i fastlønn i feriemåned';
        payInHoliday.Property = 'WageDeductionDueToHoliday';
        payInHoliday.FieldType = FieldType.DROPDOWN;
        payInHoliday.Options = {
            source: [
                {id: WageDeductionDueToHolidayType.Deduct4PartsOf26, name: '-4/26 av månedslønn'},
                {id: WageDeductionDueToHolidayType.Deduct3PartsOf22, name: '-3/22 av månedslønn'},
                {id: WageDeductionDueToHolidayType.Add1PartOf26, name: '+1/26 av månedslønn'},
                {id: WageDeductionDueToHolidayType.Deduct1PartOf26, name: '-1/26 av månedslønn'}
            ],
            displayProperty: 'name',
            valueProperty: 'id'
        };

        this.fields = [payInHoliday, mainAccountCostVacation, mainAccountAllocatedVacation];
    }

    private setTableConfig() {
        var rateCol = new UniTableColumn('Rate', 'Feriepengesats', UniTableColumnType.Percent);
        var rate60Col = new UniTableColumn('Rate60', 'Tilleggssats over 60 år', UniTableColumnType.Percent);
        var dateCol = new UniTableColumn('FromDate', 'Gjelder fra og med år', UniTableColumnType.Text)
            .setTemplate((rowModel) => {
                return rowModel.FromDate ? moment(rowModel.FromDate).format('YYYY') : '';
            });

        this.tableConfig = new UniTableConfig(true)
            .setColumns([rateCol, rate60Col, dateCol])
            .setPageable(this.vacationRates.length > 10)
            .setChangeCallback((event) => {
                let row = event.rowModel;
                if (event.field === 'FromDate') {
                    row.FromDate = row.FromDate && new LocalDate(row.FromDate + '-01-01');
                    return row;
                }
            });
    }
}
