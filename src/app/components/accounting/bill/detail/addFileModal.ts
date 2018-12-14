import {Component, Input, Output, EventEmitter, OnInit, ViewChild, HostListener} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '../../../../../framework/uni-modal';
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
import {UniTable} from '../../../../../framework/ui/unitable/index';
import {KeyCodes} from '../../../../../app/services/common/keyCodes';

@Component({
    selector: 'add-file-modal',
    template: `
        <section role="dialog" class="uni-modal uni-approve-modal-class large">
            <header><h1>Legg til fil fra innboks</h1></header>

            <article class="bill-container">
                <article class="bill-list">
                    <uni-table
                        [resource]="list"
                        [config]="tableConfig"
                        (cellFocus)="onRowSelected($event)"
                        (rowDeleted)="onRowDeleted($event.rowModel)"
                        (dataLoaded)="focusRow()">
                    </uni-table>
                </article>

                <article class="bill-preview" *ngIf="previewVisible" [attr.aria-busy]="loadingPreview">
                    <uni-image
                        [singleImage]="true"
                        [readonly]="true"
                        [uploadWithoutEntity]="true"
                        [fileIDs]="fileID"
                        (fileListReady)="onFileListReady($event)">
                    </uni-image>
                </article>
            </article>

            <footer>
                <button (click)="this.onClose.emit(this.file)" class="good">Hent</button>
                <button (click)="onCloseAction()" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})

export class UniAddFileModal implements OnInit, IUniModal {

    public tableConfig: UniTableConfig;
    public list: any[] = [];

    public loadingPreview: boolean = false;
    private fileID: any;
    public currentFiles: any;
    public file: any;
    public previewVisible: boolean;

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();
    @ViewChild(UniTable) private table: UniTable;

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        if (key === KeyCodes.ENTER) {
            event.preventDefault();
            this.onClose.emit(this.file);
        }
    }

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toast: ToastService) {}

    public ngOnInit() {
        this.getData();
    }

    public getData() {
        this.supplierInvoiceService.fetch('filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpense/0').subscribe((res) => {
            this.list = res;
            this.setUpTable();
        }, (err) => {
            this.errorService.handle(err);
            this.toast.addToast('Kunne ikke laste dokumenter', ToastType.bad, 2);
            this.onClose.emit(null);
        } );
    }

    public setUpTable() {
        const cols = [
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
                        case 'IncomingTravel': return 'Reise';
                        case 'IncomingExpense': return 'Utlegg';
                    }
                }
                return '';
            }),
        ];
        const cfg = new UniTableConfig('accounting.bills.addfilemodal', false, true)
            .setSearchable(false)
            .setColumns(cols)
            .setPageSize(12)
            .setColumnMenuVisible(true)
            .setDeleteButton(true);

        this.tableConfig = cfg;
    }

    public onRowSelected(row: any) {
        const item = row.rowModel;
        item._rowSelected = !item._rowSelected;
        this.currentFiles = item.FileTags ? item.FileTags : null;
        if (item) {
            this.previewDocument(item);
        }
        this.file = item;
    }

    public onRowDeleted(row: any) {
        const fileId = row.ID;
        if (fileId) {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Bekreft sletting',
                message: 'Slett aktuell fil: ' + row.Name
            });

            modal.onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    if (fileId === this.fileID[0]) {
                        this.fileID = null;
                        this.previewVisible = false;
                    }
                    this.supplierInvoiceService.send('files/' + fileId, undefined, 'DELETE').subscribe(
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

    private previewDocument(item) {
        this.previewVisible = true;
        this.loadingPreview = true;
        this.fileID = [item.ID];
    }

    public onFileListReady(event) {
        this.loadingPreview = false;
    }

    public focusRow() {
        if (this.table) {
            this.table.blur();
            this.table.focusRow(0);
        }
    }
}
