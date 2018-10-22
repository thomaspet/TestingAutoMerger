import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {ToastService, ToastType} from '../../uniToast/toastService';
import {
    ErrorService,
    PaymentBatchService
} from '../../../../src/app/services/services';

import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';

@Component({
    template: `
        <section role="dialog" class="uni-modal uni-send-payment-modal">
            <header>
                <h1>{{options.header || 'Send med autobank'}}</h1>
            </header>
            <article>
                <div *ngIf="options.data.hasTwoStage">
                    <i class="material-icons">phone_android</i>
                    <p> {{ fieldText }} </p>
                </div>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <span class="warn" *ngIf="isEmpty">Passordet kan ikke være tomt</span>
                <button class="good" (click)="onGoodClick()">{{ okButtonText }}</button>
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

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<Object> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public isEmpty: boolean;
    public isFirstStage: boolean = true;
    public okButtonText: string = 'Betale';
    public fieldText: string = 'Fyll inn passord.';

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
        this.formFields$.next(this.getFormFields());

        const model: Object = {
            Password: '',
            Code: '',
            PaymentIds: this.options.data.PaymentIds || []
        };
        this.formModel$.next(model);
    }

    public onGoodClick() {
        const model = this.formModel$.getValue();
        if (model['Password']) {
            if (this.isFirstStage) {
                // Check if user has activated two stage authentification
                if (this.options.data.hasTwoStage) {
                    // Send password to the new action to start two stage authentification
                    this.paymentBatchService.sendPasswordToTwoFactor(model['Password']).subscribe((result) => {
                        // Code sent?
                       if (result) {
                           // Update modal to show stage 2 texts and form fields
                            this.isFirstStage = false;
                            this.options.header = 'Autentisering steg 2 - Kode på telefon';
                            this.fieldText = 'Vi har nå sendt en kode til nummeret du oppga da du tegnet autobank avtalen.' +
                                ' Vennligst skriv inn kode for å fortsette.';
                            this.okButtonText = 'Send kode';
                            this.formFields$.next(this.getFormFields(true));
                       }
                    }, err => this.errorService.handle(err));
               } else {
                   // Without two-stage authentification
                   this.paymentBatchService.sendAutobankPayment(model).subscribe((res) => {
                       this.onClose.emit('Sendingen er fullført');
                   }, err => this.errorService.handle(err));
               }
            } else {
                // When user has written password and gotten code
                // Check for code
                if (model['Code']) {
                    // Send PASSWORD, CODE and PAYMENTIDS as body
                    this.paymentBatchService.sendAutobankPayment(model).subscribe((res) => {
                        this.onClose.emit('Sendingen er fullført');
                    }, err => this.errorService.handle(err));
                } else {
                    // If code field is empty, show toast...
                    this.toastService.addToast('Vennligst fyll inn koden', ToastType.bad, 5);
                }
            }
        } else {
            this.isEmpty = true;
        }
    }

    public onBadClick() {
        this.onClose.emit('Sending avbrutt');
    }

    private getFormFields(isStageTwo: boolean = false): UniFieldLayout[] {
        return [
            <any> {
                EntityType: '',
                Property: isStageTwo ? 'Code' : 'Password',
                FieldType: FieldType.PASSWORD,
                Label: isStageTwo ? 'Tilsendt kode' : 'Passord'
            }
        ];
    }
}
