import {Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../../framework/uni-modal';
import {BasicAmount, VacationPayLine, CompanySalary, CompanyVacationRate, } from '../../../../../unientities';
import {UniFieldLayout, FieldType} from '../../../../../../framework/ui/uniform/index';
import {
    UniTableConfig, UniTableColumnType, UniTableColumn, IRowChangeEvent
} from '../../../../../../framework/ui/unitable/index';
import {
    BasicAmountService, VacationpayLineService, FinancialYearService, ErrorService, CompanySalaryService, CompanyVacationRateService, IVacationPayLine,
} from '../../../../../../app/services/services';
import {VacationPaySettingsModal, IVacationPaySettingsReturn} from '../../modals/vacationpay/vacationPaySettingsModal';
import {ToastService, ToastType, ToastTime} from '../../../../../../framework/uniToast/toastService';
import {Observable, of, forkJoin} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {UniModalService, ConfirmActions} from '../../../../../../framework/uni-modal';
import {IUniSaveAction} from '../../../../../../framework/save/save';
import {IUniInfoConfig} from '@uni-framework/uniInfo/uniInfo';
import {UniMath} from '@uni-framework/core/uniMath';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {filter, tap, switchMap, map, finalize, take, catchError} from 'rxjs/operators';

interface IVacationPayHeader {
    VacationpayYear?: number;
    BasicAmount?: number;
    SixthWeek?: boolean;
    PercentPayout?: number;
}

@Component({
    selector: 'vacation-pay-modal',
    templateUrl: './vacationPayModal.html',
})

export class VacationPayModal implements OnInit, IUniModal {
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;
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

    public vacationpayBasis: IVacationPayLine[];
    private vacationBaseYear: number;
    public currentYear: number;
    public companysalary: CompanySalary;
    public saveactions: IUniSaveAction[] = [];
    public mainAction: IUniSaveAction;
    private saveIsActive: boolean;
    private createTransesIsActive: boolean;
    private runID: number;
    constructor(
        private basicamountService: BasicAmountService,
        private vacationpaylineService: VacationpayLineService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private companysalaryService: CompanySalaryService,
        private companyVacationrateService: CompanyVacationRateService,
        private modalService: UniModalService,
    ) {}

    public ngOnInit() {
        this.busy = true;
        this.totalPayout = 0;
        this.runID = this.options && this.options.data && this.options.data.ID;
        this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive, this.runID);

        this.currentYear = this.financialYearService.getActiveYear();

        Observable
            .forkJoin(
            this.companysalaryService.getCompanySalary(),
            this.basicamountService.getBasicAmounts())
            .finally(() => this.busy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do((response: any) => {
                const [comp, basics] = response;
                this.basicamounts = basics;
                this.basicamounts.sort((a, b) => {
                    return  new Date(a.FromDate).getFullYear() - new Date(b.FromDate).getFullYear();
                });
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
        this.saveVacationpayLinesObs()
            .switchMap(() => this.vacationHeaderModel$.asObservable().take(1))
            .subscribe(model => this.getVacationpayData(model));
    }

    public saveVacationpayLinesObs(): Observable<VacationPayLine[]> {
        this.busy = true;
        this.vacationpayBasis = this.table.getTableData();
        const saveObservables: Observable<any>[] = [];
        this.vacationpayBasis.forEach(vacationpayLine => {
            vacationpayLine.ID > 0 ?
                saveObservables.push(this.vacationpaylineService.Put(vacationpayLine.ID, vacationpayLine)) :
                saveObservables.push(this.vacationpaylineService.Post(vacationpayLine));
        });

        return Observable.forkJoin(saveObservables)
            .finally(() => this.busy = false)
            .do(() => {
                this.saveIsActive = false;
                this.createTransesIsActive = false;
                this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive, this.runID);
            })
            .do(() => this.toastService.addToast('Feriepengelinjer lagret', ToastType.good, 4))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public createVacationPayments() {
        this.modalService
            .confirm({
                header: 'Opprett feriepengeposter',
                message: 'Vennligst bekreft overføring av feriepengeposter til lønnsavregning '
                + this.runID
                + ` - Totalsum kr ${UniMath.useFirstTwoDecimals(this.totalPayout)}`,
                buttonLabels: {
                    accept: 'Overfør',
                    cancel: 'Avbryt'
                }
            })
            .onClose
            .filter(response => response === ConfirmActions.ACCEPT)
            .pipe(tap(() => {
                if (this.isEarlierPay(this.currentYear, this.vacationBaseYear)) {
                    return;
                }
                const rows: IVacationPayLine[] = this.table.getSelectedRows();
                let msg = '';
                const missingEarlierPayments = rows
                    .filter(row => {
                        if (!!row.VacationInfos) {
                            return row
                                .VacationInfos
                                .filter(x => x.BaseYear < this.currentYear - 1)
                                .some(x => !x.IsPayed);
                        }
                        return false;
                    });

                if (missingEarlierPayments.length) {
                    const last = missingEarlierPayments.pop();

                    msg += missingEarlierPayments
                        .map(row => `${row.Employee.EmployeeNumber} - ${row.Employee.BusinessRelationInfo.Name}`)
                        .join(', ');

                    msg += `${(msg ? ' og ' : '')}${last.Employee.EmployeeNumber} - ${last.Employee.BusinessRelationInfo.Name}`;

                    msg += ', har utbetalinger fra tidligere år som venter og blir derfor ikke med i denne overføringen';
                }
                if (msg) {
                    this.toastService.addToast('Mangler tidligere utbetaling', ToastType.warn, ToastTime.forever, msg);
                }
            }))
            .switchMap(response => {
                this.busy = true;
                return this.vacationpaylineService
                    .createVacationPay(
                    this.vacationBaseYear,
                    this.runID,
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
        if (event.field === '_ManualVacationPayBase' || event.field === '_Rate') {
            this.saveIsActive = true;
        }
        this.updatetotalPay();
        this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive, this.runID);
    }

    public onRowSelectionChange(event) {
        this.updatetotalPay();
        this.createTransesIsActive = !!this.table.getSelectedRows().length;
        this.saveactions = this.getSaveactions(this.saveIsActive, this.createTransesIsActive, this.runID);
    }

    public recalc(event: IVacationPaySettingsReturn) {
        this.options.cancelValue = event.dueToHolidayChanged;
        if (!event.needVacationPayRefresh) {
            this.vacationpaylineService.invalidateCache();
            this.refreshVacationPay();
        } else {
            this.setUpRates(this.vacationBaseYear);
        }
    }



    private getVacationpayData(vacationHeaderModel: IVacationPayHeader) {
        this.getVacationPayDataObs(vacationHeaderModel).subscribe();
    }
    private getVacationPayDataObs(vacationHeaderModel: IVacationPayHeader) {
        this.basicamountBusy = true;
        this.saveIsActive = false;
        return this.vacationpaylineService
            .getVacationpayBasis(this.vacationBaseYear, this.runID)
            .pipe(
                finalize(() => this.basicamountBusy = false),
                catchError((err, obs) => this.errorService.handleRxCatch(err, obs)),
                tap(vpBasis => {
                    if (!!this.vacationpayBasis) {
                        return;
                    }
                    this.createFormConfig(vpBasis);
                }),
                tap(vpBasis => {
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
                            x['_ManualVacationPayBase'] = this.vacationpaylineService.manualVacationPayBase(x);
                            return this.recalcVacationPay(x, vacationHeaderModel);
                        });

                    }

                })
            );
    }
    private empOver60(rowModel: VacationPayLine) {
        if (!rowModel.Employee) {
            return false;
        }
        const empAge = rowModel.Year - new Date(rowModel.Employee.BirthDate).getFullYear();
        if (empAge >= 59) {
            if (this.vacationBaseYear === rowModel.Year) {
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

    private refreshVacationPay() {
        this.busy = true;
        this.companysalaryService
            .getCompanySalary()
            .pipe(
                tap(compSal => this.companysalary = compSal),
                switchMap(() => this.vacationHeaderModel$),
                take(1)
            )
            .subscribe(model => this.setCurrentBasicAmountAndYear(model));
    }

    private setCurrentBasicAmountAndYear(headerModel: IVacationPayHeader): IVacationPayHeader {
        switch (headerModel.VacationpayYear) {
            case 1:
                this.vacationBaseYear = this.currentYear - 1;
                break;
            case 2:
                this.vacationBaseYear = this.currentYear;
                break;
            case 3:
                this.vacationBaseYear = this.currentYear - 2;
                break;
            default:
                break;
        }

        this.busy = true;
        forkJoin(
            this.promptUserIfNeededAndGetDataObs(headerModel),
            this.setUpRatesObs(this.vacationBaseYear)
        )
        .pipe(finalize(() => this.busy = false))
        .subscribe();

        this.setProperBasicAmount(headerModel);
        return headerModel;
    }

    private promptUserIfNeededAndGetDataObs(headerModel: IVacationPayHeader) {
        return of(this.saveIsActive)
            .pipe(
                tap(activeSave => {
                    if (!activeSave) {return; }
                    this.fields$.next(this.fields$.getValue().map(field => {
                        field.ReadOnly = true;
                        return field;
                    }));
                }),
                switchMap(activeSave =>
                    activeSave
                        ? this.modalService.confirm(
                            {
                                header: 'Lagre',
                                message: 'Du har ulagrede endringer, vil du lagre?',
                                buttonLabels: {accept: 'Lagre', reject: 'Forkast'}
                            })
                            .onClose
                        : of(ConfirmActions.REJECT)),
                map(result => result === ConfirmActions.ACCEPT),
                switchMap(save => {
                    if (!save) {
                        return of(null);
                    }
                    return this.saveVacationpayLinesObs();
                }),
                tap(() => {
                    const fields = this.fields$.getValue();
                    if (fields.some(field => field.ReadOnly)) {
                        fields.forEach(field => field.ReadOnly = false);
                        this.fields$.next(fields);
                    }
                }),
                switchMap(() => this.getVacationPayDataObs(headerModel))
            );
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
        this.setUpRatesObs(year)
            .subscribe();
    }

    private setUpRatesObs(year: number) {
        return this.companyVacationrateService
            .getCurrentRates(year)
            .pipe(
                filter(res => !!res),
                tap(res => {
                    this.companysalary['_Rate'] = res.Rate;
                    this.companysalary['_Rate60'] = res.Rate60;
                }),
            );
    }

    private createFormConfig(lines: IVacationPayLine[] = []) {
        const vpRadioField = new UniFieldLayout();
        vpRadioField.FieldSet = 0;
        vpRadioField.Section = 0;
        vpRadioField.Combo = 0;
        vpRadioField.FieldType = FieldType.RADIOGROUP;
        vpRadioField.EntityType = 'vacationHeaderModel';
        vpRadioField.Property = 'VacationpayYear';
        vpRadioField.Label = this.runID ? 'Generer' : 'Vis';
        vpRadioField.Options = {
            source: [
                {id: 1, name: 'Feriepenger for i fjor'},
                {id: 2, name: 'Feriepenger for i år'},
            ],
            labelProperty: 'name',
            valueProperty: 'id'
        };
        vpRadioField.LineBreak = true;
        const unpayedEarlierYears = lines
            .some(line => {
                if (!!line.VacationInfos) {
                    return line
                        .VacationInfos
                        .filter(x => this.isEarlierPay(this.currentYear, x.BaseYear))
                        .some(info => !info.IsPayed);
                }
                return false;
            });

        if (unpayedEarlierYears) {
            vpRadioField.Options.source.push({id: 3, name: 'Feriepenger for tidligere år'});
        }

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

        this.fields$.next([vpRadioField, sixthWeekField, percentField].filter(f => this.runID || f.Property === 'VacationpayYear'));
    }

    private createTableConfig() {
        const nrCol = new UniTableColumn('Employee.EmployeeNumber', 'Nr', UniTableColumnType.Text, false)
            .setTooltipResolver((rowModel: VacationPayLine) => {
                if (this.empOver60(rowModel)) {
                    return {
                        type: 'warn',
                        text: 'Ansatt er over 60 år'
                    };
                }
            });
        const nameCol = new UniTableColumn(
            'Employee.BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);
        const systemGrunnlagCol = new UniTableColumn(
            'SystemVacationPayBase', 'Gr.lag system', UniTableColumnType.Money, false);
        const manuellGrunnlagCol = new UniTableColumn(
            '_ManualVacationPayBase', 'Gr.lag manuelt', UniTableColumnType.Money);
        const rateCol = new UniTableColumn('_Rate', `Sats (${this.vacationBaseYear})`, UniTableColumnType.Money, true)
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
            .setOptions({
                resource: ['Ja', 'Nei']
            });
        const vacationPayCol = new UniTableColumn('_VacationPay', 'Feriepenger', UniTableColumnType.Money, false)
            .setTemplate((row: VacationPayLine) => {
                if (row['_isEmpty']) {
                    return;
                }

                return '' + UniMath.useFirstTwoDecimals(row['_VacationPay']);
            });
        const earlierPayCol = new UniTableColumn('PaidVacationPay', 'Tidl utbetalt', UniTableColumnType.Money, false)
            .setTemplate((row: VacationPayLine) => '' + UniMath.useFirstTwoDecimals(row.PaidVacationPay));
        const payoutCol = new UniTableColumn('Withdrawal', 'Utbetales', UniTableColumnType.Money).setWidth('6rem');


        this.tableConfig = new UniTableConfig('salary.payrollrun.vacationpayModalContent')
            .setColumns([
                nrCol, nameCol, systemGrunnlagCol, manuellGrunnlagCol,
                rateCol, sixthCol, vacationPayCol, earlierPayCol, payoutCol])
            .setPageable(false)
            .setSearchable(true)
            .setMultiRowSelect(true)
            .setAutoAddNewRow(false)
            .setIsRowReadOnly((rowModel) => !rowModel.IsInCollection)
            .setChangeCallback((event) => {
                const row: IVacationPayLine = event.rowModel;

                if (event.field === '_ManualVacationPayBase' || event.field === '_IncludeSixthWeek') {
                    if (!row.ManualVacationPayBase) {
                        row.ManualVacationPayBase = 0;
                    }

                    row.ManualVacationPayBase = this.isEarlierPay(this.currentYear, row.Year)
                        ? Math.max(row['_ManualVacationPayBase'] - this.vacationpaylineService.sumUpPrevInfo(row, 'ManualBase'), 0)
                        : row['_ManualVacationPayBase'];

                    row['_ManualVacationPayBase'] = this.vacationpaylineService.manualVacationPayBase(row);

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

    private recalcVacationPay(row: IVacationPayLine, model: IVacationPayHeader, setManually?: boolean) {
        row['_VacationPay'] = 0;
        row.Withdrawal = 0;
        this.recalcVacationPayForYear(row, model, setManually);
        if (!this.isEarlierPay(this.currentYear, row.Year)) {
            row.Withdrawal = this.getWidthdrawal(row, model);
            return row;
        }

        row['_VacationPay'] += model.SixthWeek
            ? this.vacationpaylineService.sumUpPrevInfo(row, 'VacationPay60')
            : this.vacationpaylineService.sumUpPrevInfo(row, 'VacationPay');
        row.Withdrawal = this.getWidthdrawal(row, model);

        return row;
    }

    private isEarlierPay(currentYear: number, baseYear: number) {
        return baseYear < (currentYear - 1);
    }

    private recalcVacationPayForYear(row: IVacationPayLine, model: IVacationPayHeader, setmanually: boolean = false) {
        const info = !!row.VacationInfos && row.VacationInfos.find(i => i.BaseYear === row.Year);
        const vacBase = row['ManualVacationPayBase'] + (info && info.SystemBase || row['SystemVacationPayBase']);
        const limitBasicAmount = this.companysalary['_BasicAmount'] * 6;
        this.updateAndSetRate(row, model, setmanually);
        if (model.SixthWeek && this.empOver60(row)) {
            row['_IncludeSixthWeek'] = 'Ja';
            if (vacBase > limitBasicAmount && !this.companysalary.AllowOver6G) {
                row['_VacationPay'] += row['VacationPay60'] = this.calcVacation(vacBase, row.Rate)
                    + this.calcVacation(limitBasicAmount, row.Rate60 - row.Rate);
            } else {
                row['_VacationPay'] += row['VacationPay60'] = this.calcVacation(vacBase, row.Rate60);
            }
        } else {
            row['_IncludeSixthWeek'] = 'Nei';
            row['_VacationPay'] += row['VacationPay'] = this.calcVacation(vacBase, row['_Rate']);
        }

        return row;
    }

    private calcVacation(base: number, rate: number) {
        const percentAdjustment = 100;
        let decimals = base && base.toString().split('.')[1];
        const basePrecision = Math.pow(10, decimals ? decimals.length : 1);
        decimals = rate && rate.toString().split('.')[1];
        const ratePrecision = Math.pow(10, decimals ? decimals.length : 1);
        return Math.round(basePrecision * base * ratePrecision * rate)
            / (basePrecision * ratePrecision * percentAdjustment);
    }

    private getWidthdrawal(row: IVacationPayLine, model: IVacationPayHeader) {
        const widthdrawal = row.Withdrawal + (row['_VacationPay'] - row['PaidVacationPay']);
        return UniMath.useFirstTwoDecimals(widthdrawal * model.PercentPayout / 100);
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

    private getSaveactions(saveIsActive: boolean, createPaymentsActive: boolean, runID: number): IUniSaveAction[] {
        const createVacationTranses = {
            label: 'Lag feriepengeposter',
            action: this.createVacationPayments.bind(this),
            disabled: !createPaymentsActive
        };
        const saveVacation = {
            label: 'Lagre',
            action: this.saveVacationpayLines.bind(this),
            disabled: !saveIsActive
        };
        const ret = [];

        if (runID) {
            ret.push(createVacationTranses);
        }
        ret.push(saveVacation);

        if (runID) {
            this.mainAction = saveIsActive ? ret[1] : ret[0];
        } else {
            this.mainAction = saveVacation;
        }

        return ret;
    }
}
