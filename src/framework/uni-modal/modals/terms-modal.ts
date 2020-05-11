import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TermsService } from '@app/services/services';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-terms-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header> {{ options?.header }}</header>
            <article>
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>
                <label class="uni-label">
                    <span>Navn</span>
                    <input type="text" [(ngModel)]="term.Name" />
                </label>
                <label class="uni-label">
                    <span>{{ daysHeader }}</span>
                    <input type="number" [(ngModel)]="term.CreditDays" />
                </label>
                <label class="uni-label">
                    <span>Beskrivelse</span>
                    <input type="text" [(ngModel)]="term.Description" />
                </label>
                <small style="color: var(--color-bad)"> {{ errorMsg }} </small>
            </article>
            <footer>
                <button (click)="close()" class="secondary"> Lukk </button>
                <button (click)="save()" class="c2a"> Lagre </button>
            </footer>
        </section>
    `
})
export class UniTermsModal implements IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    busy = false;
    term: any = {};
    daysHeader: string = '';
    errorMsg: string = '';

    constructor( private termsService: TermsService ) {}

    ngOnInit() {
        this.term = this.options.data;
        this.daysHeader = this.term.TermsType === 1 ? 'Kredittdager' : 'Leveringsdager';
    }

    save() {
        this.errorMsg = '';
        if (!this.term.Name || (!this.term.CreditDays && this.term.CreditDays !== 0)) {
            this.errorMsg = 'Kan ikke lagre betingelse uten navn eller ' + this.daysHeader.toLocaleLowerCase();
            return;
        }

        this.busy = true;
        const query = this.term.ID
            ? this.termsService.Put(this.term.ID, this.term)
            : this.termsService.Post(this.term);

        query.subscribe(res => {
            this.busy = false;
            if (res) {
                this.onClose.emit(true);
            }
        }, err => {
            this.errorMsg = 'Kunne ikke lagre betingelse. Lukk modal og prøv igjen.';
            this.busy = false;
        });
    }

    close() {
        this.onClose.emit(false);
    }
}