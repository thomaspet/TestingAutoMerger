import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ToastService, ToastType, ToastTime} from '../../uniToast/toastService';
import {
    ErrorService,
    PaymentBatchService
} from '../../../../src/app/services/services';

@Component({
    template: `
        <section role="dialog" class="uni-modal uni-send-payment-modal uni-redesign">
            <header>
                <h1>{{options.header || 'Send med autobank'}}</h1>
            </header>
            <article>
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>
                <div *ngIf="options.data.hasTwoStage">
                    <i class="material-icons">phone_android</i>
                    <p> {{ fieldText }} </p>
                </div>
                <section class="uni-html-form bank-agreement-password-form">
                    <label *ngIf="!isFirstStage">
                        <span>Tilsendt kode</span>
                        <input type="password" autocomplete="new-password" [(ngModel)]="model.Code">
                    </label>
                    <label *ngIf="isFirstStage">
                        <span>Passord</span>
                        <input type="password" autocomplete="new-password" [(ngModel)]="model.Password">
                    </label>
                </section>
                <small *ngIf="msg" class="bad"> {{ msg }} </small>
            </article>

            <footer>
                <button class="good" [disabled]="!model.Password && !model.Code" (click)="onGoodClick()">{{ okButtonText }}</button>
                <button class="bad" (click)="onBadClick()">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniSendPaymentModal implements IUniModal, OnInit {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<string> = new EventEmitter();

    public isFirstStage: boolean = true;
    public okButtonText: string = 'Betale';
    public fieldText: string = 'Fyll inn passord.';
    public msg: string = '';
    public busy: boolean = false;
    public model: any = {
        Password: '',
        Code: '',
        PaymentIds: []
    };

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private paymentBatchService: PaymentBatchService
    ) {}

    public ngOnInit() {
        if (this.options.data.hasTwoStage) {
            this.options.header = 'Autentisering steg 1 - Passord';
            this.okButtonText = 'Send passord';
            this.fieldText = 'Du har slått på 2-faktor autentisering. Vennligst skriv inn ditt valgte passord, så sender vi deg en kode.';
        }
        this.model.PaymentIds = this.options.data.PaymentIds || [];
    }

    public onGoodClick() {
        this.msg = '';
        if (this.busy) {
            return;
        }

        if (this.model.Password) {
            if (this.isFirstStage) {
                // Check if user has activated two stage authentification
                if (this.options.data.hasTwoStage) {
                    this.busy = true;
                    // TWO-FACTOR DOES NOT SUPPORT SENDALL ATM!
                    // Send password to the new action to start two stage authentification
                    this.paymentBatchService.sendPasswordToTwoFactor(this.model).subscribe((result) => {
                        // Code sent?
                       if (result) {
                           // Update modal to show stage 2 texts and form fields
                            this.isFirstStage = false;
                            this.options.header = 'Autentisering steg 2 - Kode på telefon';
                            this.fieldText = 'Vi har nå sendt en kode til nummeret du oppga da du tegnet autobank avtalen.' +
                                ' Vennligst skriv inn kode for å fortsette.';
                            this.okButtonText = 'Fullfør betaling';
                       }
                       this.busy = false;
                    }, err => {
                        this.busy = false;
                        this.errorService.handle(err);
                    });
               } else {
                   // Without two-stage authentification
                    this.sendPayments();
               }
            } else {
                // When user has written password and gotten code
                // Check for code
                if (this.model.Code) {
                    // Send PASSWORD, CODE and PAYMENTIDS as body
                    this.sendPayments();
                } else {
                    // If code field is empty, show toast...
                    this.msg = 'Koden kan ikke være tom';
                    this.toastService.addToast('Vennligst fyll inn koden', ToastType.bad, 5);
                }
            }
        } else {
            this.msg = 'Fyll ut passord..';
        }
    }

    public handleAutobankError(response: any) {
        if (response.status === 400) { // Bad Request
            this.msg = 'Noe gikk galt. Sjekk at passordet ditt er korrekt';
            this.errorService.handle(response);
            this.busy = false;
        } else if (response.status === 500 && response.error && response.error.Message
            && response.error.Message.indexOf('invalid_grant - invalid_username_or_password') > 0) {
            this.msg = 'Noe gikk galt. Sjekk at passordet ditt er korrekt';
            this.busy = false;
        } else if (response.status === 504) { // Bad Gateway or Timeout
            this.msg = 'Noe gikk galt i overføring av betalinger. Vennligst sjekk med banken din om betalingen er mottatt';
            this.errorService.handle(response);
            this.busy = false;
        } else {
            this.errorService.handle(response);
            this.busy = false;
        }
    }

    public sendPayments() {
        this.busy = true;
        if (this.options.data.count && this.options.data.count > 100) {
        this.toastService.addToast('Utbetaling startet', ToastType.good, ToastTime.long,
                        'Avhengig av antall betalinger, kan dette ta litt tid. Vennligst vent.');
        }
        if (this.options.data.sendAll) {
            return this.paymentBatchService.sendAllToPayment(this.model).subscribe(res => {
                this.onClose.emit('Sendingen er fullført');
                this.busy = false;
            }, err => {
                this.handleAutobankError(err);
            });
        } else {
            return this.paymentBatchService.sendAutobankPayment(this.model).subscribe((res) => {
                this.busy = false;
                this.onClose.emit('Sendingen er fullført');
            }, err => {
                this.handleAutobankError(err);
            });
       }
    }

    public onBadClick() {
        this.onClose.emit('Sending avbrutt');
    }
}
