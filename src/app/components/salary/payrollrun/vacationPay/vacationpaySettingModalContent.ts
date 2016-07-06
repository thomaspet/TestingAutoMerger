import {Component, Input, ViewChild} from '@angular/core';
import {UniForm} from '../../../../../framework/uniform';
import {UniFieldLayout} from '../../../../../framework/uniform/index';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {CompanySalaryService, CompanyVacationRateService} from '../../../../services/services';
import {FieldType, CompanyVacationRate} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'vacationpay-setting-modal-content',
    directives: [UniForm, UniTable],
    providers: [CompanySalaryService, CompanyVacationRateService],
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationpaysettingmodalcontent.html'
})
export class VacationpaySettingModalContent {
    private busy: boolean;
    private fields: UniFieldLayout[] = [];
    private companysalaryModel: any = {};
    @Input() private config: any;
    @ViewChild(UniForm) private uniform: UniForm;
    @ViewChild(UniTable) private table: UniTable;
    private formConfig: any = {};
    private tableConfig: UniTableConfig;
    private vacationRates: CompanyVacationRate[] = [];
    private changedVacationRates: CompanyVacationRate[] = [];

    constructor(private _companysalaryService: CompanySalaryService, private _companyvacationRateService: CompanyVacationRateService) {
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

    public saveSettings(done) {
        console.log('settings saved');
        this.changedVacationRates = this.table.getTableData();
        this.changedVacationRates.forEach(vacationRate => {
            if (vacationRate.ID > 0) {
                this._companyvacationRateService.Put(vacationRate.ID, vacationRate)
                .subscribe((response) => {
                    done('Feriepengesats oppdatert: ');
                },
                (error) => {
                    done('Feil ved oppdatering av feriepengepost: ', error);
                });
            } else {
                this._companyvacationRateService.Post(vacationRate)
                .subscribe((response) => {
                    done('Feriepengesats lagret: ');
                },
                (error) => {
                    done('Feil ved lagring av feriepengepost: ', error);
                });
            }
        });
    }

    private setFormFields() {

        var mainAccountCostVacation = new UniFieldLayout();
        mainAccountCostVacation.Label = 'Kostnad feriepenger';
        mainAccountCostVacation.Property = 'MainAccountCostVacation';
        mainAccountCostVacation.FieldType = FieldType.TEXT;
        
        var mainAccountAllocatedVacation = new UniFieldLayout();
        mainAccountAllocatedVacation.Label = 'Avsatt feriepenger';
        mainAccountAllocatedVacation.Property = 'MainAccountAllocatedVacation';
        mainAccountAllocatedVacation.FieldType = FieldType.TEXT;

        var payInHoliday = new UniFieldLayout();
        payInHoliday.Label = 'Fastlønn i feriemåned';
        payInHoliday.Property = 'PaymentInterval';
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
