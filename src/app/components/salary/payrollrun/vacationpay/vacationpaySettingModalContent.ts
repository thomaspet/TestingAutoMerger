import {Component, Input, ViewChild} from '@angular/core';
import {UniForm} from '../../../../../framework/uniform';
import {UniFieldLayout} from '../../../../../framework/uniform/index';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {CompanySalaryService, CompanyVacationRateService, AccountService} from '../../../../services/services';
import {FieldType, CompanyVacationRate, Account} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import moment from 'moment';
import {ErrorService} from '../../../../services/common/ErrorService';

@Component({
    selector: 'vacationpay-setting-modal-content',
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationpaySettingModalContent.html'
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
            this._companysalaryService.getCompanySalary()
            , this._companyvacationRateService.GetAll('')
        ).subscribe((response: any) => {
            var [compsal, rates] = response;
            this.companysalaryModel = compsal[0];
            this.vacationRates = rates;
            this.formConfig = {
                submitText: ''
            };
            this.setFormFields();
            this.setTableConfig();
            this.busy = false;
        }, this.errorService.handle);
    }

    public ready(value) {

    }

    public change(value) {

    }

    public saveSettings() {
        // save uniform
        if (this.companysalaryModel.ID > 0) {
            this._companysalaryService.Put(this.companysalaryModel.ID, this.companysalaryModel)
            .subscribe((formresponse) => {
                this.done('Firmalønn oppdatert');
            }, this.errorService.handle);
        }
        
        // save unitable
        this.changedVacationRates = this.table.getTableData();
        this.changedVacationRates.forEach(vacationRate => {
            if (vacationRate.ID > 0) {
                this._companyvacationRateService.Put(vacationRate.ID, vacationRate)
                .subscribe((response) => {
                    this.done('Feriepengesats oppdatert');
                },
                    this.errorService.handle);
            } else {
                this._companyvacationRateService.Post(vacationRate)
                .subscribe((response) => {
                    this.done('Feriepengesats lagret: ');
                },
                    this.errorService.handle);
            }
        });
    }

    private done(infotext: string) {
        this.infoText = infotext;
    }

    private setFormFields() {

        var mainAccountCostVacation = new UniFieldLayout();
        mainAccountCostVacation.Label = 'Kostnad feriepenger';
        mainAccountCostVacation.Property = 'MainAccountCostVacation';
        mainAccountCostVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountCostVacation.Options = {
            source: this._accountService,
            search: (query: string) => this._accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`),
            displayProperty: 'AccountName',
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };
        
        var mainAccountAllocatedVacation = new UniFieldLayout();
        mainAccountAllocatedVacation.Label = 'Avsatt feriepenger';
        mainAccountAllocatedVacation.Property = 'MainAccountAllocatedVacation';
        mainAccountAllocatedVacation.FieldType = FieldType.AUTOCOMPLETE;
        mainAccountAllocatedVacation.Options = {
            source: this._accountService,
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
                {id: 1, name: '-4/26 av månedslønn'},
                {id: 2, name: '-3/22 av månedslønn'},
                {id: 3, name: '+1/26 av månedslønn'},
                {id: 4, name: '-1/26 av månedslønn'}
            ],
            displayProperty: 'name',
            valueProperty: 'id'
        };
        
        this.fields = [payInHoliday, mainAccountCostVacation, mainAccountAllocatedVacation];
    }

    private setTableConfig() {
        var rateCol = new UniTableColumn('Rate', 'Feriepengesats', UniTableColumnType.Percent);
        var rate60Col = new UniTableColumn('Rate60', 'Sats over 60', UniTableColumnType.Percent);
        var dateCol = new UniTableColumn('FromDate', 'Gjelder fra og med år', UniTableColumnType.Number)
            .setTemplate((rowModel) => {
                return rowModel.FromDate ? moment(rowModel.FromDate).format('YYYY') : '';
            });

        this.tableConfig = new UniTableConfig(true)
        .setColumns([rateCol, rate60Col, dateCol])
        .setPageable(this.vacationRates.length > 10)
        .setChangeCallback((event) => {
            let row = event.rowModel;
            if (event.field === 'FromDate') {
                let newDate = new Date(row.FromDate, 0, 1, 12);
                row.FromDate = newDate;
                return row;
            }
        });
    }
}
