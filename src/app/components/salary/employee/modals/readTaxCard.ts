import {Component, ViewChild, Output, EventEmitter} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import {AltinnReceipt} from '../../../../../app/unientities';
import {AltinnReceiptService, EmployeeService} from '../../../../../app/services/services';
import {AltinnResponseModal} from './altinnResponseModal';
import {AltinnAuthenticationDataModal} from '../../../common/modals/AltinnAuthenticationDataModal';
import {AltinnAuthenticationData} from '../../../../models/AltinnAuthenticationData';

declare var _; // lodash
@Component({
    selector: 'read-tax-card',
    templateUrl: 'app/components/salary/employee/modals/readTaxCard.html'
})
export class ReadTaxCard {

    @ViewChild(AltinnAuthenticationDataModal)
    public altinnAuthModal: AltinnAuthenticationDataModal;

    @ViewChild(AltinnResponseModal)
    public altinnResponseModal: AltinnResponseModal;

    private receiptTable: UniTableConfig;

    private altinnReceipts$: Observable<AltinnReceipt>;

    public responseMessage: string = '';

    @Output() public updateTax: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    constructor(private _altinnReceiptService: AltinnReceiptService, private _employeeService: EmployeeService) {

        let dateSendtColumn = new UniTableColumn('TimeStamp', 'Dato sendt', UniTableColumnType.Date).setFormat('DD.MM.YYYY HH:mm');
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
                dateSendtColumn, receiptIDColumn, signatureColumn, isReadColumn
            ])
            .setEditable(false)
            .setContextMenu([contextMenuItem], false)
            .setPageSize(10);


    }

    private readTaxCard(receiptID: number) {
        this.altinnAuthModal.getUserAltinnAuthorizationData()
            .then((authData: AltinnAuthenticationData) => {
                this.altinnResponseModal.openModal(receiptID, authData);
            });
    }

    public getReceipts() {
        this.altinnReceipts$ = this._altinnReceiptService.GetAll('orderby=ID DESC&filter=Form eq \'RF-1211\'');
    }

    public updateReceipts() {
        this.altinnReceipts$ = _.cloneDeep(this.altinnReceipts$);
    }

    public triggerUpdate() {
        this.updateReceipts();
        this.updateTax.emit(true);
    }

    public selectedRow(event) {
        let altinnReceipt: AltinnReceipt = event.rowModel;
        this.readTaxCard(altinnReceipt.ReceiptID);
    }
}