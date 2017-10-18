import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IModalOptions, IUniModal } from '../modalService';
import { UniFieldLayout, FieldType } from '../../ui/uniform/index';
import { ToastService, ToastType } from '../../uniToast/toastService';
import {
    CustomerInvoiceService,
    ErrorService
} from '../../../../src/app/services/services';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'uni-send-vipps-invoice-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{'Send til Vipps'}}</h1>
            </header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
                <span aria-busy="true" *ngIf="isLoading"></span>
                <span class="warn" *ngIf="isShowing">{{customLabel}}</span>
            </article>

            <footer>
                <span class="warn" *ngIf="invalidMessage">Meldingsfeltet kan ikke være tomt</span>
                <button class="good" *ngIf="isValidCustomer && !isShowing" (click)="onGoodClick()">Send</button>
                <button class="bad"  (click)="onBadClick()">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniSendVippsInvoiceModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    private formModel$: BehaviorSubject<Object> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private isValidCustomer: boolean = true;
    private isShowing: boolean = true;
    private isLoading: boolean = true;
    private invalidMessage: boolean;
    private customLabel: string;

    constructor(
        private toastService: ToastService,
        private customerInvoiceService: CustomerInvoiceService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {
        this.initFormModel()
    }

    public initFormModel() {
        this.customLabel = "Sjekker tilgjengelighet hos Vipps..."
        let model: Object = this.options.data || {Text:"", InvoiceID:""};
        this.formModel$.next(model);
        this.customerInvoiceService.validateVippsCustomer(this.formModel$.getValue()["InvoiceID"]).subscribe((res) => {
            this.isValidCustomer = res
            this.isLoading = false
            if (res) {
                this.isShowing = false
                this.formFields$.next(this.getFormFields());
            } else {
                this.customLabel = "Kunden er ikke registrert hos Vipps"
            }
        }, err => {
            this.errorService.handle(err);
            this.onClose.emit();
        });
    } 


    public onGoodClick() {
        const model = this.formModel$.getValue();
        
        if (model["Text"]) {
            this.customLabel = "Behandling..."
            this.isLoading = true
            this.isShowing = true
            this.customerInvoiceService.SendInvoiceToVippsWithText(model).subscribe((res) => {
                this.toastService.addToast(
                    'Sendingen er fullført',
                    ToastType.good,
                    5
                );
                this.isShowing = false
                this.isLoading = false
                this.onClose.emit();
            }, err => {
                this.errorService.handle(err);
                this.onClose.emit();
            });
        } else{
            this.invalidMessage = true;
        }
    }

    public onBadClick(){
        this.onClose.emit();
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any>{
                EntityType: '',
                Property: 'Text',
                FieldType: FieldType.TEXT,
                Label: 'Melding'
            }
        ];
    }
}
