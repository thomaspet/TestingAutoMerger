import {Component, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {VatDeduction, VatDeductionGroup} from '@uni-entities';
import {VatDeductionService, ErrorService, VatDeductionGroupService} from '@app/services/services';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {UniTableColumn, UniTableConfig, UniTableColumnType} from '@uni-framework/ui/unitable';
import {VatDeductionSettingsGroupSetupModal} from './vatDeductionGroupSetupModal';
import { UniModalService } from '@uni-framework/uni-modal';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'vat-deduction-settings',
    templateUrl: './vat-deduction-settings.html'
})
export class VatDeductionSettings {

    @ViewChild(AgGridWrapper, { static: true })
    table: AgGridWrapper;

    uniTableConfig: UniTableConfig;
    vatdeductions: VatDeduction[] = [];
    vatDeductionGroups: VatDeductionGroup[] = [];
    isDirty: boolean;

    constructor(
        private vatDeductionService: VatDeductionService,
        private vatDeductionGroupService: VatDeductionGroupService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private modalService: UniModalService
    ) {
        this.loadData();
    }

    public loadData() {
        this.isDirty = false;
        Observable.forkJoin(
            this.vatDeductionService.GetAll('orderby=ValidFrom&expand=VatDeductionGroup'),
            this.vatDeductionGroupService.GetAll(null)
        ).subscribe(responses => {
            this.vatdeductions = responses[0] || [this.getDefaultRow()];
            this.vatDeductionGroups = responses[1];
            this.setupUniTable();
        }, err => this.errorService.handle(err));
    }

    public showVatDeductionGroups() {
        if (this.isDirty) {
            this.toastService.addToast('Ulagrede endringer', ToastType.warn, 5, 'Du må lagre innstillinger før du kan administrer grupper');
            return;
        }

        this.modalService.open(VatDeductionSettingsGroupSetupModal, { data: this.vatDeductionGroups }).onClose.subscribe(changes => {
            if (changes) {
                this.loadData();
            }
        });
    }

    public saveVatDeductions(): Observable<any> {
        if (!this.isDirty) {
            return Observable.of(true);
        }

        const requests = this.vatdeductions
            .filter(x => x['_isDirty'])
            .map(row => row.ID ? this.vatDeductionService.Put(row.ID, row) : this.vatDeductionService.Post(row));

        return requests.length ? Observable.forkJoin(requests) : Observable.of(true);
    }

    private setupUniTable() {

        const vatDeductionGroupColumn = new UniTableColumn('VatDeductionGroup', 'Gruppe', UniTableColumnType.Select)
        .setTemplate(row => row && row.VatDeductionGroup && row.VatDeductionGroup.Name)
        .setWidth('25%')
        .setOptions({
            itemTemplate: rowModel => rowModel.Name,
            resource: this.vatDeductionGroups
        });

        this.uniTableConfig = new UniTableConfig('accounting.vatsettings.vatdeductionSettings', true, false)
            .setColumnMenuVisible(true)
            .setAutoAddNewRow(false)
            .setDeleteButton(false)
            .setColumns([
                vatDeductionGroupColumn,
                new UniTableColumn('ValidFrom', 'Gyldig fra', UniTableColumnType.LocalDate).setWidth('25%'),
                new UniTableColumn('ValidTo', 'Gyldig til', UniTableColumnType.LocalDate).setWidth('25%'),
                new UniTableColumn('DeductionPercent', 'Fradrag prosent', UniTableColumnType.Number).setWidth('25%')
            ])
            .setDefaultRowData(this.getDefaultRow())
            .setChangeCallback((row) => {
                const item = row.rowModel;
                item._isDirty = true;
                this.isDirty = true;

                if (item.VatDeductionGroup) {
                    item.VatDeductionGroupID = item.VatDeductionGroup.ID;
                }

                return item;
            });
    }

    addRow() {
        this.table.addRow(this.getDefaultRow());
        this.isDirty = true;
    }

    getDefaultRow() {
        return <VatDeduction>{
            ID: 0,
            VatDeductionGroup: !!this.vatDeductionGroups[0] ? this.vatDeductionGroups[0] : null,
            VatDeductionGroupID: !!this.vatDeductionGroups[0] ? this.vatDeductionGroups[0].ID : null,
            ValidFrom: null,
            ValidTo: null,
            DeductionPercent: 0
        };
    }
}
