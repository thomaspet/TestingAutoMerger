import {Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges} from '@angular/core';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform/index';
import {VacationPaySettingsModal, IVacationPaySettingsReturn} from './vacationPaySettingsModal';
import {Observable, of, forkJoin} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {IUniInfoConfig} from '@uni-framework/uniInfo/uniInfo';
import {UniMath} from '@uni-framework/core/uniMath';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {filter, tap, switchMap, map, finalize, take, catchError} from 'rxjs/operators';
import { UniTableConfig, IRowChangeEvent, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { BasicAmountService, VacationpayLineService, ErrorService,
    FinancialYearService, CompanySalaryService, CompanyVacationRateService } from '@app/services/services';
import { IUniModal, IModalOptions, UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { IUniSaveAction } from '@uni-framework/save/save';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { BasicAmount, VacationPayLine, CompanySalary } from '@uni-entities';

const DIRTY = '_Dirty';

interface IVacationPayHeader {
    VacationpayYear?: number;
    BasicAmount?: number;
    SixthWeek?: boolean;
    PercentPayout?: number;
    ShowAllEmployees?: boolean;
}

@Component({
    selector: 'vacation-pay-modal',
    templateUrl: './vacationPayModal.html',
})

export class VacationPayModal implements OnInit, IUniModal {
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;
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
        PercentPayout: 100,
        ShowAllEmployees: false,
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
    public gridBusy: boolean;
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
        this.vacationpayBasis
            .filter(line => !!line[DIRTY])
            .forEach(vacationpayLine => saveObservables.push(this.vacationpaylineService.save(vacationpayLine)));

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

    public createVacationPayments(): void {
        this.OpenVacationPayCreationConfirmModal().pipe(
            filter(response => response === ConfirmActions.ACCEPT),
            switchMap(() => {
                this.canCreateVacationLine();
                this.busy = true;
                    return this.vacationpaylineService
                        .toSalary(
                            this.vacationBaseYear,
                            this.runID,
                            this.table.getSelectedRows()
                        );
            })
        ).subscribe(
            () =>  this.closeModal(true),
            (err) => this.errorService.handle(err),
            () => this.busy = false
        );
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
                    this.updateAllWithdrawals(model);
                }

                if (value['PercentPayout']) {
                    let percent: number = parseFloat(value['PercentPayout'].currentValue);
                    if (isNaN(percent) || percent > 100 || percent < 1) {
                        percent = 100;
                    }
                    model.PercentPayout = percent;
                    this.updateAllWithdrawals(model);
                }

                if (value['VacationpayYear']) {
                    model = this.setCurrentBasicAmountAndYear(model);
                }

                if (value['ShowAllEmployees']) {
                    this.getVacationpayData(model);
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

    private canCreateVacationLine(): void {
        if (this.isEarlierPay(this.currentYear, this.vacationBaseYear)) {
            return;
        }
        const rows: VacationPayLine[] = this.table.getSelectedRows();
        let msg = '';
        const missingEarlierPayments = rows
            .filter(row => !!row['MissingEarlierVacationPay']);

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
    }

    private OpenVacationPayCreationConfirmModal(): Observable<ConfirmActions> {
        return this.modalService.confirm({
            header: 'Opprett feriepengeposter',
            message: 'Vennligst bekreft overføring av feriepengeposter til lønnsavregning '
            + this.runID
            + ` - Totalsum kr ${UniMath.useFirstTwoDecimals(this.totalPayout)}`,
            buttonLabels: {
                accept: 'Overfør',
                cancel: 'Avbryt'
            }
        }).onClose;
    }

    private getVacationpayData(vacationHeaderModel: IVacationPayHeader) {
        this.getVacationPayDataObs(vacationHeaderModel).subscribe();
    }
    private getVacationPayDataObs(vacationHeaderModel: IVacationPayHeader) {
        this.basicamountBusy = true;
        this.saveIsActive = false;
        this.gridBusy = true;
        return this.vacationpaylineService
            .getVacationpayBasis(this.vacationBaseYear, this.runID, vacationHeaderModel.ShowAllEmployees)
            .pipe(
                finalize(() => {
                    this.basicamountBusy = false;
                    this.gridBusy = false;
                }),
                catchError((err, obs) => this.errorService.handleRxCatch(err, obs)),
                tap(vpBasis => {
                    if (!!this.vacationpayBasis) {
                        return;
                    }
                    this.createFormConfig(vpBasis);
                }),
                tap((vpBasis: VacationPayLine[]) => {
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

                            return this.updateVacationPayAndWithdrawal(x, vacationHeaderModel);
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
        .pipe(
            finalize(() => {
                this.createTableConfig();
                this.busy = false;
            })
        )
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

    private createFormConfig(lines: VacationPayLine[] = []) {
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
            .some(line => this.isEarlierPayline(line) || !!line['MissingEarlierVacationPay']);

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

        const showAllEmployeesField = new UniFieldLayout();
        showAllEmployeesField.FieldSet = 0;
        showAllEmployeesField.Section = 0;
        showAllEmployeesField.Combo = 0;
        showAllEmployeesField.FieldType = FieldType.CHECKBOX;
        showAllEmployeesField.EntityType = 'vacationHeaderModel';
        showAllEmployeesField.Property = 'ShowAllEmployees';
        showAllEmployeesField.Label = 'Vis ansatte uten grunnlag';
        showAllEmployeesField.Options = null;
        showAllEmployeesField.LineBreak = true;

        this.fields$
            .next([vpRadioField, sixthWeekField, percentField, showAllEmployeesField]
            .filter(f => this.runID || f.Property === 'VacationpayYear' || f.Property === 'ShowAllEmployees'));
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
            'ManualVacationPayBase', 'Gr.lag manuelt', UniTableColumnType.Money, (row: VacationPayLine) => !this.isEarlierPayline(row));
        const rateCol = new UniTableColumn(
                '_Rate', `Sats (${this.vacationBaseYear})`, UniTableColumnType.Money, (row) => !this.isEarlierPayline(row))
            .setTemplate((row: VacationPayLine) => {
                if (row['_isEmpty']) {
                    return;
                }
                if (this.empOver60(row)) {
                    return '' + row.Rate60;
                } else {
                    return '' + row.Rate;
                }
            });
        const sixthCol = new UniTableColumn(
            '_IncludeSixthWeek', '6.ferieuke', UniTableColumnType.Select, (row) => !this.isEarlierPayline(row))
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
        const payoutCol = new UniTableColumn('Withdrawal', 'Utbetales', UniTableColumnType.Money)
            .setWidth('6rem')
            .setTemplate((row: VacationPayLine) => '' + (UniMath.useFirstTwoDecimals(row.Withdrawal) || ''));


        this.tableConfig = new UniTableConfig('salary.payrollrun.vacationpayModalContent', true, true, 100)
            .setColumns([
                nrCol, nameCol, systemGrunnlagCol, manuellGrunnlagCol,
                rateCol, sixthCol, vacationPayCol, earlierPayCol, payoutCol])
            .setPageable(false)
            .setSearchable(true)
            .setMultiRowSelect(true)
            .setAutoAddNewRow(false)
            .setIsRowReadOnly((rowModel) => rowModel['_NotOnRun'])
            .setChangeCallback((event) => {
                const row: VacationPayLine = event.rowModel;
                row[DIRTY] = true;

                if (event.field === 'Withdrawal') {
                    row['_rowSelected'] = true;
                }
                if (event.field === '_Rate') {
                    row['_rateChanged'] = true;
                }

                if (event.field === '_Rate' || event.field === 'ManualVacationPayBase' || event.field === '_IncludeSixthWeek') {
                    this.updateVacationPayAndWithdrawal(row, this.vacationHeaderModel$.getValue());
                }

                return row;
            });
    }

    private isEarlierPayline(row: VacationPayLine) {
        if (!row) { return false; }
        return this.isEarlierPay(this.currentYear, row.Year);
    }

    private updateAllWithdrawals(model: IVacationPayHeader) {
        this.vacationpayBasis = this.vacationpayBasis.map(row => this.updateVacationPayAndWithdrawal(row, model));
    }

    private updateVacationPayAndWithdrawal(row: VacationPayLine, model: IVacationPayHeader) {
        this.updateVacationPay(row, model);
        row.Withdrawal = this.getWidthdrawal(row, model);
        return row;
    }

    private isEarlierPay(currentYear: number, baseYear: number) {
        return baseYear < (currentYear - 1);
    }

    private updateVacationPay(row: VacationPayLine, model: IVacationPayHeader) {
        row['_IncludeSixthWeek'] = model.SixthWeek && this.empOver60(row) ? 'Ja' : 'Nei';
        if (!this.isEarlierPayline(row) && row[DIRTY]) {
            return this.locallyCalcVacationPay(row, model);
        }
        row['_VacationPay'] = model.SixthWeek && this.empOver60(row)
            ? row.VacationPay60
            : row.VacationPay;
        return row;
    }

    private locallyCalcVacationPay(row: VacationPayLine, model: IVacationPayHeader) {
        const vacBase = row['ManualVacationPayBase'] + row['SystemVacationPayBase'];
        const limitBasicAmount = this.companysalary['_BasicAmount'] * 6;
        this.updateAndSetRate(row, model, row['_rateChanged']);
        if (model.SixthWeek && this.empOver60(row)) {
            if (vacBase > limitBasicAmount && !this.companysalary.AllowOver6G) {
                row['_VacationPay'] = row['VacationPay60'] = this.calcVacation(vacBase, row.Rate)
                    + this.calcVacation(limitBasicAmount, row.Rate60 - row.Rate);
            } else {
                row['_VacationPay'] = row['VacationPay60'] = this.calcVacation(vacBase, row.Rate60);
            }
        } else {
            row['_IncludeSixthWeek'] = 'Nei';
            row['_VacationPay'] = row['VacationPay'] = this.calcVacation(vacBase, row['_Rate']);
        }
        return row;
    }

    private calcVacation(base: number, rate: number) {
        const ofset = 10000;
        return (UniMath.round(base * ofset, 0) * UniMath.round(rate * ofset, 0)) / (100 * Math.pow(ofset, 2));
    }

    private getWidthdrawal(row: VacationPayLine, model: IVacationPayHeader) {
        return (row['_VacationPay'] - row['PaidVacationPay']) * model.PercentPayout / 100;
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
