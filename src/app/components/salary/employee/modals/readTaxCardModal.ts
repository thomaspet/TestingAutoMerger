import {Component, Type, ViewChild, Input} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import {AltinnReceipt} from '../../../../../app/unientities';
import {AltinnReceiptService, EmployeeService} from '../../../../../app/services/services';
import {AltinnLoginModal} from './altinnLoginModal';

declare var _; // lodash
@Component({
    selector: 'read-tax-card-modal-content',
    templateUrl: 'app/components/salary/employee/modals/readTaxCardModalContent.html'
})
export class ReadTaxCardModalContent {
    @Input()
    public config: {cancel: any};

    @ViewChild(AltinnLoginModal)
    public loginModal: AltinnLoginModal;

    private receiptTable: UniTableConfig;

    private altinnReceipts$: Observable<AltinnReceipt>;
    private employeeID: number;
    constructor(private _altinnReceiptService: AltinnReceiptService, private _employeeService: EmployeeService) {

    }

    public ngOnChanges() {
        this._employeeService.employee$.subscribe((emp) => {
            this.employeeID = emp.ID;
        })

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
            .setEditable(false)
            .setContextMenu([contextMenuItem], false)
            .setPageSize(10)
            .setFilters([{field: 'Form', operator: 'eq', value: 'RF-1211', group: 0}]);
    }

    private readTaxCard( receiptID: number) {
        this.loginModal.openLogin(receiptID);
    }

    public openModal() {
        this.altinnReceipts$ = this._altinnReceiptService.GetAll('orderby=ID DESC&filter=Form eq \'RF-1211\'');
    }

    public updateReceipts() {
        this.altinnReceipts$ = _.cloneDeep(this.altinnReceipts$);
        if (this.employeeID) {
            this._employeeService.refreshEmployeeID(this.employeeID);
        }
    }

    public selectedRow(event) {
        let altinnReceipt: AltinnReceipt = event.rowModel;
        this.readTaxCard( altinnReceipt.ReceiptID);
    }
}

@Component({
    selector: 'read-tax-card-modal',
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
    }

    public ngOnInit() {
        let self = this;
        self.config = {
            cancel: () => {
                self.modal.getContent().then((component: ReadTaxCardModalContent) => {
                    self.modal.close();
                });
            }
        };
    }

    public openModal() {
        this.modal.open();
        this.modal.getContent().then((component: ReadTaxCardModalContent) => {
            component.openModal();
        });
    }
}
