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
    selector: 'uni-reinvoice-modal',
    template: `
        <section role="dialog" class="uni-modal uni-approve-modal-class large">
            <header><h1>Viderefakturering</h1></header>

            <article class="">
                
            </article>

            <footer>
                <button (click)="this.onClose.emit(true)" class="good">Hent</button>
                <button (click)="this.onClose.emit(false)" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})

export class UniReinvoiceModal implements OnInit, IUniModal {

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

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toast: ToastService) {}

    public ngOnInit() {
        this.getData();
    }

    public getData() {

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
}
