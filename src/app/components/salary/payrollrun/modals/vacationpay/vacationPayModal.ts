import {Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../../framework/uniModal/barrel';
import {BasicAmount, VacationPayLine, CompanySalary, CompanyVacationRate} from '../../../../../unientities';
import {UniFieldLayout, FieldType} from '../../../../../../framework/ui/uniform/index';
import {
    UniTable, UniTableConfig, UniTableColumnType, UniTableColumn, IRowChangeEvent
} from '../../../../../../framework/ui/unitable/index';
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

interface IVacationPayHeader {
    VacationpayYear?: number;
    BasicAmount?: number;
    SixthWeek?: boolean;
    PercentPayout?: number;
}

@Component({
    selector: 'vacation-pay-modal',
    templateUrl: './vacationPayModal.html'
})

export class VacationPayModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    public infoConfig$: BehaviorSubject<IUniInfoConfig> = new BehaviorSubject<IUniInfoConfig>(
        {
            headline: 'Innstillinger'
        });

    private busy: boolean;
    private basicamountBusy: boolean;
    private vacationHeaderModel$: BehaviorSubject<IVacationPayHeader> = new BehaviorSubject({
        BasicAmount: 0,
        VacationpayYear: 1,
        SixthWeek: true,
        PercentPayout: 100
    });
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    private basicamounts: BasicAmount[] = [];
    private tableConfig: UniTableConfig;
    private totalPayout: number = 0;
    @ViewChild(UniTable) private table: UniTable;
    private vacationpayBasis: VacationPayLine[];
    private vacationBaseYear: number;
    private currentYear: number;
    private companysalary: CompanySalary;
    private saveactions: IUniSaveAction[] = [];
    private mainAction: IUniSaveAction;
    private saveIsActive: boolean;
    private createTransesIsActive: boolean;
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
    ) {}

    public ngOnInit() {
        this.busy = true;
        this.totalPayout = 0;
        this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive);

        Observable
            .forkJoin(
            this.companysalaryService.getCompanySalary(),
            this._basicamountService.getBasicAmounts(),
            this.yearService.getActiveYear())
            .finally(() => this.busy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do((response: any) => {
                let [comp, basics, financial] = response;
                this.basicamounts = basics;
                this.currentYear = financial;
                this.companysalary = comp;
                this.companysalary['_wagedeductionText'] = this._vacationpaylineService.WageDeductionDueToHolidayArray[this.companysalary.WageDeductionDueToHoliday].name;
            })
            .switchMap(() => this.vacationHeaderModel$.asObservable().take(1))
            .do(model => this.vacationHeaderModel$.next(this.setCurrentBasicAmountAndYear(model)))
            .subscribe(() => {
                this.createFormConfig();
                this.createTableConfig();
            });
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
            .do(() => {
                this.saveIsActive = false;
                this.createTransesIsActive = false;
                this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive);
            })
            .do(() => this._toastService.addToast('Feriepengelinjer lagret', ToastType.good, 4))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .switchMap(() => this.vacationHeaderModel$.asObservable().take(1))
            .subscribe(model => this.getVacationpayData(model));
    }

    public createVacationPayments() {
        this.modalService
            .confirm({
                header: 'Opprett feriepengeposter',
                message: 'Vennligst bekreft overføring av feriepengeposter til lønnsavregning '
                + this.options.data.ID
                + ` - Totalsum kr ${this.totalPayout}`,
                buttonLabels: {
                    accept: 'Overfør',
                    cancel: 'Avbryt'
                }
            })
            .onClose
            .filter(response => response === ConfirmActions.ACCEPT)
            .switchMap(response => {
                this.busy = true;
                return this._vacationpaylineService
                    .createVacationPay(
                    this.vacationBaseYear,
                    this.options.data.ID,
                    this.table.getSelectedRows()
                    ).do(() => this.closeModal(true));
            })
            .finally(() => this.busy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe();
    }

    public closeModal(update: boolean = false) {
        this.onClose.next(this.options.cancelValue || update);
    }

    public openVacationpaySettings() {
        this.modalService
            .open(VacationPaySettingsModal)
            .onClose
            .subscribe(recalc => this.recalc(recalc));
    }

    public change(value: SimpleChanges) {
        this.vacationHeaderModel$
            .asObservable()
            .take(1)
            .map(model => {
                if (value['SixthWeek']) {
                    this.vacationpayBasis.forEach((vacationPay: VacationPayLine) => {
                        if (value['SixthWeek'].currentValue) {
                            vacationPay['_IncludeSixthWeek'] = 'Ja';
                        } else {
                            vacationPay['_IncludeSixthWeek'] = 'Nei';
                        }
                        this.calcVacationPayAndUpdateWithdrawal(vacationPay, model);
                    });
                }

                if (value['PercentPayout']) {
                    let percent: number = parseFloat(value['PercentPayout'].currentValue);
                    if (isNaN(percent) || percent > 100 || percent < 1) {
                        percent = 100;
                    }
                    model.PercentPayout = percent;
                    this.calcAllWithdrawals(model);
                }

                if (value['VacationpayYear']) {
                    model = this.setCurrentBasicAmountAndYear(model);
                }
                return model;
            })
            .subscribe(model => this.vacationHeaderModel$.next(model));
    }

    public rowChanged(event: IRowChangeEvent) {
        if (event.field === 'ManualVacationPayBase') {
            this.saveIsActive = true;
        }
        this.updatetotalPay();
        this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive);
    }

    public onRowSelectionChange(event) {
        this.updatetotalPay();
        this.createTransesIsActive = this.table.getSelectedRows().length;
        this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive);
    }

    public recalc(event) {
        this.options.cancelValue = event;
        this.setUpRates(this.vacationBaseYear);
    }

    private getVacationpayData(vacationHeaderModel: IVacationPayHeader) {
        this.basicamountBusy = true;
        this._vacationpaylineService
            .getVacationpayBasis(this.vacationBaseYear, this.options.data.ID)
            .finally(() => this.basicamountBusy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((vpBasis) => {
                if (vpBasis) {
                    this.vacationpayBasis = vpBasis.map(x => {
                        if (this.empOver60(x) && vacationHeaderModel.SixthWeek) {
                            x['_IncludeSixthWeek'] = 'Ja';
                            x['_Rate'] = x.Rate60;
                            x['_VacationPay'] = x.VacationPay60;
                        } else {
                            x['_IncludeSixthWeek'] = 'Nei';
                            x['_Rate'] = x.Rate;
                            x['_VacationPay'] = x.VacationPay;
                        }
                        this.setVacationPay(x, x.VacationPay60);
                        this.calcWithdrawal(x, vacationHeaderModel);
                        return x;
                    });
                }
            });

    }

    private empOver60(rowModel: VacationPayLine) {
        if (!rowModel.Employee) {
            return false;
        }
        let birthYear = new Date(rowModel.Employee.BirthDate).getFullYear();
        return this.vacationBaseYear - birthYear >= 60;
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
        }
    }

    private setCurrentBasicAmountAndYear(headerModel: IVacationPayHeader): IVacationPayHeader {
        switch (headerModel.VacationpayYear) {
            case 1:
                this.vacationBaseYear = this.currentYear - 1;
                break;
            case 2:
                this.vacationBaseYear = this.currentYear;
                break;
            default:
                break;
        }
        var tmp = this.basicamounts.find((basicA: BasicAmount) => {
            basicA.FromDate = new Date(basicA.FromDate.toString());
            return basicA.FromDate.getFullYear() === this.vacationBaseYear;
        });

        if (tmp) {
            headerModel.BasicAmount = tmp.BasicAmountPrYear;
            this.companysalary['_BasicAmount'] = tmp.BasicAmountPrYear;
        }

        this.getVacationpayData(headerModel);
        this.setUpRates(this.vacationBaseYear);
        return headerModel;
    }

    private setUpRates(year: number) {
        this.companyVacationrateService
            .getRatesForYear(year)
            .filter(res => !!res)
            .subscribe(res => {
                this.companysalary['_Rate'] = res.Rate;
                this.companysalary['_Rate60'] = res.Rate60;
            });
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
                {id: 1, name: 'Feriepenger for i fjor'},
                {id: 2, name: 'Feriepenger for i år'}
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
        var over60Col = new UniTableColumn('', '', UniTableColumnType.Custom, false)
            .setCls('icon-column')
            .setTemplate((rowModel: VacationPayLine) => (rowModel.Age < 60)
                ? ''
                : `{#<em class="over-sixty" title="Ansatt er over 60 år" role="presentation"></em>#}#`
            )
            .setWidth('2rem');
        var nameCol = new UniTableColumn(
            'Employee.BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false).setWidth('9rem');
        var systemGrunnlagCol = new UniTableColumn(
            'SystemVacationPayBase', 'Gr.lag system', UniTableColumnType.Money, false).setWidth('8rem');
        var manuellGrunnlagCol = new UniTableColumn(
            'ManualVacationPayBase', 'Gr.lag manuelt', UniTableColumnType.Money).setWidth('8rem');
        var rateCol = new UniTableColumn('_Rate', 'Sats', UniTableColumnType.Money, false)
            .setWidth('4rem')
            .setTemplate((row: VacationPayLine) => {
                if (row['_isEmpty']) {
                    return;
                }
                if (row['_IncludeSixthWeek'] === 'Ja') {
                    return '' + row.Rate60;
                } else {
                    return '' + row.Rate;
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
                if (row['_isEmpty']) {
                    return;
                }
                if (row['_IncludeSixthWeek'] === 'Ja') {
                    return '' + row.VacationPay60;
                } else {
                    return '' + row.VacationPay;
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
                let row: VacationPayLine = event.rowModel;
                if (event.field === 'ManualVacationPayBase' || event.field === '_IncludeSixthWeek') {
                    this.updateRow(row);
                    this.calcVacationPayAndUpdateWithdrawal(row, this.vacationHeaderModel$.getValue());
                }
                if (event.field === 'Withdrawal') {
                    row['_rowSelected'] = true;
                }

                return row;
            });
    }

    private calcVacationPayAndUpdateWithdrawal(line: VacationPayLine, model: IVacationPayHeader) {
        this.calcVacationPay(line);
        this.calcWithdrawal(line, model);
    }

    private calcAllWithdrawals(model: IVacationPayHeader) {
        this.vacationpayBasis = this.vacationpayBasis.map(row => this.calcWithdrawal(row, model));
    }

    private calcWithdrawal(rowModel: VacationPayLine, model: IVacationPayHeader): VacationPayLine {
        let widthdrawal = (rowModel['_VacationPay'] - rowModel['PaidVacationPay']);
        rowModel['Withdrawal'] = Math.round(widthdrawal * model.PercentPayout / 100);
        return rowModel;
    }

    private calcVacationPay(rowModel: VacationPayLine) {
        let vacBase = rowModel.ManualVacationPayBase + rowModel.SystemVacationPayBase;
        this.setVacationPay(rowModel, Math.round(vacBase * rowModel['_Rate'] / 100));
    }

    private setVacationPay(row: VacationPayLine, vacationPay: number) {
        row['_VacationPay'] = vacationPay;
        if (this.empOver60(row)) {
            row.VacationPay60 = vacationPay;
        } else {
            row.VacationPay = vacationPay;
        }
    }

    private getSaveactions(saveIsActive: boolean, createPaymentsActive: boolean): IUniSaveAction[] {
        let ret = [
            {
                label: 'Lag feriepengeposter',
                action: this.createVacationPayments.bind(this),
                disabled: !createPaymentsActive
            },
            {
                label: 'Lagre',
                action: this.saveVacationpayLines.bind(this),
                disabled: !saveIsActive
            }
        ];
        this.mainAction = saveIsActive ? ret[1] : ret[0];
        return ret;
    }
}
