import {Component, Output, EventEmitter, Input, OnInit} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../../framework/ui/unitable/index';
import {Observable} from 'rxjs/Observable';
import {AltinnReceipt} from '../../../../../app/unientities';
import {AltinnReceiptService, EmployeeService, ErrorService} from '../../../../../app/services/services';
import {TaxResponseModal} from './taxResponseModal';
import {AltinnAuthenticationModal} from '../../../common/modals/AltinnAuthenticationModal';
import {AltinnAuthenticationData} from '../../../../models/AltinnAuthenticationData';
import {UniModalService} from '../../../../../framework/uni-modal';
declare var _;

@Component({
    selector: 'read-tax-card',
    templateUrl: './readTaxCard.html'
})
export class ReadTaxCard implements OnInit {
    @Input() public changeEvent: EventEmitter<any>;

    public receiptTable: UniTableConfig;
    public altinnReceipts$: Observable<AltinnReceipt>;
    public responseMessage: string = '';

    @Output() public updateTax: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    constructor(
        private _altinnReceiptService: AltinnReceiptService,
        private _employeeService: EmployeeService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {

        const dateSendtColumn = new UniTableColumn(
            'TimeStamp', 'Dato sendt', UniTableColumnType.LocalDate).setFormat('DD.MM.YYYY HH:mm'
        );
        const receiptIDColumn = new UniTableColumn('ReceiptID', 'ID', UniTableColumnType.Number);
        const signatureColumn = new UniTableColumn('UserSign', 'Signatur', UniTableColumnType.Text);
        const isReadColumn = new UniTableColumn('HasBeenRegistered', 'Innlest', UniTableColumnType.Text)
            .setTemplate((rowModel) => {
                return rowModel['HasBeenRegistered'] === true ? 'X' : '';
            });

        const contextMenuItem = {
            label: 'Hent og les inn',
            action: (rowModel) => {
                this.readTaxCard(rowModel['ReceiptID']);
            }
        };

        this.receiptTable = new UniTableConfig('salary.employee.modals.readTaxCard')
            .setColumns([
                dateSendtColumn, receiptIDColumn, signatureColumn, isReadColumn
            ])
            .setEditable(false)
            .setContextMenu([contextMenuItem], false)
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
        this._altinnReceiptService.invalidateCache();
        this.altinnReceipts$ = this._altinnReceiptService.GetAll(`orderby=ID DESC&filter=Form eq 'RF-1211'`)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public selectedRow(event) {
        let altinnReceipt: AltinnReceipt = event.rowModel;
        this.readTaxCard(altinnReceipt.ReceiptID);
    }
}
