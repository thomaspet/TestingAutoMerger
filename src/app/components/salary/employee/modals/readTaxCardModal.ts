import {Component, Type, ViewChild, Input} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import {AltinnReceipt} from '../../../../../app/unientities';
import {AltinnReceiptService} from '../../../../../app/services/services';
import {AltinnLoginModal} from './altinnLoginModal';

declare var _; // lodash
@Component({
    selector: 'read-tax-card-modal-content',
    directives: [UniTable, AltinnLoginModal],
    providers: [AltinnReceiptService],
    pipes: [AsyncPipe],
    templateUrl: 'app/components/salary/employee/modals/readtaxcardmodalcontent.html'
})
export class ReadTaxCardModalContent {
    @Input()
    public config: {cancel: any};

    @ViewChild(AltinnLoginModal)
    public loginModal: AltinnLoginModal;

    private receiptTable: UniTableConfig;

    private altinnReceipts$: Observable<AltinnReceipt>;
    constructor(private _altinnReceiptService: AltinnReceiptService) {
        
        let titleColumn = new UniTableColumn('Form', 'Tittel', UniTableColumnType.Text);
        let dateSendtColumn = new UniTableColumn('TimeStamp', 'Dato sendt', UniTableColumnType.Date);
        let receiptIDColumn = new UniTableColumn('ReceiptID', 'ID', UniTableColumnType.Number);
        let signatureColumn = new UniTableColumn('UserSign', 'Signatur', UniTableColumnType.Text);
        let isReadColumn = new UniTableColumn('HasBeenRegistered', 'Innlest', UniTableColumnType.Text)
            .setTemplate((rowModel) => {
                return rowModel['HasBeenRegistered'] === true ? 'X' : '';
            });
        let contextMenuItem = {
            label: 'Hent og les inn',
            action: (rowModel) => {
                this.readTaxCard(rowModel['ReceiptID']);
            }
        };

        this.receiptTable = new UniTableConfig()
            .setColumns([
                titleColumn, dateSendtColumn, receiptIDColumn, signatureColumn, isReadColumn
            ])
            .setContextMenu([contextMenuItem], false)
            .setEditable(false)
            .setPageSize(10);

    }

    private readTaxCard( receiptID: number) {
        this.loginModal.openLogin(receiptID);
    }

    public openModal() {
        this.altinnReceipts$ = this._altinnReceiptService.GetAll('orderBy=ID DESC');
        this.altinnReceipts$ = _.cloneDeep(this.altinnReceipts$);
    }

    public updateReceipts() {
        this.altinnReceipts$ = _.cloneDeep(this.altinnReceipts$);
    }
}

@Component({
    selector: 'read-tax-card-modal',
    directives: [UniModal],
    providers: [AltinnReceiptService],
    template: `
        <uni-modal [type]="type" [config]="config"></uni-modal>
    `
})
export class ReadTaxCardModal {
    public config: {cancel: () => void};
    public type: Type = ReadTaxCardModalContent;

    @ViewChild(UniModal)
    private modal: UniModal;

    constructor(private _altinnReceiptService: AltinnReceiptService) {
        this.config = {
            cancel: () => {
                this.modal.getContent().then((component: ReadTaxCardModalContent) => {
                    this.modal.close();
                });
            }
        };
    }

    public openModal() {
        this.modal.getContent().then((component: ReadTaxCardModalContent) => {
            component.openModal();
            this.modal.open();
        });
    }
}
