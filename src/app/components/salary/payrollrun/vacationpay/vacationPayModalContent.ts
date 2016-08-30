import { Component, Input, ViewChild } from '@angular/core';
import { FieldType, BasicAmount, VacationPayInfo, VacationPayLine } from '../../../../unientities';
import { UniForm } from '../../../../../framework/uniform';
import { UniFieldLayout } from '../../../../../framework/uniform/index';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import { SalaryTransactionService, BasicAmountService, PayrollrunService } from '../../../../../app/services/services';
import { VacationpaySettingModal} from './vacationPaySettingModal';

declare var _;

@Component({
    selector: 'vacationpay-modal-content',
    directives: [UniForm, UniTable, VacationpaySettingModal],
    providers: [SalaryTransactionService, BasicAmountService],
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationPayModalContent.html'
})
export class VacationpayModalContent {
    @Input() private config: {hasCancelButton: boolean, cancel: any, payrollRunID: number};
    private busy: boolean;
    private basicamountBusy: boolean;
    private vacationHeaderModel: any = {};
    private fields: any[] = [];
    private basicamounts: BasicAmount[] = [];
    private tableConfig: UniTableConfig;
    private totalPayout: number;
    @ViewChild(VacationpaySettingModal) private vacationpaySettingModal: VacationpaySettingModal;
    @ViewChild(UniTable) private table: UniTable;
    private vacationpayBasis: any;
    private vacationBaseYear: number;

    constructor(private _salarytransService: SalaryTransactionService, private _basicamountService: BasicAmountService, private _payrollrunService: PayrollrunService) {
        
    }

    public load() {
        this.busy = true;
        this._basicamountService.getBasicAmounts()
            .subscribe((response: any) => {
            this.basicamounts = response;

            this.vacationHeaderModel.VacationpayYear = 1;
            this.setCurrentBasicAmountAndYear();

            this.getVacationpayData();

            this.createFormConfig();
            this.createTableConfig();
            
            this.busy = false;
        });
    }

    public updateConfig(newConfig: {hasCancelButton: boolean, cancel: any, payrollRunID: number}) {
        this.config = newConfig;
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

        this._payrollrunService.createVacationPay(this.vacationBaseYear, this.config.payrollRunID, vacationPayInfoList).subscribe((response) => {
            this.busy = false;
            this._payrollrunService.refreshPayrunID(this.config.payrollRunID);
            this.config.cancel();
        }, error => {
            this.busy = false;
            alert(error._body);
        });
    }

    public openVacationpaySettings() {
        this.vacationpaySettingModal.openModal();
    }

    public change(value) {
        this.setCurrentBasicAmountAndYear();
    }

    public ready(value) {
        // console.log('vacationpay modal form ready');
    }

    private getVacationpayData() {
        this.basicamountBusy = true;
        this._payrollrunService.getVacationpayBasis(this.vacationBaseYear, this.config.payrollRunID)
        .subscribe((vpBasis) => {
            if (vpBasis) {
                this.vacationpayBasis = vpBasis.VacationPay;
            }
            this.updatetotalPay();
            this.basicamountBusy = false;
        });

    }

    private updatetotalPay() {
        this.totalPayout = 0;
        if (this.vacationpayBasis) {
            this.vacationpayBasis.forEach(vacationpayLine => {
                this.totalPayout += vacationpayLine.Withdrawal;
            });
        }
    }

    private setCurrentBasicAmountAndYear() {
        switch (this.vacationHeaderModel.VacationpayYear) {
            // When clientyear available, remove these hardcode years
            case 1:
                this.vacationBaseYear = 2015;
                break;
            case 2:
                this.vacationBaseYear = 2016;
                break;
            case 3:
                this.vacationBaseYear = 2014;
                break;
            default:
                break;
        }
        var tmp = this.basicamounts.find((basicA: BasicAmount) => {
            basicA.FromDate = new Date(basicA.FromDate.toString());
            return basicA.FromDate.getFullYear() === this.vacationBaseYear;
        });

        if (tmp) {
            this.vacationHeaderModel.BasicAmount = tmp.BasicAmountPrYear;
        }

        this.getVacationpayData();

        this.vacationHeaderModel = _.cloneDeep(this.vacationHeaderModel);
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

        this.fields = [vpRadioField, basicAmountField];
    }

    private createTableConfig() {
        var nrCol = new UniTableColumn('Employee.EmployeeNumber', 'Nr', UniTableColumnType.Number, false);
        var nameCol = new UniTableColumn('Employee.BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);
        var systemGrunnlagCol = new UniTableColumn('SystemVacationPayBase', 'Feriegrunnlag (system)', UniTableColumnType.Number, false);
        var manuellGrunnlagCol = new UniTableColumn('ManualVacationPayBase', 'Feriegrunnlag manuelt', UniTableColumnType.Number);
        var rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Number, false);
        var vacationPayCol = new UniTableColumn('VacationPay', 'Feriepenger', UniTableColumnType.Number, false);
        var earlierPayCol = new UniTableColumn('PaidVacationPay', 'Tidl utbetalt', UniTableColumnType.Number, false);
        var payoutCol = new UniTableColumn('Withdrawal', 'Utbetales', UniTableColumnType.Number);

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
