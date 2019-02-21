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
import { IUniSaveAction } from '@uni-framework/save/save';

@Component({
    selector: 'uni-reinvoice-modal',
    styles: [
        `.reinvoiceContent { display: flex }`,
        `#reinvoiceFormData { flex-grow: 1; position: relative}`,
        `#reinvoiceFormData .totalsum { position: absolute; bottom: 4rem}`,
        `label[for="forReinvoice"] { display: block; margin-bottom: 4rem; }`,
        `#reinvoiceTypeLabel { position: relative; display: block; width: 12rem; margin-bottom: 1rem; }`,
        `uni-tooltip { right: 0.0rem; top: -0.3rem; }`,
        `uni-information { width: 50%; height: 100%; font-weight: bold}`,
        `uni-information a { position: absolute; right: 1rem; bottom: 0.5rem }`,
        `uni-information span { display: inline-block; margin-bottom: 1rem; margin-top: 1rem }`,
        `dl {  margin: 0; margin-left: 2rem; }`,
        `dd, dt { display: inline-block }`
    ],
    template: `
        <section role="dialog" class="uni-modal uni-redesing maybe-default large">
            <header><h1>Viderefakturering</h1></header>
            <article class="reinvoiceContent">
                <form id="reinvoiceFormData">
                    <label for="forReinvoice">
                        Marker leverandørfaktura for viderefakturering
                        <mat-checkbox
                            name="forReinvoice"
                            tabindex="-1"
                            [(ngModel)]="forReinvoice"
                            [labelPosition]="'before'"
                            [disableRipple]="true">
                        </mat-checkbox>
                    </label>
                    <label id="reinvoiceTypeLabel">
                        <span>Type viderefakturering</span>
                        <uni-tooltip [type]="'info'"
                                     [alignment]="'top'"
                                     [text]="infoText">
                        </uni-tooltip>
                    </label>
                    <mat-radio-group [value]="reinvoiceType">
                        <mat-radio-button [value]="1">
                            Kostnadsdeling
                        </mat-radio-button>
                        <mat-radio-button [value]="2">
                            Viderefakturering, omsetning
                        </mat-radio-button>
                    </mat-radio-group>
                    <p class="totalsum">Totalsum leverandørfaktura: {{ invoiceSum | uninumberformat:'money' }} Kr</p>
                </form>
                <uni-information [config]="{ headline: 'Instillinger'}">
                    <span>Kostandsdeling:</span>
                    <dl>
                        <dt>Varenummer</dt>
                        <dd>5 - Kostnadsdeling</dd>
                    </dl>
                    <dl>    
                        <dt>Hovedbokskonto</dt>
                        <dd>1579 - Andre kortsiktige fordringer</dd>
                    </dl>
                    <span>Viderefakturering:</span>
                    <dl>
                        <dt>Varenummer</dt>
                        <dd>6 - Omsetningsvaren</dd>
                    </dl>
                    <dl>
                        <dt>Hovedbokskonto</dt>
                        <dd>3000 - Varesalg</dd>
                    </dl>
                    <a>Endre instillinger</a>
                </uni-information>
            </article>
            <footer>
                <button (click)="this.onClose.emit(true)" class="good">Lagre</button>
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

    public uniSaveConfig: IUniSaveAction[] = [
        {
            label: 'Lagre faktur (Fakturert)',
            action: (done) => {
                console.log(done);
            },
            main: true,
            disabled: false,
            isUpload: false
        },
        {
            label: 'Lagre faktur (Kladd)',
            action: (done) => {
                console.log(done);
            },
            main: false,
            disabled: false,
            isUpload: false
        },
        {
            label: 'Lagre ordre (Registrert)',
            action: (done) => {
                console.log(done);
            },
            main: false,
            disabled: false,
            isUpload: false
        }
    ];
    public invoiceSum: number = 4000;
    public forReinvoice: boolean = false;
    public reinvoiceType: number = 1;
    public infoText: string = `
        Velg kostandsdeling dersom to eller flere har gått sammen om å anskaffe
        en vare/tjeneste i fellesskap. Ditt firma er mottaker av leverandørfakturaen
        og belaster de øvrige partene for deres andel. Den andelen som skal viderebelastes
        andre balanseføres som en fordring på motpart.
        
        Velg viderefakturering, omsetning dersom leveringen av varen/tjenesten
        skal føres som omsetning. Den andelen som skal viderebelastes andre
        balanseføres som en fordring på motpart.
    `;

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
