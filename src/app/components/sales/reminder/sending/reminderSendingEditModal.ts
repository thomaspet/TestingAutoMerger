import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {ToastService, ToastType} from '@uni-framework//uniToast/toastService';
import {CustomerInvoiceReminderService} from '../../../../services/services';
import { LocalDate } from '@uni-entities';

@Component({
    selector: 'uni-remindersending-edit-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 35vw;">
            <header>
                <h1> Redigering </h1>
            </header>
            <article>
                <span style="font-size: 14px;">
                    Purring nr. <strong> {{ line.ReminderNumber }} </strong> for faktura <strong> {{ line.InvoiceNumber }} </strong>
                    til kunde <strong>{{ line.CustomerName }} </strong>
                </span>

                <form class="uni-html-form" style="margin-top: 1rem;">
                    <label>
                        <span style="flex: 0 0 100px;">E-post</span>
                        <input name="Epost" type="text" [(ngModel)]="line.EmailAddress">
                    </label>

                    <label *ngIf="line.StatusCode !== 42104">
                        <span style="flex: 0 0 100px;">Renter</span>
                        <input name="Renter" type="number" [(ngModel)]="line.InterestFeeCurrency">
                    </label>

                </form>

            </article>

            <footer class="center">
                <button class="c2a rounded" (click)="save()"> Lagre </button>
                <button (click)="close()">Avbryt</button>
            </footer>
        </section>
    `
})

export class UniReminderSendingEditModal implements OnInit, IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public line: any = {};

    constructor(
        private toast: ToastService,
        private reminderService: CustomerInvoiceReminderService,
    ) { }

    public ngOnInit() {
        this.line = this.options.data.line;
    }

    public save() {
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
        }, err => {
            this.toast.addToast('Kunne ikke lagre', ToastType.bad, 5, 'Noe gikk galt ved lagring. Sjekk at verdier stemmer.');
        });
    }

    public close() {
        this.onClose.emit(false);
    }
}
