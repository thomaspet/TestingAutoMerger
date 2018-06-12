import {Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../../framework/uni-modal';
import {BasicAmount, VacationPayLine, CompanySalary, EmployeeCategory} from '../../../../../unientities';
import {UniFieldLayout, FieldType} from '../../../../../../framework/ui/uniform/index';
import {
    UniTable, UniTableConfig, UniTableColumnType, UniTableColumn, IRowChangeEvent
} from '../../../../../../framework/ui/unitable/index';
import {
    SalaryTransactionService, BasicAmountService, PayrollrunService,
    VacationpayLineService, YearService, ErrorService, CompanySalaryService,
    CompanyVacationRateService, NumberFormat, VacationRateEmployeeService
} from '../../../../../../app/services/services';
import {VacationPaySettingsModal} from '../../modals/vacationpay/vacationPaySettingsModal';
import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniModalService, ConfirmActions} from '../../../../../../framework/uni-modal';
import {IUniSaveAction} from '../../../../../../framework/save/save';
import {IUniInfoConfig} from '../../../../common/uniInfo/uniInfo';
import {UniMath} from '@uni-framework/core/uniMath';

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
    @ViewChild(UniTable) private table: UniTable;
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

    public infoConfig$: BehaviorSubject<IUniInfoConfig> = new BehaviorSubject<IUniInfoConfig>(
        {
            headline: 'Innstillinger'
        });

    public busy: boolean;
    private basicamountBusy: boolean;
    public vacationHeaderModel$: BehaviorSubject<IVacationPayHeader> = new BehaviorSubject({
        BasicAmount: 0,
        VacationpayYear: 1,
        SixthWeek: true,
        PercentPayout: 100
    });
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    private basicamounts: BasicAmount[] = [];
    public tableConfig: UniTableConfig;
    public totalPayout: number = 0;

    public vacationpayBasis: VacationPayLine[];
    private vacationBaseYear: number;
    public currentYear: number;
    public companysalary: CompanySalary;
    public saveactions: IUniSaveAction[] = [];
    public mainAction: IUniSaveAction;
    private saveIsActive: boolean;
    private createTransesIsActive: boolean;
    constructor(
        private salarytransService: SalaryTransactionService,
        private basicamountService: BasicAmountService,
        private payrollrunService: PayrollrunService,
        private vacationpaylineService: VacationpayLineService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private yearService: YearService,
        private companysalaryService: CompanySalaryService,
        private companyVacationrateService: CompanyVacationRateService,
        private modalService: UniModalService,
        private numberFormat: NumberFormat,
        private vacationRateEmployeeService: VacationRateEmployeeService
    ) {}

    public ngOnInit() {
        this.busy = true;
        this.totalPayout = 0;
        this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive);

        Observable
            .forkJoin(
            this.companysalaryService.getCompanySalary(),
            this.basicamountService.getBasicAmounts(),
            this.yearService.getActiveYear())
            .finally(() => this.busy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do((response: any) => {
                const [comp, basics, financial] = response;
                this.basicamounts = basics;
                this.basicamounts.sort((a, b) => {
                    return  new Date(a.FromDate).getFullYear() - new Date(b.FromDate).getFullYear();
                });
                this.currentYear = financial;
                this.companysalary = comp;
                this.companysalary['_wagedeductionText'] = this.vacationpaylineService
                    .WageDeductionDueToHolidayArray[this.companysalary.WageDeductionDueToHoliday].name;
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
        const saveObservables: Observable<any>[] = [];
        this.vacationpayBasis.forEach(vacationpayLine => {
            vacationpayLine.ID > 0 ?
                saveObservables.push(this.vacationpaylineService.Put(vacationpayLine.ID, vacationpayLine)) :
                saveObservables.push(this.vacationpaylineService.Post(vacationpayLine));
        });

        Observable.forkJoin(saveObservables)
            .finally(() => this.busy = false)
            .do(() => {
                this.saveIsActive = false;
                this.createTransesIsActive = false;
                this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive);
            })
            .do(() => this.toastService.addToast('Feriepengelinjer lagret', ToastType.good, 4))
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
                + ` - Totalsum kr ${UniMath.useFirstTwoDecimals(this.totalPayout)}`,
                buttonLabels: {
                    accept: 'Overfør',
                    cancel: 'Avbryt'
                }
            })
            .onClose
            .filter(response => response === ConfirmActions.ACCEPT)
            .switchMap(response => {
                this.busy = true;
                return this.vacationpaylineService
                    .createVacationPay(
                    this.vacationBaseYear,
                    this.options.data.ID,
                    this.table.getSelectedRows(),
                    this.vacationHeaderModel$.getValue().SixthWeek
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
                    this.calcAllWithdrawals(model);
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
        if (event.field === 'ManualVacationPayBase' || event.field === '_Rate') {
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
        this.vacationpaylineService
            .getVacationpayBasis(this.vacationBaseYear, this.options.data.ID)
            .finally(() => this.basicamountBusy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((vpBasis) => {
                if (vpBasis) {
                    const rateCol = this.tableConfig.columns.find(x => x.header.indexOf('Sats') > -1);
                    if (!!rateCol) {
                        rateCol.header = `Sats (${this.vacationBaseYear})`;
                    }
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
                        this.recalcVacationPay(x, vacationHeaderModel);
                        return x;
                    });
                }
            });

    }

    private empOver60(rowModel: VacationPayLine) {
        if (!rowModel.Employee) {
            return false;
        }
        const empAge = this.currentYear - new Date(rowModel.Employee.BirthDate).getFullYear();
        if (empAge >= 59) {
            if (this.vacationBaseYear === this.currentYear) {
                return true;
            } else {
                return empAge >= 60;
            }
        }
    }

    public updatetotalPay() {
        this.totalPayout = 0;
        const selectedRows = this.table.getSelectedRows();
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
        this.setProperBasicAmount(headerModel);
        this.getVacationpayData(headerModel);
        this.setUpRates(this.vacationBaseYear);
        return headerModel;
    }

    private setProperBasicAmount(headerModel: IVacationPayHeader) {
        for (let i = this.basicamounts.length - 1; i >= 0; i--) {
            const ba = this.basicamounts[i];
            ba.FromDate = new Date(ba.FromDate.toString());
            if (ba.FromDate.getFullYear() <= this.vacationBaseYear) {
                headerModel.BasicAmount = ba.BasicAmountPrYear;
                this.companysalary['_BasicAmount'] = ba.BasicAmountPrYear;
                return;
            }
        }
    }

    private setUpRates(year: number) {
        this.companyVacationrateService
            .getCurrentRates(year)
            .filter(res => !!res)
            .subscribe(res => {
                this.companysalary['_Rate'] = res.Rate;
                this.companysalary['_Rate60'] = res.Rate60;
            });
    }

    private createFormConfig() {
        const vpRadioField = new UniFieldLayout();
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

        const basicAmountField = new UniFieldLayout();
        basicAmountField.FieldSet = 0;
        basicAmountField.Section = 0;
        basicAmountField.Combo = 0;
        basicAmountField.FieldType = FieldType.TEXT;
        basicAmountField.EntityType = 'vacationHeaderModel';
        basicAmountField.Property = 'BasicAmount';
        basicAmountField.Label = 'Grunnbeløp';
        basicAmountField.Options = null;
        basicAmountField.ReadOnly = true;

        const sixthWeekField = new UniFieldLayout();
        sixthWeekField.FieldSet = 0;
        sixthWeekField.Section = 0;
        sixthWeekField.Combo = 0;
        sixthWeekField.FieldType = FieldType.CHECKBOX;
        sixthWeekField.EntityType = 'vacationHeaderModel';
        sixthWeekField.Property = 'SixthWeek';
        sixthWeekField.Label = 'Inkluder 6.ferieuke';
        sixthWeekField.Options = {slideToggle: true};
        sixthWeekField.LineBreak = true;

        const percentField = new UniFieldLayout();
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
        const nrCol = new UniTableColumn('Employee.EmployeeNumber', 'Nr', UniTableColumnType.Text, false)
            .setWidth('4rem')
            .setTooltipResolver((rowModel: VacationPayLine) => {
                if (this.empOver60(rowModel)) {
                    return {
                        type: 'warn',
                        text: 'Ansatt er over 60 år'
                    };
                }
            });
        const nameCol = new UniTableColumn(
            'Employee.BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false).setWidth('9rem');
        const systemGrunnlagCol = new UniTableColumn(
            'SystemVacationPayBase', 'Gr.lag system', UniTableColumnType.Money, false).setWidth('8rem');
        const manuellGrunnlagCol = new UniTableColumn(
            'ManualVacationPayBase', 'Gr.lag manuelt', UniTableColumnType.Money).setWidth('8rem');
        const rateCol = new UniTableColumn('_Rate', `Sats (${this.vacationBaseYear})`, UniTableColumnType.Money, true)
            .setWidth('5rem')
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
        const sixthCol = new UniTableColumn('_IncludeSixthWeek', '6.ferieuke', UniTableColumnType.Select, true)
            .setWidth('4rem')
            .setOptions({
                resource: ['Ja', 'Nei']
            });
        const vacationPayCol = new UniTableColumn('_VacationPay', 'Feriepenger', UniTableColumnType.Money, false)
            .setWidth('7rem')
            .setTemplate((row: VacationPayLine) => {
                if (row['_isEmpty']) {
                    return;
                }

                if (row['_IncludeSixthWeek'] === 'Ja') {
                    return '' + UniMath.useFirstTwoDecimals(row.VacationPay60);
                } else {
                    return '' + UniMath.useFirstTwoDecimals(row.VacationPay);
                }
            });
        const earlierPayCol = new UniTableColumn('PaidVacationPay', 'Tidl utbetalt', UniTableColumnType.Money, false)
            .setWidth('7rem')
            .setTemplate((row: VacationPayLine) => '' + UniMath.useFirstTwoDecimals(row.PaidVacationPay));
        const payoutCol = new UniTableColumn('Withdrawal', 'Utbetales', UniTableColumnType.Money).setWidth('6rem');


        this.tableConfig = new UniTableConfig('salary.payrollrun.vacationpayModalContent')
            .setColumns([
                nrCol, nameCol, systemGrunnlagCol, manuellGrunnlagCol,
                rateCol, sixthCol, vacationPayCol, earlierPayCol, payoutCol])
            .setPageable(false)
            .setMultiRowSelect(true)
            .setAutoAddNewRow(false)
            .setIsRowReadOnly((rowModel) => !rowModel.IsInCollection)
            .setChangeCallback((event) => {
                const row: VacationPayLine = event.rowModel;
                if (event.field === 'ManualVacationPayBase' || event.field === '_IncludeSixthWeek') {
                    if (!row['ManualVacationPayBase']) {
                        row['ManualVacationPayBase'] = 0;
                    }

                    this.recalcVacationPay(row, this.vacationHeaderModel$.getValue());
                }
                if (event.field === 'Withdrawal') {
                    row['_rowSelected'] = true;
                }
                if (event.field === '_Rate') {
                    row['_rateChanged'] = true;
                    this.recalcVacationPay(row, this.vacationHeaderModel$.getValue(), true);
                }

                return row;
            });
    }

    private calcAllWithdrawals(model: IVacationPayHeader) {
        this.vacationpayBasis = this.vacationpayBasis.map(row => this.recalcVacationPay(row, model));
    }

    private recalcVacationPay(row: VacationPayLine, model: IVacationPayHeader, setmanually: boolean = false) {
        const vacBase = row['ManualVacationPayBase'] + row['SystemVacationPayBase'];
        const limitBasicAmount = this.companysalary['_BasicAmount'] * 6;
        this.updateAndSetRate(row, model, setmanually);
        if (model.SixthWeek && this.empOver60(row)) {
            row['_IncludeSixthWeek'] = 'Ja';
            if (vacBase > limitBasicAmount) {
                row['_VacationPay'] = row['VacationPay60'] = vacBase * row['Rate'] / 100
                + limitBasicAmount * (row.Rate60 - row.Rate) / 100;
            } else {
                row['_VacationPay'] = row['VacationPay60'] = vacBase * row['Rate60'] / 100;
            }
        } else {
            row['_IncludeSixthWeek'] = 'Nei';
            row['_VacationPay'] = row['VacationPay'] = vacBase * row['_Rate'] / 100;
        }
        const widthdrawal = (row['_VacationPay'] - row['PaidVacationPay']);
        row['Withdrawal'] = UniMath.useFirstTwoDecimals(widthdrawal * model.PercentPayout / 100);
        return row;
    }

    private updateAndSetRate(row: VacationPayLine, model: IVacationPayHeader, setManually: boolean) {
        const isOver60: boolean = this.empOver60(row);
        if (setManually) { // '_Rate'-column changed
            if (isOver60 && model.SixthWeek) {
                row['Rate'] = row['_Rate'];
                row['_Rate'] = row['_Rate'] + this.companysalary['_Rate60'];
                row['Rate60'] = row['_Rate'];
            } else {
                row['Rate'] = row['_Rate'];
                row['Rate60'] = row['_Rate'] + this.companysalary['_Rate60'];
            }
        } else {
            if (isOver60 && model.SixthWeek) {
                row['_Rate'] = row['Rate60'];
            } else {
                row['_Rate'] = row['Rate'];
            }
        }
        return row;
    }

    private getSaveactions(saveIsActive: boolean, createPaymentsActive: boolean): IUniSaveAction[] {
        const ret = [
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
