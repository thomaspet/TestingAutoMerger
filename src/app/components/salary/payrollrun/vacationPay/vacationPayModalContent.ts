import { Component, Input } from '@angular/core';
import { FieldType, BasicAmount } from '../../../../unientities';
import { UniForm } from '../../../../../framework/uniform';
import { UniFieldLayout } from '../../../../../framework/uniform/index';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import { SalaryTransactionService, BasicAmountService } from '../../../../../app/services/services';

@Component({
    selector: 'vacationpay-modal-content',
    directives: [UniForm, UniTable],
    providers: [SalaryTransactionService, BasicAmountService],
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationpaymodalcontent.html'
})
export class VacationpayModalContent {
    @Input() private config: {hasCancelButton: boolean, cancel: any, actions: {text: string, method: any}[], payrollRunID: number};
    private busy: boolean;
    private vacationHeaderModel: any = {};
    private fields: any[] = [];
    private basicamounts: BasicAmount[] = [];
    private tableConfig: UniTableConfig;
    private totalPayout: number = 99503.68;

    constructor(private _salarytransService: SalaryTransactionService, _basicamountService: BasicAmountService) {
        this.busy = true;
        _basicamountService.getBasicAmounts()
        .subscribe((response) => {
            this.basicamounts = response;
            this.setCurrentBasicAmount();
            this.createFormConfig();
            this.createTableConfig();
        });
    }

    public createVacationPayments() {
        this.busy = true;
        return this._salarytransService.createVacationPayments(this.config.payrollRunID);
    }

    public openVacationpaySettings() {
        console.log('settings to come.. stay tuned');
    }

    public change(value) {
        // console.log('form updated');
    }

    public ready(value) {
        // console.log('vacationpay modal form ready');
    }

    private setCurrentBasicAmount() {
        this.vacationHeaderModel.BasicAmount = this.basicamounts[this.basicamounts.length - 1].BasicAmountPrYear;
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
        var nrCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number);
        var nameCol = new UniTableColumn('', 'Navn');
        var systemGrunnlagCol = new UniTableColumn('', 'Feriegrunnlag (system)');
        var manuellGrunnlagCol = new UniTableColumn('', 'Feriegrunnlag manuelt');
        var rateCol = new UniTableColumn('', 'Sats');
        var vacationPayCol = new UniTableColumn('', 'Feriepenger');
        var earlierPayCol = new UniTableColumn('', 'Tidl utbetalt');
        var payoutCol = new UniTableColumn('', 'Utbetales');

        this.tableConfig = new UniTableConfig(false)
        .setColumns([nrCol, nameCol, systemGrunnlagCol, manuellGrunnlagCol, rateCol, vacationPayCol, earlierPayCol, payoutCol])
        .setPageable(false)
        .setMultiRowSelect(true);
    }
}
