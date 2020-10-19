import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '@uni-framework/ui/unitable';
import {AltinnReceipt} from '@uni-entities';
import {AltinnReceiptService, ErrorService, FinancialYearService, UniTranslationService} from '@app/services/services';
import {TaxResponseModalComponent} from './tax-response-modal.component';
import {AltinnAuthenticationModal} from '@app/components/common/modals/AltinnAuthenticationModal';
import {AltinnAuthenticationData} from '@app/models/AltinnAuthenticationData';
import {UniModalService} from '@uni-framework/uni-modal';
import { filter, switchMap, tap } from 'rxjs/operators';

@Component({
    selector: 'read-tax-card',
    templateUrl: './read-tax-card.component.html',
    styleUrls: ['./read-tax-card.component.sass']
})
export class ReadTaxCardComponent implements OnInit {
    public receiptTable: UniTableConfig;
    public altinnReceipts: AltinnReceipt[];
    public responseMessage: string = '';
    @Output() close: EventEmitter<boolean> = new EventEmitter();
    @Output() taxCardsUpdated: EventEmitter<boolean> = new EventEmitter();

    constructor(
        private altinnReceiptService: AltinnReceiptService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private financialYearService: FinancialYearService,
        private translationService: UniTranslationService,
    ) {

        const dateSendtColumn = new UniTableColumn(
                'TimeStamp',
                this.translationService.translate('SALARY.READ_TAX_CARD.TIME_STAMP_COL'),
                UniTableColumnType.LocalDate
            )
            .setFormat('DD.MM.YYYY HH:mm')
            .setWidth('4rem');

        const receiptIDColumn = new UniTableColumn(
                'ReceiptID',
                this.translationService.translate('SALARY.READ_TAX_CARD.ID_COL'),
                UniTableColumnType.Number
            )
            .setWidth('4rem');

        const signatureColumn = new UniTableColumn(
                'UserSign',
                this.translationService.translate('SALARY.READ_TAX_CARD.SIGNATURE_COL'),
                UniTableColumnType.Text
            );

        const isReadColumn = new UniTableColumn(
                'HasBeenRegistered',
                this.translationService.translate('SALARY.READ_TAX_CARD.HAS_BEEN_REGISTERED_COL'),
                UniTableColumnType.Text
            )
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
            .pipe(
                filter(auth => !!auth),
                switchMap((authData: AltinnAuthenticationData) => this.modalService
                    .open(TaxResponseModalComponent, {
                        data: {
                            receiptID: receiptID,
                            auth: authData
                        },
                    })
                    .onClose
                ),
                tap(() => this.taxCardsUpdated.next(true)),
            )
            .subscribe(() => this.getReceipts());
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
