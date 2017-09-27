import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uniModal/barrel';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {
    SupplierInvoiceService,
    ErrorService
} from '../../../../services/services';

@Component({
    selector: 'add-file-modal',
    template: `
        <section role="dialog" class="uni-modal uni-approve-modal-class large">
            <header><h1>Legg til fil fra innboks</h1></header>

            <section style="padding: 2rem">
                <uni-table
                    [resource]="list"
                    [config]="tableConfig"
                    (rowSelected)="onRowSelected($event)"
                    (rowDeleted)="onRowDeleted($event.rowModel)">
                </uni-table>
            </section>

            <footer>
                <button (click)="onCloseAction()" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})

export class UniAddFileModal implements IUniModal {

    private tableConfig: UniTableConfig;
    private list: any[] = [];

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toast: ToastService) {}

    public ngOnInit() {
        this.getData();
    }

    public getData() {
        this.supplierInvoiceService.fetch('filetags/IncomingMail|IncomingEHF/0').subscribe((res) => {
            this.list = res;
            this.setUpTable();
        }, (err) => {
            this.errorService.handle(err);
            this.toast.addToast('Kunne ikke laste dokumenter', ToastType.bad, 2);
            this.onClose.emit(null);
        } );
    }

    public setUpTable() {
        var cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number)
                .setWidth('4rem')
                .setFilterOperator('startswith'),
            new UniTableColumn('Name', 'Filnavn')
                .setWidth('18rem')
                .setFilterOperator('startswith'),
            new UniTableColumn('Description', 'Tekst'
                ).setFilterOperator('contains'),
            new UniTableColumn('Size', 'Størrelse', UniTableColumnType.Number)
                .setVisible(false).setWidth('6rem')
                .setFilterOperator('startswith'),
            new UniTableColumn('Source', 'Kilde', UniTableColumnType.Lookup)
                .setWidth('6rem')
                .setFilterOperator('startswith')
                .setTemplate((rowModel) => {
                if (rowModel.FileTags) {
                    switch (rowModel.FileTags[0].TagName) {
                        case 'IncomingMail': return 'Epost';
                        case 'IncomingEHF': return 'EHF';
                    }
                }
                return '';
            }),
        ];
        var cfg = new UniTableConfig('accounting.bills.addfilemodal', false, true)
            .setSearchable(false)
            .setColumns(cols)
            .setPageSize(12)
            .setColumnMenuVisible(true)
            .setDeleteButton(true);

        this.tableConfig = cfg;
    }

    public onRowSelected(row: any) {
        // When selecting a single row and not others are selected, emit it
        row.rowModel._rowSelected = !row.rowModel._rowSelected;
        this.onClose.emit(row.rowModel);
    }

    public onRowDeleted(row: any) {
        if (row.ID) {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Bekreft sletting',
                message: 'Slett aktuell fil: ' + row.Name
            });

            modal.onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.supplierInvoiceService.send('files/' + row.ID, undefined, 'DELETE').subscribe(
                        res => {
                            this.toast.addToast('Filen er slettet', ToastType.good, 2);
                        },
                        err => {
                            this.errorService.handle(err);
                            this.getData();
                        }
                    );
                } else {
                    this.getData();
                }
            });
        } else {
            this.toast.addToast('Kan ikke slette denne linjen', ToastType.warn, 2);
        }
    }

    public onCloseAction() {
        this.onClose.emit(null);
    }
}