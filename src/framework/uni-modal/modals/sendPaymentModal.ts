import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ToastService, ToastType, ToastTime} from '../../uniToast/toastService';
import {ErrorService, PaymentBatchService, PaymentService, BankService, UserService} from '@app/services/services';

@Component({
    template: `
        <section role="dialog" class="uni-modal uni-send-payment-modal">
            <header>{{options.header || 'Send med autobank'}}</header>
            <article>
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>
                <div *ngIf="options.data.hasTwoStage">
                    <i class="material-icons">phone_android</i>
                    <p> {{ fieldText }} </p>
                </div>
                <section>
                    <span class="info-text" *ngIf="isFirstStage"> Skriv inn ditt autobank passord for å sende betalinger til bank </span>
                    <label class="uni-label" *ngIf="!isFirstStage">
                        <span>Tilsendt kode</span>
                        <input type="password" autocomplete="new-password" [(ngModel)]="model.Code">
                    </label>
                    <label class="uni-label" *ngIf="isFirstStage">
                        <span>Passord</span>
                        <input type="password" autocomplete="new-password" [(ngModel)]="model.Password">
                    </label>
                </section>
                <span class="message-bottom-section">
                    <small *ngIf="msg" class="bad"> {{ msg }} </small>
                    <span></span>
                    <a *ngIf="isFirstStage" class="reset-password-link" (click)="resetPassword()">Nullstill passord</a>
                </span>

            </article>

            <footer>
                <button class="secondary" (click)="onBadClick()">Avbryt</button>
                <button class="c2a" [disabled]="!model.Password && !model.Code" (click)="onGoodClick()">
                    {{ okButtonText }}
                </button>
            </footer>
        </section>
    `
})
export class UniSendPaymentModal implements IUniModal, OnInit {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    isFirstStage: boolean = true;
    okButtonText: string = 'Send med autobank';
    fieldText: string = 'Fyll inn passord.';
    msg: string = '';
    busy: boolean = false;
    model: any = {
        Password: '',
        Code: '',
        PaymentIds: []
    };

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private paymentBatchService: PaymentBatchService,
        private paymentService: PaymentService,
        private bankService: BankService,
        private userService: UserService
    ) {}

    public ngOnInit() {
        if (this.options.data.hasTwoStage) {
            this.options.header = 'Autentisering steg 1 - Passord';
            this.okButtonText = 'Send passord';
            this.fieldText = 'Du har slått på 2-faktor autentisering. Vennligst skriv inn ditt autobankpassord, så sender vi deg en kode.';
        }
        this.model.PaymentIds = this.options.data.PaymentIds || [];
    }

    onGoodClick() {
        this.msg = '';
        if (!this.model.Password) {
            this.msg = 'Vennligst full ut passord';
            return;
        }

        if (this.isFirstStage) {
            // If user has activated two stage verification, send code
            if (this.options.data.hasTwoStage) {
                // TWO-FACTOR DOES NOT SUPPORT SENDALL ATM!
                // Send password to the new action to start two stage authentification
                this.paymentBatchService.sendPasswordToTwoFactor(this.model).subscribe((result) => {
                if (result) {
                    // Update modal to show stage 2 texts and form fields
                        this.isFirstStage = false;
                        this.options.header = 'Autentisering steg 2 - Kode på telefon';
                        this.fieldText = 'Vi har nå sendt en kode til nummeret du oppga da du tegnet autobank avtalen.' +
                            ' Vennligst skriv inn kode for å fortsette.';
                        this.okButtonText = 'Send med autobank';
                }
                this.busy = false;
                }, err => {
                    this.busy = false;
                    this.errorService.handle(err);
                });
            } else {
                // First check if password if corrent
                this.bankService.validateAutobankPassword(this.model.Password).subscribe((validPassword) => {
                    if (!validPassword) {
                        this.msg = 'Ugyldig passord';
                        this.busy = false;
                        return;
                    }
                    this.createAndSend();
                });
            }
        } else {
            // First check if password if corrent
            this.bankService.validateAutobankPassword(this.model.Password).subscribe((validPassword) => {
                if (!validPassword) {
                    this.msg = 'Ugyldig passord';
                    this.busy = false;
                    return;
                }
                this.createAndSend();
            });
        }
    }

    createAndSend = () => {
        let obs;
        if (this.options.data.sendAll) {
            obs = this.paymentService.createPaymentBatchForAll();
        } else {
            obs = this.paymentService.createPaymentBatch(this.model.PaymentIds, false);
        }

        obs.subscribe((result) => {
            const body = {
                Code: this.model.Code,
                Password: this.model.Password
            };
            if (result?.ProgressUrl) {
                // runs as hangfire job (decided by back-end)
                this.toastService.addToast('Utbetaling startet', ToastType.good, ToastTime.long,
                    'Det opprettes en betalingsjobb og genereres en utbetalingsfil som blir sendt til banken. ' +
                    'Avhengig av antall betalinger, kan dette ta litt tid. Vennligst vent.');
                this.paymentBatchService.waitUntilJobCompleted(result.ID).subscribe(batchJobResponse => {
                    if (batchJobResponse && !batchJobResponse.HasError && batchJobResponse.Result && batchJobResponse.Result.ID > 0) {
                        this.paymentBatchService.sendToPayment(batchJobResponse.Result.ID, body).subscribe(() => {
                            const toastString = `Betalingsbunt med ${ this.options.data.sendAll ? 'alle' : this.model.PaymentIds.length} `
                                + `utbetalinger er opprettet og sendt til bank`;

                            this.toastService.addToast('Sendt til bank', ToastType.good, 8, toastString);
                            this.onClose.emit(true);
                        });
                    } else {
                        this.toastService.addToast('Generering av betalingsbunt feilet', ToastType.bad, 0,
                            batchJobResponse.Result);
                    }
                });

            } else {
                this.paymentBatchService.sendToPayment(result.ID, body).subscribe(() => {
                    const toastString = `Betalingsbunt med ${ this.options.data.sendAll ? 'alle' : this.model.PaymentIds.length} `
                        + `utbetalinger er opprettet og sendt til bank`;

                    this.toastService.addToast('Sendt til bank', ToastType.good, 8, toastString);
                    this.onClose.emit(true);
                }, err => {
                    this.toastService.addToast('Kunne ikke sende til bank', ToastType.warn, 15,
                        'Vi har opprettet betalingsbunt, men klarte ikke sende den til bank. Betalingene er '
                        + 'flyttet til Under behandling fanen. Gå til Utbetalingsbunter for tilbakestille bunt og '
                        + 'behandle betalinger igjen, eller prøve å sende den på nytt.');
                    this.onClose.emit(true);
                });
            }
        }, err => this.handleAutobankError(err));
    }

    resetPassword() {
        this.busy = true;
        this.userService.changeAutobankPassword().subscribe(
            () => {
                this.toastService.addToast('E-post er sendt', ToastType.good, ToastTime.short);
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    public handleAutobankError(response: any) {
        this.busy = false;
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

    public onBadClick() {
        this.onClose.emit(false);
    }
}
