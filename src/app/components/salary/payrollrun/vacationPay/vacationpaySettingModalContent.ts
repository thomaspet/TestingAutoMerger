import {Component, Input, ViewChild} from '@angular/core';
import {UniForm} from '../../../../../framework/uniform';
import {UniFieldLayout} from '../../../../../framework/uniform/index';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {CompanySalaryService, CompanyVacationRateService, AccountService} from '../../../../services/services';
import {FieldType, CompanyVacationRate, Account} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'vacationpay-setting-modal-content',
    directives: [UniForm, UniTable],
    providers: [CompanySalaryService, CompanyVacationRateService, AccountService],
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationpaysettingmodalcontent.html'
})
export class VacationpaySettingModalContent {
    private busy: boolean;
    private fields: UniFieldLayout[] = [];
    private companysalaryModel: any = {};
    @Input() private config: any;
    @ViewChild(UniTable) private table: UniTable;
    private formConfig: any = {};
    private tableConfig: UniTableConfig;
    private vacationRates: CompanyVacationRate[] = [];
    private changedVacationRates: CompanyVacationRate[] = [];
    private infoText: string;

    constructor(private _companysalaryService: CompanySalaryService, private _companyvacationRateService: CompanyVacationRateService, private _accountService: AccountService) {
        this.busy = true;
        Observable.forkJoin(
            _companysalaryService.getCompanySalary()
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
        });
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
            });
        }
        
        // save unitable
        this.changedVacationRates = this.table.getTableData();
        this.changedVacationRates.forEach(vacationRate => {
            if (vacationRate.ID > 0) {
                this._companyvacationRateService.Put(vacationRate.ID, vacationRate)
                .subscribe((response) => {
                    this.done('Feriepengesats oppdatert');
                },
                (error) => {
                    this.done('Feil ved oppdatering av feriepengepost: ' + error);
                });
            } else {
                this._companyvacationRateService.Post(vacationRate)
                .subscribe((response) => {
                    this.done('Feriepengesats lagret: ');
                },
                (error) => {
                    this.done('Feil ved lagring av feriepengepost: ' + error);
                });
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
        payInHoliday.Property = 'PaymentInterval'; //WageDeductionDueToHoliday
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
        
        this.fields = [mainAccountCostVacation, mainAccountAllocatedVacation, payInHoliday];
    }

    private setTableConfig() {
        var rateCol = new UniTableColumn('Rate', 'Feriepengesats', UniTableColumnType.Number);
        var rate60Col = new UniTableColumn('Rate60', 'Sats over 60', UniTableColumnType.Number);
        var dateCol = new UniTableColumn('FromDate', 'Gjelder fra og med år', UniTableColumnType.Date);

        this.tableConfig = new UniTableConfig(true)
        .setColumns([rateCol, rate60Col, dateCol])
        .setPageable(false);
    }
}
