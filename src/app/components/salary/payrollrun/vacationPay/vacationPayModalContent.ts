import { Component, Input, ViewChild } from '@angular/core';
import { FieldType, BasicAmount } from '../../../../unientities';
import { UniForm } from '../../../../../framework/uniform';
import { UniFieldLayout } from '../../../../../framework/uniform/index';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import { SalaryTransactionService, BasicAmountService, PayrollrunService } from '../../../../../app/services/services';
import { VacationpaySettingModal} from './vacationPaySettingModal';

declare var _;

@Component({
    selector: 'vacationpay-modal-content',
    directives: [UniForm, UniTable, VacationpaySettingModal],
    providers: [SalaryTransactionService, BasicAmountService, PayrollrunService],
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationPayModalContent.html'
})
export class VacationpayModalContent {
    @Input() private config: {hasCancelButton: boolean, cancel: any, actions: {text: string, method: any}[], payrollRunID: number};
    private busy: boolean;
    private basicamountBusy: boolean;
    private vacationHeaderModel: any = {};
    private fields: any[] = [];
    private basicamounts: BasicAmount[] = [];
    private tableConfig: UniTableConfig;
    private totalPayout: number;
    @ViewChild(VacationpaySettingModal) private vacationpaySettingModal: VacationpaySettingModal;
    private vacationpayBasis: any;
    private vacationBaseYear: number;

    constructor(private _salarytransService: SalaryTransactionService, private _basicamountService: BasicAmountService, private _payrollrunService: PayrollrunService) {
        this.busy = true;
        _basicamountService.getBasicAmounts()
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

    public createVacationPayments() {
        return this._salarytransService.createVacationPayments(this.config.payrollRunID);
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
            this.vacationpayBasis = vpBasis.VacationPay;
            this.vacationpayBasis[1].IsInCollection = false;
            this.updatetotalPay();
            this.basicamountBusy = false;
        });

    }

    private updatetotalPay() {
        this.totalPayout = 0;
        this.vacationpayBasis.forEach(vacationpayLine => {
            this.totalPayout += vacationpayLine.Withdrawal;
        });
    }

    private setCurrentBasicAmountAndYear() {
        switch (this.vacationHeaderModel.VacationpayYear) {
            case 1:
                this.vacationBaseYear = 2014;
                break;
            case 2:
                this.vacationBaseYear = 2015;
                break;
            case 3:
                this.vacationBaseYear = 2013;
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
        var nrCol = new UniTableColumn('Employee.EmployeeNumber', 'Nr', UniTableColumnType.Number);
        var nameCol = new UniTableColumn('Employee.BusinessRelationInfo.Name', 'Navn');
        var systemGrunnlagCol = new UniTableColumn('SystemVacationPayBase', 'Feriegrunnlag (system)');
        var manuellGrunnlagCol = new UniTableColumn('ManualVacationPayBase', 'Feriegrunnlag manuelt');
        var rateCol = new UniTableColumn('Rate', 'Sats');
        var vacationPayCol = new UniTableColumn('VacationPay', 'Feriepenger');
        var earlierPayCol = new UniTableColumn('PaidVacationPay', 'Tidl utbetalt');
        var payoutCol = new UniTableColumn('Withdrawal', 'Utbetales');

        this.tableConfig = new UniTableConfig(true)
        .setColumns([nrCol, nameCol, systemGrunnlagCol, manuellGrunnlagCol, rateCol, vacationPayCol, earlierPayCol, payoutCol])
        .setPageable(false)
        .setMultiRowSelect(false)
        .setIsRowReadOnly((rowModel) => {
            if (rowModel.IsInCollection) {
                return false;
            } else {
                return true;
            }
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
