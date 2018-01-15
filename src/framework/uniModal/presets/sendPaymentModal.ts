import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uniModal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {ToastService, ToastType} from '../../uniToast/toastService';
import {
    ErrorService,
    PaymentBatchService
} from '../../../../src/app/services/services';

import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Send med autobank'}}</h1>
            </header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <span class="warn" *ngIf="isEmpty">Passordet kan ikke være tomt</span>
                <button class="good" (click)="onGoodClick()">Betale</button>
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
    private formModel$: BehaviorSubject<Object> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private isEmpty: boolean;

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private paymentBatchService: PaymentBatchService
    ) {}

    public ngOnInit() {
        this.formFields$.next(this.getFormFields());
        this.initFormModel();
    }

    public initFormModel() {
        const model: Object = this.options.data || { Password: '', PaymentBatchID: '' };
        this.formModel$.next(model);
    }

    public onGoodClick() {
        const model = this.formModel$.getValue();
        if (model['Password']) {
            this.paymentBatchService.SendToPayment(model['Password'], model['PaymentBatchID']).subscribe((res) => {
                this.onClose.emit('Sendingen er fullført');
            }, err => {
                this.errorService.handle(err);
                this.onClose.emit('Mislykket sending');
            });
        } else {
            this.isEmpty = true;
        }
    }

    public onBadClick() {
        this.onClose.emit('Sending avbrutt');
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: '',
                Property: 'Password',
                FieldType: FieldType.PASSWORD,
                Label: 'Password'
            }
        ];
    }
}
