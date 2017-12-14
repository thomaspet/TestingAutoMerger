import {Component, Input, Output, EventEmitter, OnInit, ViewChild, HostListener} from '@angular/core';
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
import {UniImageSize} from '../../../../../framework/uniImage/uniImage';
import {ImageModal} from '../../../common/modals/ImageModal';
import {UniTable} from '../../../../../framework/ui/unitable/index';
import {KeyCodes} from '../../../../../app/services/common/keyCodes';

@Component({
    selector: 'add-file-modal',
    template: `
        <section role="dialog" class="uni-modal uni-approve-modal-class large">
            <header><h1>Legg til fil fra innboks</h1></header>

            <article class="application accounting_inbox_container">
                <article class="accounting_inbox_list_container">
                    <uni-table
                        [resource]="list"
                        [config]="tableConfig"
                        (cellFocus)="onRowSelected($event)"
                        (rowDeleted)="onRowDeleted($event.rowModel)"
                        (dataLoaded)="focusRow()">
                    </uni-table>
                </article>

                <article class="preview_container" id="preview_container_id" [attr.aria-busy]="loadingPreview">
                    <uni-image
                        [singleImage]="true"
                        [readonly]="true"
                        [uploadWithoutEntity]="true"
                        [fileIDs]="fileID"
                        (imageClicked)="onImageClicked($event)"
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

    private tableConfig: UniTableConfig;
    private list: any[] = [];

    public loadingPreview: boolean = false;
    private fileID: any;
    private currentFiles: any;
    private file: any;

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
        this.supplierInvoiceService.fetch('filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpence/0').subscribe((res) => {
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
                        case 'IncomingExpence': return 'Utlegg';
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
                        this.hidePreview();
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

    public onImageClicked(file: any) {
        const data = {
            entity: 'SupplierInvoice',
            entityID: this.currentFiles[0].ID || 0,
            fileIDs: null,
            showFileID: file.ID,
            readonly: true,
            size: UniImageSize.large
        };

        if (this.currentFiles) {
            data.fileIDs = this.currentFiles.map(f => f.FileID);
        }
        this.modalService.open(ImageModal, { data: data });
    }

    private previewDocument(item) {
        document.getElementById('preview_container_id').style.display = 'block';
        this.loadingPreview = true;
        this.fileID = [item.ID];
    }

    private hidePreview() {
        document.getElementById('preview_container_id').style.display = 'none';
    }

    public onFileListReady(event) {
        this.loadingPreview = false;
    }

    private focusRow() {
        if (this.table) {
            this.table.blur();
            this.table.focusRow(0);
        }
    }
}
