import {Component, Input, Output, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {SalaryTransactionService} from '@app/services/services';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {
    UniTableConfig,
} from '../../../../framework/ui/unitable/index';

@Component({
    selector: 'uni-edit-salarytransaction-modal',
    template: `
    <section role="dialog" class="uni-modal uni-redesign" style="width: 90vw; font-size: .9rem">
        <header>{{ options.header }}</header>

        <article style="overflow: visible">
            <section *ngIf="busy" class="modal-spinner">
                <mat-spinner class="c2a"></mat-spinner>
            </section>
            <ag-grid-wrapper
                class="transquery-grid-font-size"
                [(resource)]="tableData"
                [config]="uniTableConfig"
                (rowChange)="rowChanged($event)">
            </ag-grid-wrapper>
        </article>

        <footer>
            <button (click)="save()" class="good">Lagre</button>
            <button (click)="close()" class="bad">Avbryt</button>
        </footer>
    </section>
    `
})

export class UniSalaryTransactionModal implements OnInit, IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    @ViewChild(AgGridWrapper)
    private table: AgGridWrapper;

    public tableData: any[] = [];
    public busy: boolean = false;
    public uniTableConfig: UniTableConfig;

    constructor(
        private salaryTransactionService: SalaryTransactionService,
        private toast: ToastService
    ) {}

    public ngOnInit() {
        if (this.options && this.options.data) {
            this.salaryTransactionService.Get(this.options.data.data.ID,
                ['WageType.SupplementaryInformations', 'Employee', 'Employee.BusinessRelationInfo', 'employment', 'Employee.Employments',
                'Supplements', 'Supplements.WageTypeSupplement', 'Dimensions',
                'Dimensions.Project', 'Dimensions.Department', 'Files', 'VatType.VatTypePercentages']
            ).subscribe((res) => {
                this.tableData.push(res);
                this.uniTableConfig = this.options.data.config;
            });
        }
    }

    public save() {
        this.table.finishEdit();
        this.busy = true;
        const data = this.tableData[0];
        data.Employee = null;
        data.Wagetype = null;

        if (data.Dimensions) {
            data.Dimensions._createguid = this.salaryTransactionService.getNewGuid();
        }

        if (this.salaryTransactionService.supplements && this.salaryTransactionService.supplements.length) {
            data.Supplements = this.salaryTransactionService.supplements;
        }

        this.salaryTransactionService.save(data).subscribe(res => {
            this.busy = false;
            this.close(true);
        }, err => {
            this.busy = false;
            this.toast.addToast('Kunne ikke lagre.', ToastType.bad, ToastTime.medium,
            'Noe gikk gale ved lagring av lønnspost. Sjekk at data er korrekt fylt ut, og prøv igjen');
        });
    }

    public close(emitValue: boolean = false) {
        this.salaryTransactionService.supplements = [];
        this.onClose.emit(emitValue);
    }

    public rowChanged(event) {
        const row = event.rowModel;
        if (event['field'] === 'Wagetype') {
            this.salaryTransactionService.completeTrans(row).subscribe(trans => {
                row['Rate'] = trans.Rate;
                row['Text'] = trans.Text;
                row['Sum'] = trans.Sum;
                row['Amount'] = trans.Amount;
                this.table.updateRow(row['_originalIndex'], row);
            });
        }
    }
}
