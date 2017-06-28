import {Component, ViewChild,  OnChanges, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {VatDeduction} from '../../../../unientities';
import {VatDeductionService, ErrorService} from '../../../../services/services';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from '../../../../../framework/ui/unitable/index';


@Component({
    selector: 'vat-deduction-settings',
    templateUrl: './vatdeductionsettings.html'
})
export class VatDeductionSettings {
    @ViewChild(UniTable) public unitable: UniTable;
    private uniTableConfig: UniTableConfig;

    private vatdeductions: VatDeduction[] = [];

    constructor(
        private vatDeductionService: VatDeductionService,
        private errorService: ErrorService,
        private toastService: ToastService
    ) {
    }

    public ngOnInit() {
        this.setup();
    }

    private setup() {
        this.vatDeductionService.GetAll('orderby=ValidFrom')
            .subscribe(response => {
                this.vatdeductions = response;
                this.setupUniTable();
            },
            err => this.errorService.handle(err)
        );
    }

    public saveVatDeductions(completeEvent): void {
        let data = this.unitable.getTableData();

        let dirtyRows = [];
        data.forEach(x => {
            if (x._isDirty) {
                dirtyRows.push(x);
            }
        });

        let requests = [];

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
        this.uniTableConfig = new UniTableConfig(true, false)
            .setColumnMenuVisible(false)
            .setDeleteButton(false)
            .setColumns([
                new UniTableColumn('ValidFrom', 'Gyldig fra', UniTableColumnType.LocalDate),
                new UniTableColumn('ValidTo', 'Gyldig til', UniTableColumnType.LocalDate),
                new UniTableColumn('DeductionPercent', 'Fradrag prosent', UniTableColumnType.Number)
            ])
            .setDefaultRowData({
                ID: 0,
                ValidFrom: null,
                ValidTo: null,
                DeductionPercent: 0
            })
            .setChangeCallback((row) => {
                let item = row.rowModel;
                item._isDirty = true;
                return item;
            });
    }
}
