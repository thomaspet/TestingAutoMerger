import {Component, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {VatDeduction, VatDeductionGroup} from '../../../../unientities';
import {VatDeductionService, ErrorService, VatDeductionGroupService} from '../../../../services/services';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {
    UniTable, UniTableColumn, UniTableConfig, UniTableColumnType
} from '../../../../../framework/ui/unitable/index';


@Component({
    selector: 'vat-deduction-settings',
    templateUrl: './vatdeductionsettings.html'
})
export class VatDeductionSettings {
    @ViewChild(UniTable) public unitable: UniTable;
    public uniTableConfig: UniTableConfig;

    public vatdeductions: VatDeduction[] = [];
    public vatDeductionGroups: VatDeductionGroup[] = [];

    public isDirty: boolean = false;

    constructor(
        private vatDeductionService: VatDeductionService,
        private vatDeductionGroupService: VatDeductionGroupService,
        private errorService: ErrorService,
        private toastService: ToastService
    ) {
    }

    public ngOnInit() {
        this.setup();
    }

    private setup() {
        this.loadData();
    }

    public loadData() {
        Observable.forkJoin(
            this.vatDeductionService.GetAll('orderby=ValidFrom&expand=VatDeductionGroup'),
            this.vatDeductionGroupService.GetAll(null)
        ).subscribe(responses => {
                this.vatdeductions = responses[0];
                this.vatDeductionGroups = responses[1];
                this.setupUniTable();
            },
            err => this.errorService.handle(err)
        );
    }

    public saveVatDeductions(completeEvent): void {
        const data = this.unitable.getTableData();

        const dirtyRows = [];
        data.forEach(x => {
            if (x._isDirty) {
                dirtyRows.push(x);
            }
        });

        const requests = [];

        dirtyRows.forEach(row => {
            if (row.ID > 0) {
                requests.push(this.vatDeductionService.Put(row.ID, row));
            } else {
                requests.push(this.vatDeductionService.Post(row));
            }
        });

        if (requests.length > 0) {
            Observable.forkJoin(requests)
                .subscribe(res => {
                    this.toastService.addToast('Lagring vellykket', ToastType.good, ToastTime.short);
                    this.setup();
                    completeEvent('Lagring vellykket');
                },
                err => {
                    this.errorService.handle(err);
                    completeEvent('Lagring feilet');
                }
            );
        } else {
            this.toastService.addToast('Ingen endringer funnet', ToastType.warn, ToastTime.short);
            completeEvent('Ingen endringer funnet');
        }
    }

    private setupUniTable() {

        const vatDeductionGroupColumn = new UniTableColumn('VatDeductionGroup', 'Gruppe', UniTableColumnType.Select)
        .setTemplate(row => row && row.VatDeductionGroup && row.VatDeductionGroup.Name)
        .setOptions({
            itemTemplate: rowModel => rowModel.Name,
            resource: this.vatDeductionGroups
        });

        this.uniTableConfig = new UniTableConfig('accounting.vatsettings.vatdeductionSettings', true, false)
            .setColumnMenuVisible(false)
            .setDeleteButton(false)
            .setColumns([
                vatDeductionGroupColumn,
                new UniTableColumn('ValidFrom', 'Gyldig fra', UniTableColumnType.LocalDate),
                new UniTableColumn('ValidTo', 'Gyldig til', UniTableColumnType.LocalDate),
                new UniTableColumn('DeductionPercent', 'Fradrag prosent', UniTableColumnType.Number)
            ])
            .setDefaultRowData({
                ID: 0,
                VatDeductionGroup: this.vatDeductionGroups && this.vatDeductionGroups.length === 1 ? this.vatDeductionGroups[0] : null,
                VatDeductionGroupID: this.vatDeductionGroups && this.vatDeductionGroups.length === 1 ? this.vatDeductionGroups[0].ID : null,
                ValidFrom: null,
                ValidTo: null,
                DeductionPercent: 0
            })
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
}
