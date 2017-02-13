import { Component, Input, ViewChild } from '@angular/core';
import { BasicAmount, VacationPayInfo, VacationPayLine, FinancialYear } from '../../../../unientities';
import { UniFieldLayout, FieldType } from 'uniform-ng2/main';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';
import {
    SalaryTransactionService, BasicAmountService, PayrollrunService,
    VacationpayLineService, FinancialYearService, ErrorService } from '../../../../../app/services/services';
import { VacationpaySettingModal } from './vacationPaySettingModal';
import { ToastService, ToastType } from '../../../../../framework/uniToast/toastService';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

declare var _;

@Component({
    selector: 'vacationpay-modal-content',
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationPayModalContent.html'
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
    private config$: BehaviorSubject<any> = new BehaviorSubject({})
    private basicamounts: BasicAmount[] = [];
    private tableConfig: UniTableConfig;
    private totalPayout: number = 0;
    @ViewChild(VacationpaySettingModal) private vacationpaySettingModal: VacationpaySettingModal;
    @ViewChild(UniTable) private table: UniTable;
    private vacationpayBasis: any;
    private vacationBaseYear: number;
    private financialYearEntity: FinancialYear;
    public dueToHolidayChanged: boolean = false;

    constructor(
        private _salarytransService: SalaryTransactionService,
        private _basicamountService: BasicAmountService,
        private _payrollrunService: PayrollrunService,
        private _vacationpaylineService: VacationpayLineService,
        private _toastService: ToastService,
        private errorService: ErrorService,
        private _financialYearService: FinancialYearService
    ) {

    }

    public ngOnInit() {
        this.config$.next(this.config);
        
        this.busy = true;
        this.dueToHolidayChanged = false;
        this.totalPayout = 0;

        Observable.forkJoin(
            this._basicamountService.getBasicAmounts(),
            this._financialYearService.getActiveFinancialYear()
        )
            .subscribe((response: any) => {
                let [basics, financial] = response;
                this.basicamounts = basics;
                this.financialYearEntity = financial;

                let vacationHeaderModel = this.vacationHeaderModel$.getValue();
                vacationHeaderModel.VacationpayYear = 1;
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
        this.busy = true;
        let vacationPayInfoList: VacationPayInfo[] = [];
        let selectedVacationPayLines = this.table.getSelectedRows();
        selectedVacationPayLines.forEach((vacationPay: VacationPayLine) => {
            let vacationPayInfo: VacationPayInfo = {
                EmployeeID: vacationPay.Employee.ID,
                Withdrawal: vacationPay.Withdrawal,
                ManualVacationPayBase: vacationPay.ManualVacationPayBase
            };

            vacationPayInfoList.push(vacationPayInfo);
        });

        this._payrollrunService.createVacationPay(this.vacationBaseYear, this.config.payrollRunID, vacationPayInfoList)
            .finally(() => this.busy = false)
            .subscribe((response) => {
                this.config.submit(this.dueToHolidayChanged);
            }, err => this.errorService.handle(err));
    }

    public closeModal() {
        this.config.cancel(this.dueToHolidayChanged);
    }

    public openVacationpaySettings() {
        this.vacationpaySettingModal.openModal();
    }

    public change(value) {
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
        this._payrollrunService.getVacationpayBasis(this.vacationBaseYear, this.config.payrollRunID)
            .subscribe((vpBasis) => {
                if (vpBasis) {
                    this.vacationpayBasis = vpBasis.VacationPay;
                }
                this.basicamountBusy = false;
                this.vacationHeaderModel$.next(this.vacationHeaderModel$.getValue());
            }, err => this.errorService.handle(err));

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
                this.vacationBaseYear = this.financialYearEntity.Year - 1;
                break;
            case 2:
                this.vacationBaseYear = this.financialYearEntity.Year;
                break;
            case 3:
                this.vacationBaseYear = this.financialYearEntity.Year - 2;
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
                { id: 2, name: 'Feriepenger for i år' },
                { id: 3, name: 'Feriepenger for tidligere år' },
            ],
            labelProperty: 'name',
            valueProperty: 'id'
        };

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

        this.fields$.next([vpRadioField, basicAmountField]);
    }

    private createTableConfig() {
        var nrCol = new UniTableColumn('Employee.EmployeeNumber', 'Nr', UniTableColumnType.Text, false).setWidth('4rem');
        var nameCol = new UniTableColumn('Employee.BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);
        var systemGrunnlagCol = new UniTableColumn('SystemVacationPayBase', 'Gr.lag system', UniTableColumnType.Money, false).setWidth('8rem');
        var manuellGrunnlagCol = new UniTableColumn('ManualVacationPayBase', 'Gr.lag manuelt', UniTableColumnType.Money).setWidth('8rem');
        var rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money, false).setWidth('4rem');
        var vacationPayCol = new UniTableColumn('VacationPay', 'Feriepenger', UniTableColumnType.Money, false).setWidth('7rem');
        var earlierPayCol = new UniTableColumn('PaidVacationPay', 'Tidl utbetalt', UniTableColumnType.Money, false).setWidth('7rem');
        var payoutCol = new UniTableColumn('Withdrawal', 'Utbetales', UniTableColumnType.Money).setWidth('6rem');

        this.tableConfig = new UniTableConfig()
            .setColumns([nrCol, nameCol, systemGrunnlagCol, manuellGrunnlagCol, rateCol, vacationPayCol, earlierPayCol, payoutCol])
            .setPageable(false)
            .setMultiRowSelect(true)
            .setAutoAddNewRow(false)
            .setIsRowReadOnly((rowModel) => {
                return !rowModel.IsInCollection;
            })
            .setChangeCallback((event) => {
                let row = event.rowModel;
                if (event.field === 'ManualVacationPayBase') {
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
        let vacationpay = Math.round(vacBase * rowModel['Rate'] / 100);
        rowModel['VacationPay'] = vacationpay;
        let withdrawal = Math.round(vacationpay - rowModel['PaidVacationPay']);
        rowModel['Withdrawal'] = withdrawal;
    }
}
