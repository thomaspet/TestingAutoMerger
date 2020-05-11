import {Component, EventEmitter, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {UniTableColumn, UniTableConfig} from '@uni-framework/ui/unitable';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {VatDeductionGroup} from '@uni-entities';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {
    VatDeductionGroupService,
    VatDeductionService,
    ErrorService
} from '@app/services/services';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'vatdeductiongroup-setup-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>Oversikt over forholdsmessig MVA grupper</header>

            <article class="scrollable">
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>

                <p>
                    Rediger eller legg til grupper under hvis du ønsker å bruke forskjellige satser for
                    forholdsmessig fradrag av MVA. Disse satsene vil bli tilgjengelige inne i kontoplanen
                </p>

                <ag-grid-wrapper
                    [(resource)]="vatDeductionGroups"
                    [config]="tableConfig">
                </ag-grid-wrapper>
            </article>

            <footer class="center">
                <button (click)="save()" class="c2a rounded">Lagre endringer</button>
                <button (click)="onClose.emit()">Avbryt</button>
            </footer>
        </section>
    `
})
export class VatDeductionSettingsGroupSetupModal implements IUniModal {
    @ViewChild(AgGridWrapper, { static: true }) table: AgGridWrapper;

    options: IModalOptions;
    onClose: EventEmitter<boolean> = new EventEmitter();

    tableConfig: UniTableConfig;
    vatDeductionGroups: VatDeductionGroup[];
    busy = false;

    constructor(
        private toastService: ToastService,
        private vatDeductionGroupService: VatDeductionGroupService,
        private vatDeductionService: VatDeductionService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        if (this.options.data) {
            this.vatDeductionGroups = this.options.data;
        }

        // this.vatDeductionGroupService.GetAll().subscribe(
        //     res => this.vatDeductionGroups = res,
        //     err => this.errorService.handle(err)
        // );

        this.tableConfig = new UniTableConfig('accounting.vatDeductionGroupSetup.vatDeductionGroups', true, false)
            .setColumnMenuVisible(false)
            .setColumns([new UniTableColumn('Name', 'Navn')]);
    }

    public save() {
        this.table.finishEdit();
        this.busy = true;
        setTimeout(() => {
            const dirtyRows = this.vatDeductionGroups.filter(group => group.Name && group['_isDirty']);
            const requests = dirtyRows.map(row => {
                return row.ID > 0
                    ? this.vatDeductionGroupService.Put(row.ID, row)
                    : this.vatDeductionGroupService.Post(row);
            });

            if (requests.length > 0) {
                Observable.forkJoin(requests).subscribe(() => {
                    this.toastService.addToast('Lagring vellykket', ToastType.good, ToastTime.short);
                    this.vatDeductionService.invalidateCache();
                    this.onClose.emit(true);
                },
                err => {
                    this.busy = false;
                    this.errorService.handle(err);
                });
            } else {
                this.onClose.emit();
            }
        });
    }
}
