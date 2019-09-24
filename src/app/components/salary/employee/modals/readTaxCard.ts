import {Component, Output, EventEmitter, Input, OnInit} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '@uni-framework/ui/unitable';
import {Observable} from 'rxjs';
import {AltinnReceipt} from '@uni-entities';
import {AltinnReceiptService, ErrorService, FinancialYearService} from '@app/services/services';
import {TaxResponseModal} from './taxResponseModal';
import {AltinnAuthenticationModal} from '../../../common/modals/AltinnAuthenticationModal';
import {AltinnAuthenticationData} from '../../../../models/AltinnAuthenticationData';
import {UniModalService} from '@uni-framework/uni-modal';

@Component({
    selector: 'read-tax-card',
    templateUrl: './readTaxCard.html'
})
export class ReadTaxCard implements OnInit {
    @Input() public changeEvent: EventEmitter<any>;

    public receiptTable: UniTableConfig;
    public altinnReceipts: AltinnReceipt[];
    public responseMessage: string = '';

    @Output() public updateTax: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    constructor(
        private altinnReceiptService: AltinnReceiptService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private financialYearService: FinancialYearService,
    ) {

        const dateSendtColumn = new UniTableColumn(
            'TimeStamp', 'Dato sendt', UniTableColumnType.LocalDate).setFormat('DD.MM.YYYY HH:mm'
        ).setWidth('4rem');
        const receiptIDColumn = new UniTableColumn('ReceiptID', 'ID', UniTableColumnType.Number).setWidth('4rem');
        const signatureColumn = new UniTableColumn('UserSign', 'Signatur', UniTableColumnType.Text);
        const isReadColumn = new UniTableColumn('HasBeenRegistered', 'Innlest', UniTableColumnType.Text)
            .setTemplate((rowModel) => {
                return rowModel['HasBeenRegistered'] === true ? 'X' : 'Les og hent inn';
            })
            .setWidth('4rem')
            .setLinkClick(rowModel => this.readTaxCard(rowModel['ReceiptID']));

        this.receiptTable = new UniTableConfig('salary.employee.modals.readTaxCard')
            .setColumns([
                dateSendtColumn, receiptIDColumn, signatureColumn, isReadColumn
            ])
            .setEditable(false)
            .setPageSize(10);
    }

    public ngOnInit() {
        this.getReceipts();
    }

    private readTaxCard(receiptID: number) {

        this.modalService
            .open(AltinnAuthenticationModal)
            .onClose
            .filter(auth => !!auth)
            .switchMap((authData: AltinnAuthenticationData) => this.modalService
            .open(TaxResponseModal, {
                data: {
                    receiptID: receiptID,
                    auth: authData
                },
                modalConfig: {update: () => {
                    this.getReceipts();
                    this.updateTax.next();
                }}
            })
            .onClose)
        .subscribe();
    }

    public getReceipts() {
        this.altinnReceiptService.invalidateCache();
        this.altinnReceiptService
            .GetAll(`orderby=ID DESC&filter=Form eq 'RF-1211'`
                + ` and timestamp ge '${this.financialYearService.getActiveYear() - 1}-12-01'`
                + ` and timestamp le '${this.financialYearService.getActiveYear()}-12-31'`)
            .subscribe(
                res => this.altinnReceipts = res,
                err => this.errorService.handle(err)
            );
    }
}
