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
import { Customer } from '@app/unientities';
import { CustomerService } from '@app/services/sales/customerService';

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
        `dd, dt { display: inline-block }`,
        `.comboButton { margin: 1rem 0 0 1rem; top: 0.85rem }`,
        `footer .comboButton_moreList:not(#saveActionMenu).comboButton_moreList li { width: 100% }`,
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
            <p>Velge kunde(r) som skal viderefaktureres:</p>
            <ag-grid-wrapper
                [resource]="reinvoingCustomers"
                [config]="reinvoicingTableConfig"
            ></ag-grid-wrapper>
            <p>Velg vare(r)</p>
            <ag-grid-wrapper
                [resource]="items"
                [config]="itemsTableConfig"
            ></ag-grid-wrapper>
            <footer>
                <section role="group" class="comboButton">
                    <button class="comboButton_btn good" type="button" (click)="saveactions[0].action()" [attr.aria-busy]="busy" [disabled]="saveactions[0].disabled">{{saveactions[0].label}}</button>
                    <button class="comboButton_more good" type="button" (click)="open = !open" aria-owns="saveActionMenu" [attr.aria-expanded]="open">More options</button>
                    <ul class="comboButton_moreList" [attr.aria-expanded]="open" role="menu">
                        <li *ngFor="let action of saveactions" (click)="action.action()" role="menuitem" [attr.aria-disabled]="action.disabled">{{action.label}}</li>
                    </ul>
                </section>
                <button (click)="this.onClose.emit(true)" class="good">Lagre</button>
                <button (click)="this.onClose.emit(false)" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniReinvoiceModal implements OnInit, IUniModal {

    public tableConfig: UniTableConfig;
    public list: any[] = [];

    public loadingPreview = false;
    private fileID: any;
    public currentFiles: any;
    public file: any;
    public previewVisible: boolean;

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();
    @ViewChild(UniTable) private table: UniTable;

    public open = false;
    public saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre faktur (Fakturert)',
            action: (done) => {
                console.log(done);
            },
            main: true,
            disabled: false
        },
        {
            label: 'Lagre faktur (Kladd)',
            action: (done) => {
                console.log(done);
            },
            main: false,
            disabled: false
        },
        {
            label: 'Lagre ordre (Registrert)',
            action: (done) => {
                console.log(done);
            },
            main: false,
            disabled: false
        }
    ];
    public reinvoicingCustomers = [];
    public items = [];
    public reinvoicingTableConfig = null;
    public itemsTableConfig = null;
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
        private customerService: CustomerService,
        private errorService: ErrorService,
        private modalService: UniModalService) {}

    public ngOnInit() {
        const customerTemplateFn = (item: Customer | any): string => {
            if (item && item.ID === 0) {
                return 'Egen kostnad';
            } else {
                if (item && item.Info) {
                    return item.CustomerNumber + ' - ' + item.Info.Name;
                } else {
                    return item ? item.CustomerNumber : '';
                }
            }
            return '';
        };
        const customerColumn = new UniTableColumn('CustomerID', 'Kunde', UniTableColumnType.Lookup, (rowModel) => rowModel.CustomerID !== 0);
        customerColumn.setTemplate(customerTemplateFn)
            .setOptions({
                itemTemplate: customerTemplateFn,
                lookupFunction: (query) => {
                    return this.customerService.GetAll(`contains(Info.Name,${query}&top=50`, ['Info']);
                },
            });
        const shareColumn = new UniTableColumn('SharePercent', 'Andel', UniTableColumnType.Percent, (rowModel) => rowModel.CustomerID !== 0);
        const netColumn = new UniTableColumn('NetAmount', 'Netto', UniTableColumnType.Money, (rowModel) => rowModel.CustomerID !== 0);
        const surchargeColumn = new UniTableColumn('SurchargePercent', 'Påslag %', UniTableColumnType.Percent, (rowModel) => rowModel.CustomerID !== 0);
        const columns = [
            customerColumn,
            shareColumn,
            netColumn,
            surchargeColumn
        ];

        this.reinvoicingTableConfig = new UniTableConfig('reinvoicing.table', true, false);
        this.reinvoicingTableConfig.setColumns(columns);
    }
}
