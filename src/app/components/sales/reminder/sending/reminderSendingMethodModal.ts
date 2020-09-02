import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../../../../../framework/uni-modal';
import {EHFService, DistributionPlanService} from '@app/services/services';
import {ElementType} from '@app/models/distribution';
import { CustomReminder } from './reminderSending';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';

@Component({
    selector: 'uni-reminder-sending-method-modal',
    template: `
        <section class="uni-modal medium">
            <header>
                <h1>Utsendelse av purringer</h1>
            </header>

            <article>
                <!--<reminder-sending [modalMode]="true"></reminder-sending>-->
                <ag-grid-wrapper
                    *ngIf="reminders.length"
                    class="transquery-grid-font-size"
                    [resource]="reminders"
                    [config]="tableConfig">
                </ag-grid-wrapper>
            </article>

            <footer>
                <button class="good" (click)="sendEmailPrint()">Send valgte til epost/utskrift</button>
                <button *ngIf="ehfService.isInvoicePrintActivated()" class="good" (click)="sendInvoicePrint()">
                    Send valgte til {{getInvoicePrintText()}}
                </button>
                <button class="warning" (click)="sendPrint()">Skriv ut valgte</button>
                <button class="bad" (click)="close()">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniReminderSendingMethodModal implements IUniModal {
    @Input()
    options: IModalOptions = {};

    @Output()
    onClose: EventEmitter<string> = new EventEmitter();

    public reminders: CustomReminder[];
    public tableConfig: UniTableConfig;

    constructor(
        public ehfService: EHFService,
        private distributionService: DistributionPlanService
    ) { }

    public ngOnInit() {
        this.reminders = this.options.data.reminders;
        this.setupTable();
    }

    private setupTable() {
        const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.');

        const customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Text);

        const customerNameCol = new UniTableColumn('CustomerName', 'Kunde');

        const emailCol = new UniTableColumn('EmailAddress', 'E-post', UniTableColumnType.Text);
        
        this.tableConfig = new UniTableConfig('sales.reminders.reminderSending', false, true, 25)
            .setColumnMenuVisible(false)
            .setMultiRowSelect(false)
            .setColumns([invoiceNumberCol, customerNumberCol, customerNameCol, emailCol]);
    }

    sendEmailPrint() {
        this.onClose.emit('SendEmailPrint');
    }

    sendPrint() {
        this.onClose.emit('SendPrint');
    }

    sendInvoicePrint() {
        this.onClose.emit('SendInvoicePrint');
    }

    getInvoicePrintText() {
        return this.distributionService.getElementTypeText(ElementType.Invoiceprint);
    }

    close() {
        this.onClose.emit();
    }
}
