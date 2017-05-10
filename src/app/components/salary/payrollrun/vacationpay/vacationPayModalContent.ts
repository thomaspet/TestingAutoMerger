import { Component, Input, ViewChild, SimpleChanges } from '@angular/core';
import { BasicAmount, VacationPayInfo, VacationPayLine } from '../../../../unientities';
import { UniFieldLayout, FieldType } from 'uniform-ng2/main';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';
import {
    SalaryTransactionService, BasicAmountService, PayrollrunService,
    VacationpayLineService, YearService, ErrorService } from '../../../../../app/services/services';
import { VacationpaySettingModal } from './vacationPaySettingModal';
import { ToastService, ToastType } from '../../../../../framework/uniToast/toastService';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';

declare var _;

@Component({
    selector: 'vacationpay-modal-content',
    templateUrl: './vacationPayModalContent.html'
})
export class VacationpayModalContent {
    @Input('config') private config: {
        hasCancelButton: boolean,
        cancel: (dueToHolidayChanged: boolean) => void,
        payrollRunID: number,
        submit: (dueToHolidayChanged: boolean) => void
    };
    private busy: boolean;
    private basicamountBusy: boolean;
    private vacationHeaderModel$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private basicamounts: BasicAmount[] = [];
    private tableConfig: UniTableConfig;
    private totalPayout: number = 0;
    @ViewChild(VacationpaySettingModal) private vacationpaySettingModal: VacationpaySettingModal;
    @ViewChild(UniTable) private table: UniTable;
    private vacationpayBasis: VacationPayLine[];
    private vacationBaseYear: number;
    private financialYearEntity: number;
    public dueToHolidayChanged: boolean = false;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    private percentPayout: number = 100;

    constructor(
        private _salarytransService: SalaryTransactionService,
        private _basicamountService: BasicAmountService,
        private _payrollrunService: PayrollrunService,
        private _vacationpaylineService: VacationpayLineService,
        private _toastService: ToastService,
        private errorService: ErrorService,
        private yearService: YearService
    ) {

    }

    public ngOnInit() {
        this.config$.next(this.config);
        
        this.busy = true;
        this.dueToHolidayChanged = false;
        this.totalPayout = 0;
        
        Observable
            .forkJoin(
            this._basicamountService.getBasicAmounts(),
            this.yearService.getActiveYear())
            .subscribe((response: any) => {
                let [basics, financial] = response;
                this.basicamounts = basics;
                this.financialYearEntity = financial;                
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

    public updateConfig(newConfig: {
        hasCancelButton: boolean, cancel: (dueToHolidayChanged: boolean) => void,
        payrollRunID: number, submit: (dueToHolidayChanged: boolean) => void }) {
        this.config = newConfig;
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
        this.confirmModal.confirm(`Overfører feriepengeposter til lønnsavregning ${this.config.payrollRunID}. Totalsum kr ${this.totalPayout}`,'Opprette feriepengeposter',true)
        .then( (x: ConfirmActions) => {
            if (x === ConfirmActions.ACCEPT) {
                this.busy = true;
                let vacationPayInfoList: VacationPayInfo[] = [];
                let selectedVacationPayLines = this.table.getSelectedRows();
                selectedVacationPayLines.forEach((vacationPay: VacationPayLine) => {
                    let vacationPayInfo: VacationPayInfo = {
                        EmployeeID: vacationPay.Employee.ID,
                        Withdrawal: vacationPay.Withdrawal,
                        ManualVacationPayBase: vacationPay.ManualVacationPayBase,
                        employee: vacationPay.Employee
                    };

                    vacationPayInfoList.push(vacationPayInfo);
                });

                this._vacationpaylineService.createVacationPay(this.vacationBaseYear, this.config.payrollRunID, vacationPayInfoList)
                    .finally(() => this.busy = false)
                    .subscribe((response) => {
                        this.config.submit(this.dueToHolidayChanged);
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public closeModal() {
        this.config.cancel(this.dueToHolidayChanged);
    }

    public openVacationpaySettings() {
        this.vacationpaySettingModal.openModal();
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
            let percent : number = parseFloat(value['PercentPayout'].currentValue);
            if (isNaN(percent) || percent > 100 || percent < 1) {
                percent= 100;
            }
            this.percentPayout = this.vacationHeaderModel$.getValue().PercentPayout = percent
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
        this._vacationpaylineService.getVacationpayBasis(this.vacationBaseYear, this.config.payrollRunID)
            .subscribe((vpBasis) => {
                if (vpBasis) {
                    this.vacationpayBasis = vpBasis.VacationPay.map(x => {
                        x['_rowSelected'] = x.IsInCollection;
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
            this.vacationHeaderModel$.getValue().BasicAmount = tmp.BasicAmountPrYear;
        }

        this.getVacationpayData();

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

        var percentField = new UniFieldLayout();
        percentField.FieldSet = 0;
        percentField.Section = 0;
        percentField.Combo = 0;
        percentField.FieldType = FieldType.TEXT;
        percentField.EntityType = 'vacationHeaderModel';
        percentField.Property = 'PercentPayout';
        percentField.Label = '% utbetaling av feriepenger';
        percentField.Options = null;

        this.fields$.next([vpRadioField, basicAmountField, sixthWeekField, percentField]);
    }

    private createTableConfig() {
        var nrCol = new UniTableColumn('Employee.EmployeeNumber', 'Nr', UniTableColumnType.Text, false).setWidth('4rem');
        var nameCol = new UniTableColumn('Employee.BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);
        var systemGrunnlagCol = new UniTableColumn('SystemVacationPayBase', 'Gr.lag system', UniTableColumnType.Money, false).setWidth('8rem');
        var manuellGrunnlagCol = new UniTableColumn('ManualVacationPayBase', 'Gr.lag manuelt', UniTableColumnType.Money).setWidth('8rem');
        var rateCol = new UniTableColumn('_Rate', 'Sats', UniTableColumnType.Money, false)
            .setWidth('4rem')
            .setTemplate((row: VacationPayLine) => {
                if(row['_IncludeSixthWeek'] === 'Ja') {
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
                if(row['_IncludeSixthWeek'] === 'Ja') {
                    return row.VacationPay60.toString();
                } else {
                    return row.VacationPay.toString();
                }
            });
        var earlierPayCol = new UniTableColumn('PaidVacationPay', 'Tidl utbetalt', UniTableColumnType.Money, false).setWidth('7rem');
        var payoutCol = new UniTableColumn('Withdrawal', 'Utbetales', UniTableColumnType.Money).setWidth('6rem');

        this.tableConfig = new UniTableConfig()
            .setColumns([
                nrCol, nameCol, systemGrunnlagCol, manuellGrunnlagCol, 
                rateCol, sixthCol, vacationPayCol, earlierPayCol, payoutCol])
            .setPageable(false)
            .setMultiRowSelect(true)
            .setAutoAddNewRow(false)
            .setIsRowReadOnly((rowModel) => !rowModel.IsInCollection)
            .setChangeCallback((event) => {
                let row = event.rowModel;
                if (event.field === 'ManualVacationPayBase' || event.field === '_IncludeSixthWeek') {
                    this.updateRow(row)
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
}
