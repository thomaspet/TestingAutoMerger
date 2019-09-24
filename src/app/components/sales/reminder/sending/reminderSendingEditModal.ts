import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {ToastService, ToastType} from '@uni-framework//uniToast/toastService';
import {CustomerInvoiceReminderService} from '@app/services/services';
import {LocalDate} from '@uni-entities';

@Component({
    selector: 'uni-remindersending-edit-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 35rem">
            <header>Redigering</header>
            <article>
                <span style="font-size: 14px;">
                    Purring nr. <strong> {{ line.ReminderNumber }} </strong> for faktura <strong> {{ line.InvoiceNumber }} </strong>
                    til kunde <strong>{{ line.CustomerName }} </strong>
                </span>

                <form style="margin-top: 1rem;">
                    <label class="uni-label label-left">
                        <span style="width: 100px;">E-post</span>
                        <input name="Epost" type="text" [(ngModel)]="line.EmailAddress">
                    </label>

                    <label class="uni-label label-left" *ngIf="line.StatusCode !== 42104">
                        <span style="width: 100px;">Renter</span>
                        <input name="Renter" type="number" [(ngModel)]="line.InterestFeeCurrency">
                    </label>
                </form>
            </article>

            <footer>
                <button class="secondary" (click)="onClose.emit(false)">Avbryt</button>
                <button class="c2a" (click)="save()">Lagre</button>
            </footer>
        </section>
    `
})
export class UniReminderSendingEditModal implements OnInit, IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    line: any = {};

    constructor(
        private toast: ToastService,
        private reminderService: CustomerInvoiceReminderService,
    ) {}

    ngOnInit() {
        this.line = this.options.data.line;
    }

    save() {
        if (typeof this.line.DueDate === 'string') {
            this.line.DueDate = new LocalDate(this.line.DueDate.toString());
        }
        if (typeof this.line.RemindedDate === 'string') {
            this.line.RemindedDate = new LocalDate(this.line.RemindedDate.toString());
        }
        this.line.LastDistributionDate = undefined;
        this.line.LastDistributionStatus = undefined;
        this.line.LastDistributionType = undefined;
        this.reminderService.Put(this.line.ID, this.line).subscribe(() => {
            this.onClose.emit(this.line);
            this.toast.addToast('Endringer lagret', ToastType.good, 5);
        },
        () => {
            this.toast.addToast('Kunne ikke lagre', ToastType.bad, 5, 'Noe gikk galt ved lagring. Sjekk at verdier stemmer.');
        });
    }
}
