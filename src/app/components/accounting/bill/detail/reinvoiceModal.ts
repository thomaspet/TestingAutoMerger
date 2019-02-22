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
    templateUrl: './reinvoiceModal.html'
})
export class UniReinvoiceModal implements OnInit, IUniModal {

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

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
    public reinvoicingCustomers = [
        {Customer: { ID: 0 } }
    ];
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
        this.reinvoicingTableConfig = this.updateCustomerTableConfig(false);
        this.itemsTableConfig = this.updateItemTableConfig(false);
    }

    public updateItemTableConfig(isTurnOver = false) {

        const itemNumberColumn = new UniTableColumn('AccountNumber', 'Varenr', UniTableColumnType.Number);
        const itemNameColumn = new UniTableColumn('AccountName', 'Varenavn', UniTableColumnType.Text);
        const itemNetColumn = new UniTableColumn('NetAmount', 'Netto', UniTableColumnType.Money);
        const itemVatCodeColumn = new UniTableColumn('VatCode', 'Mva-kode', UniTableColumnType.Text);
        const itemGrossColumn = new UniTableColumn('GrossAmount', 'Brutto', UniTableColumnType.Money);


        return new UniTableConfig('reinvoicingItems.table', false, false)
            .setColumns([
                itemNumberColumn,
                itemNameColumn,
                itemNetColumn,
                itemVatCodeColumn,
                itemGrossColumn
            ])
            .setEditable(false)
            .setAutoAddNewRow(false)
            .setDeleteButton(false)
            .setColumnMenuVisible(false);

    }

    public updateCustomerTableConfig(isTurnOver = false) {
        const customerTemplateFn = (item: any): string => {
            if (item && item.Customer && item.Customer.ID === 0) {
                return 'Egen kostnad';
            } else {
                if (item && item.Customer && item.Customer.Info) {
                    return item.Customer.CustomerNumber + ' - ' + item.Customer.Info.Name;
                } else {
                    return item && item.Customer ? item.Customer.CustomerNumber : '';
                }
            }
            return '';
        };
        const customerColumn = new UniTableColumn('Customer', 'Kunde', UniTableColumnType.Lookup, (rowModel) => rowModel.Customer.ID !== 0);
        customerColumn.setTemplate(customerTemplateFn)
            .setDisplayField('Info.Name')
            .setOptions({
                itemTemplate: (item: Customer) => {
                    if (item && item.Info) {
                        return item.CustomerNumber + ' - ' + item.Info.Name;
                    } else {
                        return item ? item.CustomerNumber : '';
                    }
                    return '';
                },
                lookupFunction: (query) => {
                    return this.customerService.GetAll(`contains(Info.Name,${query}&top=50`, ['Info']);
                },
            });
        const shareColumn = new UniTableColumn('Share', 'Andel', UniTableColumnType.Percent, (rowModel) => rowModel.Customer.ID !== 0);
        const netColumn = new UniTableColumn('NetAmount', isTurnOver ? 'Netto' : 'Beløp', UniTableColumnType.Money, (rowModel) => rowModel.Customer.ID !== 0)
            .setIsSumColumn(true);

        const surchargeColumn = new UniTableColumn('SurCharge', 'Påslag %', UniTableColumnType.Percent, (rowModel) => rowModel.Customer.ID !== 0)
            .setVisible(isTurnOver);
        const vatColumn = new UniTableColumn('Vat', 'Mva', UniTableColumnType.Money, (rowModel) => rowModel.Customer.ID !== 0)
            .setVisible(isTurnOver);
        const grossColumn = new UniTableColumn('GrossAmount', 'Brutto', UniTableColumnType.Money, (rowModel) => rowModel.Customer.ID !== 0)
            .setVisible(isTurnOver);
        const columns = [
            customerColumn,
            shareColumn,
            netColumn,
            surchargeColumn,
            vatColumn,
            grossColumn
        ];

        return new UniTableConfig('reinvoicing.table', true, false)
            .setIsRowReadOnly((row => row.Customer && row.Customer.ID === 0))
            .setColumns(columns)
            .setColumnMenuVisible(false)
            .setDeleteButton(true, true)
            .setDefaultRowData({
                Customer: {ID: null}
            });
    }
}
