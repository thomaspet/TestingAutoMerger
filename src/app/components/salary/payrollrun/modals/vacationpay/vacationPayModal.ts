import {Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../../framework/uniModal/barrel';
import {BasicAmount, VacationPayLine, CompanySalary} from '../../../../../unientities';
import {UniFieldLayout, FieldType} from '../../../../../../framework/ui/uniform/index';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../../../framework/ui/unitable/index';
import {
    SalaryTransactionService, BasicAmountService, PayrollrunService,
    VacationpayLineService, YearService, ErrorService, CompanySalaryService,
    CompanyVacationRateService, NumberFormat
} from '../../../../../../app/services/services';
import {VacationPaySettingsModal} from '../../modals/vacationpay/vacationPaySettingsModal';
import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniModalService, ConfirmActions} from '../../../../../../framework/uniModal/barrel';
import {IUniSaveAction} from '../../../../../../framework/save/save';
import {IUniInfoConfig} from '../../../../common/uniInfo/uniInfo';


@Component({
    selector: 'vacation-pay-modal',
    templateUrl: './vacationPayModal.html'
})

export class VacationPayModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    public infoConfig$: BehaviorSubject<IUniInfoConfig> = new BehaviorSubject<IUniInfoConfig>({ headline: 'Innstillinger' });
    private busy: boolean;
    private basicamountBusy: boolean;
    private vacationHeaderModel$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    private basicamounts: BasicAmount[] = [];
    private tableConfig: UniTableConfig;
    private totalPayout: number = 0;
    @ViewChild(UniTable) private table: UniTable;
    private vacationpayBasis: VacationPayLine[];
    private vacationBaseYear: number;
    private financialYearEntity: number;
    public dueToHolidayChanged: boolean = false;
    private percentPayout: number = 100;
    private companysalary: CompanySalary;
    private rates: any[] = [];
    private saveactions: IUniSaveAction[] = [];
    constructor(
        private _salarytransService: SalaryTransactionService,
        private _basicamountService: BasicAmountService,
        private _payrollrunService: PayrollrunService,
        private _vacationpaylineService: VacationpayLineService,
        private _toastService: ToastService,
        private errorService: ErrorService,
        private yearService: YearService,
        private companysalaryService: CompanySalaryService,
        private companyVacationrateService: CompanyVacationRateService,
        private modalService: UniModalService,
        private numberFormat: NumberFormat
    ) { }

    public ngOnInit() {
        this.busy = true;
        this.dueToHolidayChanged = false;
        this.totalPayout = 0;
        this.saveactions = this.getSaveactions();

        Observable
            .forkJoin(
            this.companyVacationrateService.GetAll(''),
            this.companysalaryService.getCompanySalary(),
            this._basicamountService.getBasicAmounts(),
            this.yearService.getActiveYear())
            .subscribe((response: any) => {
                let [rates, comp, basics, financial] = response;
                this.basicamounts = basics;
                this.financialYearEntity = financial;
                this.companysalary = comp;
                this.companysalary['_wagedeductionText'] = this._vacationpaylineService.WageDeductionDueToHolidayArray[this.companysalary.WageDeductionDueToHoliday].name;
                this.rates = rates;
                let vacationHeaderModel = this.vacationHeaderModel$.getValue();
                vacationHeaderModel.VacationpayYear = 1;
                vacationHeaderModel.SixthWeek = true;
                vacationHeaderModel.PercentPayout = this.percentPayout;
                this.vacationHeaderModel$.next(vacationHeaderModel);
                this.setCurrentBasicAmountAndYear();

                this.createFormConfig();
                this.createTableConfig();


                this.busy = false;
            }, err => this.errorService.handle(err));
    }

    public saveVacationpayLines() {
        this.busy = true;
        this.vacationpayBasis = this.table.getTableData();
        let saveObservables: Observable<any>[] = [];
        this.vacationpayBasis.forEach(vacationpayLine => {
            vacationpayLine.ID > 0 ?
                saveObservables.push(this._vacationpaylineService.Put(vacationpayLine.ID, vacationpayLine)) :
                saveObservables.push(this._vacationpaylineService.Post(vacationpayLine));

        });

        Observable.forkJoin(saveObservables)
            .finally(() => this.busy = false)
            .subscribe(allSavedResponse => {
                this._toastService.addToast('Feriepengelinjer lagret', ToastType.good, 4);
            }, err => this.errorService.handle(err));
    }

    public createVacationPayments() {
        this.modalService.confirm({
            header: 'Opprett feriepengeposter',
            message: 'Vennligst bekreft overføring av feriepengeposter til lønnsavregning '
            + this.options.data.ID
            + ` - Totalsum kr ${this.totalPayout}`,
            buttonLabels: {
                accept: 'Overfør',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.busy = true;

                this._vacationpaylineService.createVacationPay(
                    this.vacationBaseYear,
                    this.options.data.ID,
                    this.table.getSelectedRows()
                ).finally(() => this.busy = false)
                    .finally(() => this.closeModal())
                    .subscribe(
                    res => {
                        let config = this.options.modalConfig;
                        if (config && config.update) {
                            config.update();
                        }
                    },
                    err => this.errorService.handle(err)
                    );
            }
        });
    }

    public closeModal() {
        this.onClose.next(this.dueToHolidayChanged);
    }

    public openVacationpaySettings() {
        this.modalService
            .open(VacationPaySettingsModal)
            .onClose
            .subscribe(recalc => this.recalc(recalc));
    }

    public change(value: SimpleChanges) {
        if (value['SixthWeek']) {
            this.vacationpayBasis.forEach((vacationPay: VacationPayLine) => {
                if (value['SixthWeek'].currentValue === true) {
                    vacationPay['_IncludeSixthWeek'] = 'Ja';
                } else {
                    vacationPay['_IncludeSixthWeek'] = 'Nei';
                }
                this.calcWithdrawal(vacationPay);
            });
        }

        if (value['PercentPayout']) {
            let percent: number = parseFloat(value['PercentPayout'].currentValue);
            if (isNaN(percent) || percent > 100 || percent < 1) {
                percent = 100;
            }
            this.percentPayout = this.vacationHeaderModel$.getValue().PercentPayout = percent;
        }

        this.setCurrentBasicAmountAndYear();
    }

    public rowChanged(event) {
        this.updatetotalPay();
    }

    public onRowSelectionChange(event) {
        this.updatetotalPay();
    }

    public recalc(event) {
        this.dueToHolidayChanged = event;
    }

    private getVacationpayData() {
        this.basicamountBusy = true;
        this._vacationpaylineService.getVacationpayBasis(this.vacationBaseYear, this.options.data.ID)
            .subscribe((vpBasis) => {
                if (vpBasis) {
                    this.vacationpayBasis = vpBasis.map(x => {
                        if (this.empOver60(x) === true && this.vacationHeaderModel$.getValue().SixthWeek === true) {
                            x['_IncludeSixthWeek'] = 'Ja';
                            x['_Rate'] = x.Rate60;
                            x['_VacationPay'] = x.VacationPay60;
                        } else {
                            x['_IncludeSixthWeek'] = 'Nei';
                            x['_Rate'] = x.Rate;
                            x['_VacationPay'] = x.VacationPay;
                        }
                        this.calcWithdrawal(x);
                        return x;
                    });
                }
                this.basicamountBusy = false;
                this.vacationHeaderModel$.next(this.vacationHeaderModel$.getValue());
            }, err => this.errorService.handle(err));

    }

    private empOver60(rowModel: VacationPayLine) {
        return (rowModel.VacationPay !== rowModel.VacationPay60) ? true : false;
    }

    private updateRow(row: VacationPayLine) {
        if (this.empOver60(row) && row['_IncludeSixthWeek'] === 'Ja') {
            row['_Rate'] = row.Rate60;
            row['_VacationPay'] = row.VacationPay60;
        } else {
            row['_IncludeSixthWeek'] = 'Nei';
            row['_Rate'] = row.Rate;
            row['_VacationPay'] = row.VacationPay;
        }
    }

    private updatetotalPay() {
        this.totalPayout = 0;
        let selectedRows = this.table.getSelectedRows();
        if (selectedRows.length > 0) {
            selectedRows.forEach(vacationpayLine => {
                this.totalPayout += vacationpayLine.Withdrawal;
            });
            this.saveactions = this.getSaveactions();
        }
    }

    private setCurrentBasicAmountAndYear() {
        switch (this.vacationHeaderModel$.getValue().VacationpayYear) {
            case 1:
                this.vacationBaseYear = this.financialYearEntity - 1;
                break;
            case 2:
                this.vacationBaseYear = this.financialYearEntity;
                break;
            default:
                break;
        }
        var tmp = this.basicamounts.find((basicA: BasicAmount) => {
            basicA.FromDate = new Date(basicA.FromDate.toString());
            return basicA.FromDate.getFullYear() === this.vacationBaseYear;
        });

        if (tmp) {
            this.vacationHeaderModel$.getValue().BasicAmount = this.companysalary['_BasicAmount'] = tmp.BasicAmountPrYear;
        }
        this.setRates();
        this.getVacationpayData();

    }

    private setRates() {
        let rateOfTheYear = this.rates.find((rate: any) => {
            rate.FromDate = new Date(rate.FromDate.toString());
            return rate.FromDate.getFullYear() === this.vacationBaseYear;
        });

        if (rateOfTheYear) {
            this.companysalary['_Rate'] = rateOfTheYear.Rate;
            this.companysalary['_Rate60'] = rateOfTheYear.Rate60;
        }
    }

    private createFormConfig() {
        var vpRadioField = new UniFieldLayout();
        vpRadioField.FieldSet = 0;
        vpRadioField.Section = 0;
        vpRadioField.Combo = 0;
        vpRadioField.FieldType = FieldType.RADIOGROUP;
        vpRadioField.EntityType = 'vacationHeaderModel';
        vpRadioField.Property = 'VacationpayYear';
        vpRadioField.Label = 'Generer';
        vpRadioField.Options = {
            source: [
                { id: 1, name: 'Feriepenger for i fjor' },
                { id: 2, name: 'Feriepenger for i år' }
            ],
            labelProperty: 'name',
            valueProperty: 'id'
        };
        vpRadioField.LineBreak = true;

        var basicAmountField = new UniFieldLayout();
        basicAmountField.FieldSet = 0;
        basicAmountField.Section = 0;
        basicAmountField.Combo = 0;
        basicAmountField.FieldType = FieldType.TEXT;
        basicAmountField.EntityType = 'vacationHeaderModel';
        basicAmountField.Property = 'BasicAmount';
        basicAmountField.Label = 'Grunnbeløp';
        basicAmountField.Options = null;
        basicAmountField.ReadOnly = true;

        var sixthWeekField = new UniFieldLayout();
        sixthWeekField.FieldSet = 0;
        sixthWeekField.Section = 0;
        sixthWeekField.Combo = 0;
        sixthWeekField.FieldType = FieldType.CHECKBOX;
        sixthWeekField.EntityType = 'vacationHeaderModel';
        sixthWeekField.Property = 'SixthWeek';
        sixthWeekField.Label = 'Inkluder 6.ferieuke';
        sixthWeekField.Options = null;
        sixthWeekField.Classes = 'vacationpay_sixthWeek';
        sixthWeekField.LineBreak = true;

        var percentField = new UniFieldLayout();
        percentField.FieldSet = 0;
        percentField.Section = 0;
        percentField.Combo = 0;
        percentField.FieldType = FieldType.TEXT;
        percentField.EntityType = 'vacationHeaderModel';
        percentField.Property = 'PercentPayout';
        percentField.Label = '% utbetaling av feriepenger';
        percentField.Options = null;
        percentField.Classes = 'vacationpay_percentPayout';
        percentField.LineBreak = true;

        this.fields$.next([vpRadioField, sixthWeekField, percentField]);
    }

    private createTableConfig() {
        var nrCol = new UniTableColumn(
            'Employee.EmployeeNumber', 'Nr', UniTableColumnType.Text, false).setWidth('4rem');
        var over60Col = new UniTableColumn('', '', UniTableColumnType.Custom)
            .setCls('icon-column')
            .setTemplate((rowModel: VacationPayLine) => {
                let msg = '';
                if (rowModel.Age > 59) {
                    msg = 'Ansatt er over 60 år';
                    return '{#<em class="over-sixty title="'
                        + msg
                        + '" role="presentation">'
                        + msg
                        + '</em>#}';
                } else {
                    return "{#<em role='presentation'></em>#}# ";
                }
            })
            .setWidth('2rem');
        var nameCol = new UniTableColumn(
            'Employee.BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);
        var systemGrunnlagCol = new UniTableColumn(
            'SystemVacationPayBase', 'Gr.lag system', UniTableColumnType.Money, false).setWidth('8rem');
        var manuellGrunnlagCol = new UniTableColumn(
            'ManualVacationPayBase', 'Gr.lag manuelt', UniTableColumnType.Money).setWidth('8rem');
        var rateCol = new UniTableColumn('_Rate', 'Sats', UniTableColumnType.Money, false)
            .setWidth('4rem')
            .setTemplate((row: VacationPayLine) => {
                if (row['_IncludeSixthWeek'] === 'Ja') {
                    return row.Rate60.toString();
                } else {
                    return row.Rate.toString();
                }
            });
        var sixthCol = new UniTableColumn('_IncludeSixthWeek', '6.ferieuke', UniTableColumnType.Select, true)
            .setWidth('4rem')
            .setEditorOptions({
                resource: ['Ja', 'Nei']
            });
        var vacationPayCol = new UniTableColumn('_VacationPay', 'Feriepenger', UniTableColumnType.Money, false)
            .setWidth('7rem')
            .setTemplate((row: VacationPayLine) => {
                if (row['_IncludeSixthWeek'] === 'Ja') {
                    return row.VacationPay60.toString();
                } else {
                    return row.VacationPay.toString();
                }
            });
        var earlierPayCol = new UniTableColumn('PaidVacationPay', 'Tidl utbetalt', UniTableColumnType.Money, false)
            .setWidth('7rem');
        var payoutCol = new UniTableColumn('Withdrawal', 'Utbetales', UniTableColumnType.Money).setWidth('6rem');


        this.tableConfig = new UniTableConfig('salary.payrollrun.vacationpayModalContent')
            .setColumns([
                nrCol, over60Col, nameCol, systemGrunnlagCol, manuellGrunnlagCol,
                rateCol, sixthCol, vacationPayCol, earlierPayCol, payoutCol])
            .setPageable(false)
            .setMultiRowSelect(true)
            .setAutoAddNewRow(false)
            .setIsRowReadOnly((rowModel) => !rowModel.IsInCollection)
            .setChangeCallback((event) => {
                let row = event.rowModel;
                if (event.field === 'ManualVacationPayBase' || event.field === '_IncludeSixthWeek') {
                    this.updateRow(row);
                    this.calcWithdrawal(row);
                }
                if (event.field === 'Withdrawal') {
                    row['_rowSelected'] = true;
                }

                return row;
            });
    }

    private calcWithdrawal(rowModel) {
        let vacBase = 0;
        if (rowModel['ManualVacationPayBase'] > 0) {
            vacBase = rowModel['ManualVacationPayBase'];
        } else {
            vacBase = rowModel['SystemVacationPayBase'];
        }
        let vacationpay = Math.round(vacBase * rowModel['_Rate'] / 100);
        rowModel['_VacationPay'] = vacationpay;
        let withdrawal = Math.round(vacationpay - rowModel['PaidVacationPay']);
        withdrawal = Math.round(withdrawal * this.percentPayout / 100);
        rowModel['Withdrawal'] = withdrawal;
    }

    private getSaveactions(): IUniSaveAction[] {
        return [
            {
                label: 'Lag feriepengeposter',
                action: this.createVacationPayments.bind(this),
                main: false,
                disabled: false
            },
            {
                label: 'Lagre',
                action: this.saveVacationpayLines.bind(this),
                main: true,
                disabled: !this.totalPayout
            }
        ];
    }
}
