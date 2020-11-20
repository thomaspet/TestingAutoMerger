import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {BankStatement} from '@app/unientities';
import {BankStatementService} from '@app/services/services';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
} from '@uni-framework/ui/unitable';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';


@Component({
    selector: 'manual-bankstatement-register-modal',
    templateUrl: './manual-bankstatement-register-modal.html'
})
export class ManualBankStatementRegisterModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    lines = [{Amount: 0, BookingDate: null, Description: '', AmountCurrency: 0 }];
    uniTableConfig: UniTableConfig;
    busy = false;

    constructor(
        private bankStatementService: BankStatementService,
        private toast: ToastService
    ) {}

    ngOnInit() {
        this.generateUniTableConfig();
    }

    save() {

        // Get all the edited lines
        const linesToSave = this.lines.filter(l => l['_isDirty']);

        if (linesToSave.length === 0) {
            this.toast.addToast('Ikke lagret', ToastType.warn, 5, 'Ingen linjer å lagre');
            return;
        }

        // Check that all the lines are fully filled!
        const hasMissingInfo = linesToSave.filter(l => !l.Amount || !l.BookingDate || !l.Description).length !== 0;

        if (hasMissingInfo) {
            this.toast.addToast('Ikke lagret', ToastType.warn, 5, 'Alle linjene må ha Dato, Beskrivelse og Sum');
            return;
        }

        this.busy = true;

        const total = linesToSave.map(l => l.Amount).reduce((a, b) => a + b);

        // Lets filter on dates to find first and last
        const datesSorted = linesToSave.sort((a, b) => {
           return a.BookingDate > b.BookingDate ? 1 : -1;
        });

        // Lets create the statement object
        const statement = <BankStatement> {
            ID: 0,
            _createguid: this.bankStatementService.getNewGuid(),
            AccountID: this.options.data.AccountID,
            Amount: total,
            AmountCurrency: total,
            FromDate: datesSorted[0].BookingDate,
            ToDate: datesSorted[datesSorted.length - 1].BookingDate,
            Entries: linesToSave
        };

        this.bankStatementService.Post(statement).subscribe(() => {
            this.busy = false;
            this.onClose.emit(true);
        }, () => {
            this.busy = false;
            this.toast.addToast('Ikke lagret', ToastType.warn, 5, 'Alle linjene må ha Dato, Beskrivelse og Sum');
        });

    }

    private generateUniTableConfig() {
        const columns = [
            new UniTableColumn('BookingDate', 'Dato', UniTableColumnType.LocalDate).setWidth('9rem'),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text).setWidth('25rem'),
            new UniTableColumn('Amount', 'Sum', UniTableColumnType.Money),
        ];

        this.uniTableConfig = new UniTableConfig('bank.statement.manually', true)
            .setColumns(columns)
            .setAutoAddNewRow(true)
            .setDefaultRowData({Amount: 0, BookingDate: null, Description: '', AmountCurrency: 0 })
            .setDeleteButton(true);
    }

    close() {
        this.onClose.emit(false);
    }
}
